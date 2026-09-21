import type { AgentState } from "./agent-workspace";

// Fictional account context for the prototype, never customer data.
export const exampleAccounts = Array.from({ length: 12 }, (_, i) => ({
  id: `ACCT-${String(i + 1).padStart(2, "0")}`,
  name: `Example account ${String(i + 1).padStart(2, "0")}`,
  context: [
    "A technical team is evaluating an initial pilot",
    "An existing team is exploring adoption across more departments",
    "An account team is preparing a governance conversation",
  ][i % 3],
  focus: ["a focused pilot", "cross-team adoption", "governance readiness"][
    i % 3
  ],
}));
export function contentVariants(s: Pick<AgentState, "audience">) {
  const segments =
    s.audience === "Buying roles"
      ? [
          [
            "Technical evaluator",
            "Define a practical evaluation",
            "Agree a bounded use case and the criteria your team would use to assess it.",
            "Review the evaluation guide",
          ],
          [
            "Business sponsor",
            "Connect adoption to a business priority",
            "Choose the operating outcome your team needs to improve and a useful first proof point.",
            "Discuss the adoption plan",
          ],
          [
            "Procurement",
            "Prepare the governance conversation",
            "Identify the documentation and review questions your team needs before moving forward.",
            "Review governance considerations",
          ],
        ]
      : s.audience === "Lifecycle stages"
        ? [
            [
              "Exploring",
              "Find a useful starting point",
              "Choose one workflow where a small evaluation could answer a meaningful question.",
              "Explore the adoption guide",
            ],
            [
              "Evaluating",
              "Shape the next evaluation",
              "Define the scope, evidence and success criteria for your evaluation.",
              "Review the evaluation guide",
            ],
            [
              "Ready for sales",
              "Bring the next conversation into focus",
              "Bring your evaluation questions and governance requirements to your account team.",
              "Plan an account conversation",
            ],
          ]
        : [
            [
              "Eligible audience",
              "Plan your next adoption step",
              "Choose one practical next step using the shared adoption guide.",
              "Review the adoption guide",
            ],
          ];
  return exampleAccounts.flatMap((account) =>
    segments.map(([segment, headline, body, cta], index) => ({
      id: `${account.id}-V${index + 1}`,
      account: account.name,
      accountId: account.id,
      context: account.context,
      segment,
      subject: `${headline}: ${account.focus}`,
      headline,
      body: `For ${account.name}, the starting point is ${account.focus}. ${body}`,
      cta,
      source: "Enterprise adoption guide v3 · illustrative source",
      eligibility:
        "Candidate only: requires matched identity, segment membership and consent",
    })),
  );
}
