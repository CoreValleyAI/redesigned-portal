/**
 * What is on offer, worded in exactly one place (docs/revamp/04 §3). Every
 * status on the site is rendered by <Status>, which reads from here, so no
 * page can say "coming soon" while another says "available".
 *
 * Owner instruction (Oct 2026): every GPU, the H200 NVL included, is coming
 * soon; enterprises can join early access. The region is being
 * commissioned until the first GPU is available.
 */

export type Availability = "live" | "coming-soon" | "next";

export interface StatusLine {
  state: Availability;
  /** The kicker: two or three words. */
  label: string;
  /** What it means for the visitor, in one short line. */
  detail: string;
}

export type StatusId = "h200" | "region";

export const STATUS: Record<StatusId, StatusLine> = {
  h200: {
    state: "coming-soon",
    label: "Coming soon",
    detail: "Enterprise early access is open",
  },
  region: {
    state: "coming-soon",
    label: "Being commissioned",
    detail: "Kathmandu Valley",
  },
};

/** The reply promise, for Contact and Pricing only (03 §3). */
export const REPLY_PROMISE =
  "Tell us what you want to run. We reply within one working day with a capacity plan and a firm quote in rupees.";
