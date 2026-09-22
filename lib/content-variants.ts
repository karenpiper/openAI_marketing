import type { AgentState } from "./agent-workspace";
import {
  contentSourceOptions,
  selectedContentSource,
} from "./content-source-library";

// Fictional account context for the prototype, never customer data.
const accountNames = [
  "Northstar Health",
  "Cedar & Finch",
  "Meridian Logistics",
  "Solstice Energy",
  "Harborline Bank",
  "Aperture Retail Group",
  "Beacon Manufacturing",
  "Cobalt Insurance",
  "Fieldstone Media",
  "LumenWorks",
  "Redwood Mobility",
  "Vantage Partners",
];
export const exampleAccounts = accountNames.map((name, i) => ({
  id: `ACCT-${String(i + 1).padStart(2, "0")}`,
  name,
  context: [
    "A technical team completed two workspace projects in the last 30 days",
    "An existing team is evaluating an expansion into a second business unit",
    "The account team is preparing a security and governance review",
  ][i % 3],
  focus: [
    "a bounded evaluation plan",
    "cross-team adoption",
    "governance readiness",
  ][i % 3],
}));
export function contentVariants(
  s: Pick<AgentState, "audience">,
  sourceId?: string,
) {
  const sourceSet =
    sourceId
      ? contentSourceOptions.find((source) => source.id === sourceId) ||
        contentSourceOptions[0]
      : "process" in s
      ? selectedContentSource(s as AgentState)
      : contentSourceOptions[0];
  const recipients =
    s.audience === "Buying roles"
      ? [
          { name: "Maya Chen", role: "Technical evaluator", signal: "completed two workspace projects and attended the enterprise roundtable", headline: "Define a practical evaluation", detail: "Agree a bounded use case and the criteria your team would use to assess it.", cta: "Review the evaluation guide" },
          { name: "Rafael Ortiz", role: "Business sponsor", signal: "has not yet joined the evaluation conversation", headline: "Connect adoption to a business priority", detail: "Choose the operating outcome your team needs to improve and a useful first proof point.", cta: "Discuss the adoption plan" },
          { name: "Aisha Khan", role: "Procurement lead", signal: "returned twice to the governance and security guide", headline: "Prepare the governance conversation", detail: "Identify the documentation and review questions your team needs before moving forward.", cta: "Review governance considerations" },
        ]
      : s.audience === "Lifecycle stages"
        ? [
            { name: "Leah Park", role: "Exploring", signal: "visited the adoption overview after the roundtable", headline: "Find a useful starting point", detail: "Choose one workflow where a small evaluation could answer a meaningful question.", cta: "Explore the adoption guide" },
            { name: "Maya Chen", role: "Evaluating", signal: "completed two workspace projects in the last 30 days", headline: "Shape the next evaluation", detail: "Define the scope, evidence and success criteria for your evaluation.", cta: "Review the evaluation guide" },
            { name: "Aisha Khan", role: "Ready for sales", signal: "is reviewing governance requirements for the next decision", headline: "Bring the next conversation into focus", detail: "Bring your evaluation questions and governance requirements to your account team.", cta: "Plan an account conversation" },
          ]
        : [
            { name: "Jordan Lee", role: "Eligible audience", signal: "is part of the matched Northstar adoption cohort", headline: "Plan your next adoption step", detail: "Choose one practical next step using the shared adoption guide.", cta: "Review the adoption guide" },
          ];
  return exampleAccounts.flatMap((account) =>
    recipients.map((recipient, index) => ({
      id: `${account.id}-V${index + 1}`,
      account: account.name,
      accountId: account.id,
      context: account.context,
      recipient: recipient.name,
      segment: recipient.role,
      signal: recipient.signal,
      subject: `${recipient.name} at ${account.name}: ${recipient.headline.toLowerCase()}`,
      headline: recipient.headline,
      body: `${sourceSet.baseContent.message}\n\nFor ${recipient.name}, who ${recipient.signal}, the practical starting point at ${account.name} is ${account.focus}. ${recipient.detail}`,
      proof: sourceSet.baseContent.proof,
      cta: recipient.cta,
      source: `${sourceSet.title} · workshop practice foundation`,
      eligibility:
        "Candidate only: requires matched identity, segment membership and consent",
    })),
  );
}
