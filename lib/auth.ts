/**
 * NextAuth.js v5 (Auth.js) configuration for the CoreValley console.
 *
 * Two modes, chosen at import time by whether KEYCLOAK_ISSUER is set:
 *
 *   keycloak - real OIDC against a Keycloak realm. Registration, password
 *              reset and MFA are Keycloak's job; we only consume the tokens.
 *   mock     - a Credentials provider that hands back a canned CoreValley
 *              user so the portal is usable with no external services (see
 *              docker-compose.yml for the real thing).
 *
 * Both modes produce the same session shape, so every consumer -
 * middleware.ts, server components, useSession() - is mode-agnostic.
 *
 * Mock mode is opt-in and development-only: it must be asked for with
 * AUTH_ALLOW_MOCK=true and refuses to load under NODE_ENV=production. A build
 * that reaches neither mode throws here rather than starting, because the
 * alternative - falling back to a provider that authenticates everyone - is
 * an open door, not a degraded service. See the guard below.
 */
import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { CoreValleyRole } from "@/types/next-auth";

/* --------------------------------------------------------------------------
   Environment
   -------------------------------------------------------------------------- */

/** e.g. http://localhost:8080/realms/corevalley - must include the realm. */
export const KEYCLOAK_ISSUER =
  process.env.KEYCLOAK_ISSUER ?? process.env.AUTH_KEYCLOAK_ISSUER ?? "";

const KEYCLOAK_CLIENT_ID =
  process.env.KEYCLOAK_CLIENT_ID ??
  process.env.AUTH_KEYCLOAK_ID ??
  "corevalley-portal";

const KEYCLOAK_CLIENT_SECRET =
  process.env.KEYCLOAK_CLIENT_SECRET ?? process.env.AUTH_KEYCLOAK_SECRET ?? "";

/**
 * Single source of truth for which mode we are in. Server-only - the client
 * receives it through <Providers keycloak={...}> rather than a second,
 * hand-synchronised NEXT_PUBLIC_* variable.
 */
export const isKeycloakEnabled = KEYCLOAK_ISSUER.length > 0;

/**
 * The static GitHub Pages export has no server at all - no route handler, no
 * middleware, no session cookie. It imports this module only for MOCK_SESSION
 * and the mode flags, so the guards below do not apply to it; applying them
 * would fail the Pages build for a target that cannot authenticate anyone in
 * the first place.
 */
const STATIC_EXPORT = process.env.NEXT_STATIC_EXPORT === "true";

/**
 * Mock mode hands out a session to anyone who asks - `authorize()` below
 * performs no verification. That is fine on a developer's laptop and a
 * catastrophe anywhere else, so it is never the fallback for a missing
 * KEYCLOAK_ISSUER: it has to be requested explicitly, and never in production.
 */
export const isMockEnabled =
  !isKeycloakEnabled &&
  !STATIC_EXPORT &&
  process.env.NODE_ENV !== "production" &&
  process.env.AUTH_ALLOW_MOCK === "true";

/* Fail closed at import time. A server that cannot authenticate should refuse
   to start, not start with authentication disabled. */
if (!isKeycloakEnabled && !STATIC_EXPORT) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "KEYCLOAK_ISSUER is not set. A production build must authenticate against " +
        "a real identity provider; mock mode is development-only and is not a " +
        "supported deployment configuration. Set KEYCLOAK_ISSUER (including the " +
        "realm path, e.g. https://id.example.com/realms/corevalley), or build " +
        "the static demo with NEXT_STATIC_EXPORT=true.",
    );
  }
  if (!isMockEnabled) {
    throw new Error(
      "KEYCLOAK_ISSUER is not set and mock mode was not enabled. Mock mode signs " +
        "in any visitor without credentials, so it must be opted into: set " +
        "AUTH_ALLOW_MOCK=true in .env.local for local development, or set " +
        "KEYCLOAK_ISSUER to use a real identity provider (npm run keycloak:up).",
    );
  }
}

/** The provider id the sign-in button must use. */
export const AUTH_PROVIDER_ID = isKeycloakEnabled ? "keycloak" : "mock";

/**
 * Keycloak serves registration from a sibling of the authorization endpoint
 * (`/protocol/openid-connect/registrations`) rather than a parameter on it, so
 * "Create an account" needs its own provider entry pointed at that URL. Both
 * entries share the client, the realm and the callback handling; only the
 * screen the user first sees differs.
 */
export const AUTH_REGISTER_PROVIDER_ID = isKeycloakEnabled
  ? "keycloak-register"
  : "mock";

/* Signs and encrypts the session JWT. There is deliberately no fallback: a
   default committed to the repository is a published key, and anyone holding
   it can mint a session cookie for any deployment still using it. Mock mode is
   no exception - it issues real cookies against a real server. A per-process
   random value is not an option either, since middleware (Edge) and the route
   handler (Node) are separate runtimes and would derive different keys. */
const AUTH_SECRET = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

if (!STATIC_EXPORT && !AUTH_SECRET) {
  throw new Error(
    "AUTH_SECRET is not set. It signs the session cookie and has no safe " +
      "default. Generate one with `npx auth secret` (or `openssl rand -base64 " +
      "32`) and put it in .env.local.",
  );
}

/** The user every mock-mode session resolves to, and the identity behind the
 *  public static demo. Deliberately a `member` rather than an `admin`: this is
 *  the one identity nobody authenticates to reach, so it gets the lower of the
 *  two roles. Sign in against the seeded Keycloak admin
 *  (keycloak/corevalley-realm.json) to exercise admin-only screens. */
export const MOCK_USER = {
  id: "mock-user-001",
  name: "Kaustuv Bhattarai",
  email: "kaustuv@corevalley.ai",
  role: "member" as CoreValleyRole,
  org: "CoreValley",
};

/** The same user shaped as a Session, for the static export where there is no
 *  /api/auth/session to fetch one from. */
export const MOCK_SESSION: Session = {
  user: { ...MOCK_USER, image: null },
  expires: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
};

/* --------------------------------------------------------------------------
   Token -> CoreValleyUser mapping
   -------------------------------------------------------------------------- */

/** Keycloak puts realm roles under `realm_access.roles` (see the "realm roles"
 *  protocol mapper in the realm export). Anything else is a plain member. */
function roleFromProfile(profile: Record<string, unknown>): CoreValleyRole {
  const realmAccess = profile["realm_access"] as { roles?: unknown } | undefined;
  const roles = Array.isArray(realmAccess?.roles) ? realmAccess.roles : [];
  return roles.includes("admin") ? "admin" : "member";
}

/** `org` is a custom user attribute exposed through a protocol mapper. Falls
 *  back to the email domain so users created before the mapper still resolve. */
function orgFromProfile(profile: Record<string, unknown>): string | null {
  const org = profile["org"];
  if (typeof org === "string" && org.length > 0) return org;
  if (Array.isArray(org) && typeof org[0] === "string") return org[0];
  const email = profile["email"];
  if (typeof email === "string" && email.includes("@")) {
    return email.split("@")[1] ?? null;
  }
  return null;
}

/** Exchanges the Keycloak refresh token for a fresh access token. On failure
 *  the session is marked so the UI can force a re-authentication. */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    return { ...token, error: "RefreshAccessTokenError" };
  }
  try {
    const res = await fetch(
      `${KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: KEYCLOAK_CLIENT_ID,
          client_secret: KEYCLOAK_CLIENT_SECRET,
          refresh_token: token.refreshToken,
        }),
      },
    );
    const data = (await res.json()) as {
      access_token?: string;
      id_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };
    if (!res.ok || !data.access_token) throw new Error("refresh failed");

    return {
      ...token,
      accessToken: data.access_token,
      idToken: data.id_token ?? token.idToken,
      refreshToken: data.refresh_token ?? token.refreshToken,
      expiresAt: Math.floor(Date.now() / 1000) + (data.expires_in ?? 300),
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

/* --------------------------------------------------------------------------
   Configuration
   -------------------------------------------------------------------------- */

export const authConfig: NextAuthConfig = {
  secret: AUTH_SECRET,
  /* Behind Docker / a tunnel the Host header is the only thing that resolves
     the callback URL correctly. */
  trustHost: true,

  providers: isKeycloakEnabled
    ? [
        Keycloak({
          clientId: KEYCLOAK_CLIENT_ID,
          clientSecret: KEYCLOAK_CLIENT_SECRET,
          issuer: KEYCLOAK_ISSUER,
          authorization: { params: { scope: "openid profile email" } },
        }),
        Keycloak({
          id: AUTH_REGISTER_PROVIDER_ID,
          name: "CoreValley (register)",
          clientId: KEYCLOAK_CLIENT_ID,
          clientSecret: KEYCLOAK_CLIENT_SECRET,
          issuer: KEYCLOAK_ISSUER,
          /* Overriding only `url` keeps discovery for the token, userinfo and
             jwks endpoints; the user lands on Register instead of Sign in. */
          authorization: {
            url: `${KEYCLOAK_ISSUER}/protocol/openid-connect/registrations`,
            params: { scope: "openid profile email" },
          },
        }),
      ]
    : isMockEnabled
      ? [
          Credentials({
            id: "mock",
            name: "CoreValley (mock)",
            credentials: {},
            /* No verification on purpose: mock mode exists so the console can
               be developed without Keycloak. Reaching this array at all
               requires AUTH_ALLOW_MOCK=true on a non-production build - see
               the import-time guard above. */
            authorize: async () => MOCK_USER,
          }),
        ]
      : /* Static export only: no server, so nothing ever handles a sign-in.
           Registering no provider means a stray deployment of this build
           cannot authenticate anyone rather than defaulting to the open
           mock provider. */
        [],

  /* JWT sessions keep middleware on the Edge runtime - no database round trip
     per request, which a session-table strategy would require. */
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },

  pages: {
    /* The marketing home page owns the sign-in modal; NextAuth's own
       /api/auth/signin page is never shown. */
    signIn: "/",
    error: "/",
  },

  callbacks: {
    async jwt({ token, account, profile, user }) {
      /* First call after a successful sign-in: `account` and `profile` (OIDC)
         or `user` (credentials) are present. Later calls only get `token`. */
      if (account && profile) {
        const p = profile as Record<string, unknown>;
        if (typeof p["sub"] === "string") token.sub = p["sub"];
        token.name =
          (p["name"] as string | undefined) ??
          (p["preferred_username"] as string | undefined) ??
          token.name;
        token.email = (p["email"] as string | undefined) ?? token.email;
        token.picture = (p["picture"] as string | undefined) ?? token.picture;
        token.role = roleFromProfile(p);
        token.org = orgFromProfile(p);

        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      } else if (user) {
        /* Mock mode. */
        token.sub = user.id ?? MOCK_USER.id;
        token.name = user.name ?? MOCK_USER.name;
        token.email = user.email ?? MOCK_USER.email;
        token.role = user.role ?? MOCK_USER.role;
        token.org = user.org ?? MOCK_USER.org;
      }

      /* Keycloak access tokens are short (15 min in the seeded realm) while
         the NextAuth session lasts hours. Refresh silently so a long console
         session does not break API calls made with the access token. */
      if (
        isKeycloakEnabled &&
        token.expiresAt &&
        Date.now() >= token.expiresAt * 1000 - 30_000
      ) {
        return refreshAccessToken(token);
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.name = token.name ?? null;
        session.user.email = token.email ?? "";
        session.user.image = token.picture ?? null;
        session.user.role = token.role ?? "member";
        session.user.org = token.org ?? null;
      }
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },

    /* Used when `auth` wraps middleware. Returning a boolean here would make
       NextAuth own the redirect; middleware.ts needs the callbackUrl to point
       back at the requested portal page, so it does the check itself. */
    async authorized({ auth: session }) {
      return !!session;
    },
  },

  events: {
    /* RP-initiated logout: without this the Keycloak SSO cookie survives and
       the next sign-in silently succeeds without a prompt. */
    async signOut(message) {
      if (!isKeycloakEnabled) return;
      const idToken = "token" in message ? message.token?.idToken : undefined;
      if (!idToken) return;
      try {
        const url = new URL(`${KEYCLOAK_ISSUER}/protocol/openid-connect/logout`);
        url.searchParams.set("id_token_hint", idToken);
        await fetch(url, { method: "GET" });
      } catch {
        /* A failed back-channel logout must not break the local sign-out. */
      }
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
