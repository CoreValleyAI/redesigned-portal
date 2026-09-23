CoreValley — moving the documentation to docs.corevalley.ai
=============================================================

Goal: serve the documentation at https://docs.corevalley.ai/ instead of
https://corevalley.ai/docs/, using GitHub Pages and a DNS CNAME record.

The docs are Markdown in corevalley-docs/docs/ with a MkDocs config in
corevalley-docs/mkdocs.yml. Today the main site renders those files itself at
/docs/. For a separate host the cleanest route is to publish the same Markdown
as a standalone MkDocs site from its own GitHub Pages deployment, then point
the main site's "Docs" links at it. Nothing about the content changes.

Time needed: about 30 minutes of clicking, plus DNS propagation (minutes to a
few hours). You need: admin on the CoreValleyAI GitHub organisation, and
access to the DNS for corevalley.ai (Cloudflare, your registrar, etc.).


-------------------------------------------------------------------------------
PART 1 — Create the docs repository
-------------------------------------------------------------------------------

One GitHub Pages site can carry one custom domain, and the main site already
uses the organisation's Pages slot for corevalley.ai. A subdomain therefore
needs its own repository (a "project site" with its own custom domain).

1.1  On GitHub, create a new repository in the CoreValleyAI organisation:
       Name:        docs
       Visibility:  Public (GitHub Pages on a private repo needs an
                    Enterprise plan; the docs are public anyway)
       Initialise:  empty (no README)

1.2  Copy the documentation source into it. From this repository:

       git clone https://github.com/CoreValleyAI/docs.git
       cd docs
       cp -r ../redesigned-portal/corevalley-docs/* .
       # you now have: mkdocs.yml  requirements.txt  docs/  logo/

1.3  Add the CNAME file that tells GitHub Pages which hostname to serve.
     MkDocs copies everything in docs/ into the built site, so put it there:

       echo "docs.corevalley.ai" > docs/CNAME

1.4  mkdocs.yml already carries the new host, so canonical links and the
     sitemap MkDocs generates are right without edits:

       site_url:  !ENV [DOCS_SITE_URL, "https://docs.corevalley.ai"]
       repo_name: CoreValleyAI/docs
       repo_url:  https://github.com/CoreValleyAI/docs

     (If the repository is named differently, change the last two.)

1.5  Add the build-and-deploy workflow. Create
     .github/workflows/deploy-docs.yml in the docs repository:

       name: Deploy docs
       on:
         push:
           branches: [main]
         workflow_dispatch:
       permissions:
         contents: read
         pages: write
         id-token: write
       concurrency:
         group: pages
         cancel-in-progress: true
       jobs:
         build:
           runs-on: ubuntu-latest
           steps:
             - uses: actions/checkout@v5
             - uses: actions/setup-python@v5
               with:
                 python-version: "3.12"
             - run: pip install -r requirements.txt
             - run: mkdocs build --strict
               env:
                 DOCS_SITE_URL: https://docs.corevalley.ai
             - uses: actions/upload-pages-artifact@v4
               with:
                 path: site
         deploy:
           needs: build
           runs-on: ubuntu-latest
           environment:
             name: github-pages
             url: ${{ steps.deployment.outputs.page_url }}
           steps:
             - id: deployment
               uses: actions/deploy-pages@v4

     --strict makes a broken internal link fail the build instead of shipping
     a 404. If it fails on the placeholder pages' external links, drop
     --strict for now.

1.6  Commit and push:

       git add -A
       git commit -m "Documentation site"
       git push -u origin main

1.7  Turn on Pages: repository Settings → Pages → Build and deployment →
     Source: "GitHub Actions". The workflow from 1.5 runs on the push and
     publishes to https://corevalleyai.github.io/docs/ first.


-------------------------------------------------------------------------------
PART 2 — DNS: point docs.corevalley.ai at GitHub Pages
-------------------------------------------------------------------------------

2.1  In the DNS for corevalley.ai add one record:

       Type:   CNAME
       Name:   docs            (some panels want the full name: docs.corevalley.ai)
       Target: corevalleyai.github.io
       TTL:    Auto / 3600

     Note the target is the ORGANISATION's github.io host, not
     corevalleyai.github.io/docs — the path is resolved by GitHub from the
     CNAME file, not by DNS.

     Cloudflare users: set the record to "DNS only" (grey cloud) at least
     until HTTPS is issued in Part 3. Proxied records can prevent GitHub from
     validating the domain. You can turn the proxy back on afterwards with
     SSL mode "Full".

2.2  Check propagation from your machine:

       nslookup docs.corevalley.ai
       # expect: canonical name = corevalleyai.github.io

     or https://dnschecker.org → CNAME → docs.corevalley.ai.


-------------------------------------------------------------------------------
PART 3 — Tell GitHub about the domain, and get HTTPS
-------------------------------------------------------------------------------

3.1  Verify the domain for the organisation (recommended: it stops anyone
     else pointing a CoreValleyAI Pages site at a corevalley.ai subdomain).
     Organisation Settings → Pages → Add a domain → corevalley.ai → GitHub
     shows a TXT record like:

       Type:  TXT
       Name:  _github-pages-challenge-corevalleyai.corevalley.ai
       Value: <token>

     Add it in DNS, wait a few minutes, click Verify. Verifying the apex
     covers every subdomain, including docs and status.

3.2  In the docs repository: Settings → Pages → Custom domain → enter
     docs.corevalley.ai → Save. GitHub runs a DNS check; when it passes, tick
     "Enforce HTTPS". The certificate is issued automatically (Let's Encrypt)
     and usually takes 5–30 minutes. If the box is greyed out, DNS has not
     propagated yet; wait and reload.

3.3  Open https://docs.corevalley.ai/ — the MkDocs site should load with a
     valid certificate. https://corevalleyai.github.io/docs/ now redirects
     there.


-------------------------------------------------------------------------------
PART 4 — Point the main site at the new host
-------------------------------------------------------------------------------

The main site reads one variable, NEXT_PUBLIC_DOCS_URL. When it is set, every
"Docs" link (header, footer, 404 page, home page) points at that host, and the
in-app /docs/ pages drop out of the sitemap so search engines see one copy.

4.1  In THIS repository: Settings → Secrets and variables → Actions →
     Variables → New repository variable:

       Name:  DOCS_URL
       Value: https://docs.corevalley.ai

     The deploy workflow passes it to the build as NEXT_PUBLIC_DOCS_URL.

4.2  Trigger a deploy (push to main, or Actions → Deploy to GitHub Pages →
     Run workflow). Check a built page: the header's Docs link should be
     https://docs.corevalley.ai/.

4.3  Old URLs stay alive automatically. With DOCS_URL set, every in-app docs
     page still builds, but it now (a) redirects the visitor to the same
     path on the new host before rendering (corevalley.ai/docs/guides/
     quickstart/ → docs.corevalley.ai/guides/quickstart/), (b) shows a
     "moved to" link for visitors without JavaScript, (c) declares the new
     host's copy as canonical and marks itself noindex, and (d) drops out of
     the sitemap. Nothing to add by hand.

4.4  Search Console: add https://docs.corevalley.ai/ as a new property (or
     use the domain property for corevalley.ai, which covers subdomains) and
     submit https://docs.corevalley.ai/sitemap.xml — MkDocs generates it.


-------------------------------------------------------------------------------
PART 5 — Day-to-day
-------------------------------------------------------------------------------

- Editing docs: change Markdown under docs/ in the docs repository and push.
  The workflow rebuilds and publishes in about a minute.
- Two copies of the Markdown exist for a while (corevalley-docs/ here and the
  docs repository). Pick one as the source: either delete corevalley-docs/
  from this repository once the subdomain is live (and remove the in-app docs
  routes, lib/docs and the docs:check script), or make the docs repository a
  git submodule at corevalley-docs/. Deleting is simpler.
- Local preview of the MkDocs site:

    pip install -r requirements.txt
    mkdocs serve      # http://127.0.0.1:8000


-------------------------------------------------------------------------------
Troubleshooting
-------------------------------------------------------------------------------

"Domain's DNS record could not be retrieved"   DNS has not propagated, or
  the CNAME points at the wrong host. It must be corevalleyai.github.io.

"Enforce HTTPS" unavailable                     Wait for DNS to propagate;
  if Cloudflare, switch the record to DNS-only until the certificate exists.

Page shows the main site or a 404 after DNS     The CNAME file is missing
  from the built site (it must be inside docs/ so MkDocs copies it) or the
  custom domain was not saved in the docs repository's Pages settings.

Certificate warning                             Wait up to an hour after
  ticking Enforce HTTPS. If it persists, remove and re-add the custom domain.

Old links to corevalley.ai/docs/... still index Confirm NEXT_PUBLIC_DOCS_URL
  is set on the main-site build (the sitemap should no longer list /docs/)
  and the redirect from 4.3 is in place; then request re-indexing in Search
  Console.
