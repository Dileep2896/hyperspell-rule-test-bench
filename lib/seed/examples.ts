// ~40 synthetic snippets that read like workspace content. ALL FICTION. Keys like AKIA... and
// sk_live_... are placeholders. These are the "should match / should not match" examples an
// admin would write; the bench never loads real org documents.
import type { Example, ExampleLabel } from "../types";

const e = (id: string, title: string, label: ExampleLabel, connection: string, text: string): Example => ({
  id, title, label, text, source: { connectionIds: [connection] }, synthetic: true,
});

export const compensationExamples: Example[] = [
  e("comp-offer", "Offer letter: Marco Ruiz", "match", "gmail-priya",
    "Offer letter for Marco Ruiz: L4 pay band $165–190k base salary plus 0.1% equity, vesting over four years."),
  e("comp-q3", "Q3 planning", "match", "notion",
    "Q3 planning. Ship SSO and the audit log by August. Engineering pay bands move up 4% and Dana's team gets two new L5 levels."),
  e("comp-bonus", "Re: year-end payouts", "match", "gmail-dana",
    "Lee's year-end bonus money ($12k) and his RSU refresh of 2,000 units land on the March pay run."),
  e("comp-raise", "Priya comp review", "match", "drive",
    "Priya's salary goes from $150k to $162k in March, and her pay review lands with the new comp ladder."),
  e("fun-run", "Charity fun run sign-ups", "no-match", "gmail-priya",
    "Charity fun run sign-ups are open for Saturday. Pay the $25 registration, all money goes to the food bank."),
  e("figma-invoice", "Vendor invoice: Figma", "no-match", "gmail-dana",
    "Vendor invoice: Figma, Organization plan for 40 seats. Please pay by Friday so we don't lose money on late fees."),
  e("offsite", "Team offsite agenda", "no-match", "notion",
    "Team offsite agenda: hiking in the morning, roadmap retro after lunch, dinner at 7."),
  e("linear-sso", "ENG-482 SSO login loop", "no-match", "linear",
    "Linear ENG-482: SSO login loops when the IdP returns a stale session cookie. Repro steps attached."),
];

export const legalExamples: Example[] = [
  e("legal-msa", "Globex MSA redlines", "match", "gmail-priya",
    "Outside counsel's redlines on the Globex MSA: strike the uncapped indemnity clause."),
  e("legal-patent", "Privileged: patent question", "match", "gmail-dana",
    "Privileged and confidential: our attorney thinks the patent claim against us is weak."),
  e("legal-nda", "Initech mutual NDA", "match", "drive",
    "Mutual NDA with Initech, counsel approved version 3 this morning."),
  e("legal-hold", "Litigation hold notice", "match", "gmail-priya",
    "Litigation hold from outside counsel: preserve all Slack messages about Project Falcon."),
  e("legal-pad", "Office supplies", "no-match", "slack-dm-lee",
    "Office supplies run: legal pads, pens and coffee filters for the 4th floor."),
  e("legal-copy", "Pricing page copy", "no-match", "notion",
    "Marketing site copy for the pricing page is ready for a final read."),
  e("legal-metrics", "Weekly metrics", "no-match", "notion",
    "Weekly metrics: 312 active orgs, churn flat, NPS up two points."),
];

export const credentialExamples: Example[] = [
  e("cred-aws", "staging creds", "match", "slack-dm-marco",
    "Here's the staging AWS key: AKIAEXAMPLEEXAMPLE and the secret is pinned in 1Password."),
  e("cred-db", "analytics replica", "match", "slack-dm-lee",
    "DB password for the analytics replica is hunter2-EXAMPLE, rotate it after the demo."),
  e("cred-stripe", "Stripe prod key", "match", "slack-dm-marco",
    "New Stripe API key for prod: sk_live_EXAMPLE (do not paste in channels)."),
  e("cred-gh", "deploy bot token", "match", "linear",
    "The GitHub personal access token for the deploy bot expires Monday; generate a new token."),
  e("cred-badge", "Badge access change", "no-match", "notion",
    "Reminder: badge access to the 4th floor changes Monday."),
  e("cred-keynote", "Keynote deck", "no-match", "drive",
    "The keynote deck for the customer summit is in the shared folder."),
  e("cred-lunch", "Lunch order", "no-match", "slack-dm-lee",
    "Lunch order for Thursday: tacos for 12, two vegetarian."),
];

export const customerCallExamples: Example[] = [
  e("call-acme", "Acme discovery call", "match", "granola-priya",
    "Discovery call with Acme: their champion asked whether SSO works with Okta and if audit logs export to S3."),
  e("call-globex", "Globex demo", "match", "granola-dana",
    "Granola notes, Globex demo: the prospect wants per-team permissions before signing."),
  e("call-initech", "Initech call recap", "match", "granola-priya",
    "Call recap with Initech: the customer is blocked on the Salesforce connector and wants a fix by Q4."),
  e("call-umbrella", "Umbrella customer meeting", "match", "granola-dana",
    "Customer meeting with Umbrella: they asked for EU data residency and a security review packet."),
  e("call-hooli", "Hooli renewal", "match", "granola-priya",
    "Renewal call with the Hooli account team: usage doubled and the customer wants the enterprise tier."),
  e("call-stark", "Stark demo", "match", "granola-dana",
    "Prospect demo for Stark Industries went well; the next meeting is with their CISO."),
  e("call-wayne", "Wayne QBR", "match", "granola-priya",
    "QBR meeting with client Wayne Corp: they rely on the Notion connector daily."),
  e("call-followup", "Acme follow-up", "match", "gmail-priya",
    "Follow-up notes for Acme: send the SOC 2 report and the pricing sheet before Thursday."),
  e("call-quote", "Transcript excerpt", "match", "granola-dana",
    "Transcript excerpt: 'We lose a day every time someone leaves and takes the context with them.'"),
  e("call-standup", "Internal standup", "no-match", "granola-priya",
    "Internal standup meeting: Lee is out Friday and Marco owns on-call this week."),
  e("call-board", "Board prep", "no-match", "gmail-dana",
    "Board prep: update the runway slide and the hiring plan before Monday."),
  e("call-1on1", "1:1 with Dana", "no-match", "granola-priya",
    "1:1 notes with Dana about her promotion case and growth goals."),
  e("call-dentist", "Personal reminder", "no-match", "gmail-dana",
    "Dentist appointment moved to Tuesday 3pm."),
];

export const productMeetingExamples: Example[] = [
  e("pm-roadmap", "Roadmap review", "match", "granola-priya",
    "Roadmap review: Q4 ships per-team audiences and the Gmail connector rewrite."),
  e("pm-planning", "Product planning", "match", "granola-dana",
    "Product planning meeting notes: cut the mobile app and double down on MCP."),
  e("pm-spec", "Content rules v2 spec", "match", "gmail-priya",
    "Spec review for content rules v2: thresholds per rule and an owner consent flow."),
  e("pm-sprint", "Sprint planning", "match", "granola-priya",
    "Sprint planning: Marco takes the Slack connector bugs and Lee owns onboarding."),
  e("pm-launch", "CLI launch meeting", "match", "granola-dana",
    "Feature launch meeting for the CLI: docs, changelog and a demo video."),
  e("pm-kitchen", "Kitchen rota", "no-match", "gmail-dana",
    "Kitchen cleaning rota for October is on the fridge."),
  e("pm-flight", "Flight", "no-match", "gmail-priya",
    "Marco's flight to NYC lands at 6pm."),
  e("pm-acme", "Acme pricing call", "no-match", "granola-priya",
    "Quick call with Acme about SSO pricing tiers."),
];

/** Extra snippets that only appear in starter packs (not attached to a seed rule). */
export const starterExtras: Record<string, Example[]> = {
  compensation: [
    e("sp-comp-equity", "Equity refresh", "match", "gmail-priya",
      "Equity refresh for the platform team: 1,500 options each, vesting monthly after a one-year cliff."),
    e("sp-comp-lunch", "Team lunch", "no-match", "slack-dm-lee",
      "I'll pay for lunch today, you get the next one."),
  ],
  legal: [
    e("sp-legal-dpa", "DPA redline", "match", "gmail-dana",
      "Counsel sent back the DPA redline; clause 7 on sub-processors is still open."),
    e("sp-legal-trivia", "Trivia night", "no-match", "slack-dm-marco",
      "Trivia night theme is courtroom dramas, costumes optional."),
  ],
  credentials: [
    e("sp-cred-ssh", "SSH key", "match", "slack-dm-marco",
      "Pasting the private key for the bastion host here until the vault is fixed."),
    e("sp-cred-keyboard", "Keyboard", "no-match", "slack-dm-lee",
      "My new mechanical keyboard arrives Friday."),
  ],
  "customer-calls": [
    e("sp-call-churn", "Churn call", "match", "granola-dana",
      "Save call with the customer at Vandelay: they want a cheaper plan or they churn in May."),
    e("sp-call-podcast", "Podcast recording", "no-match", "gmail-priya",
      "Podcast recording with our CEO is moved to next week."),
  ],
  "product-meetings": [
    e("sp-pm-prd", "PRD review", "match", "granola-priya",
      "PRD review for the desktop client: offline mode is in, themes are out."),
    e("sp-pm-party", "Holiday party", "no-match", "gmail-dana",
      "Holiday party planning: the venue holds 80 people."),
  ],
};

export const allExamples: Example[] = [
  ...compensationExamples,
  ...legalExamples,
  ...credentialExamples,
  ...customerCallExamples,
  ...productMeetingExamples,
  ...Object.values(starterExtras).flat(),
];
