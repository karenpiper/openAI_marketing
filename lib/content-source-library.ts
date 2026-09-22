import { processState } from "./process-state";
import type { AgentState } from "./agent-workspace";

export const contentSourceOptions = [
  {
    id: "enterprise-adoption-case-studies",
    title: "Enterprise expansion narrative",
    badge: "Recommended",
    assets: "Executive narrative · adoption pathway · governance proof points",
    rationale:
      "A fictional content foundation for taking active technical use into a credible, governed expansion conversation across the buying group.",
    baseContent: {
      headline:
        "How enterprises turn early AI adoption into durable ways of working.",
      message:
        "For Northstar Health, the next step is to turn active technical use into a practical, governed expansion plan—connecting the teams already experimenting with the people who own operating outcomes and procurement decisions.",
      proof:
        "A fictional proof framework: show the practical adoption path, the operating decision it enables and the governance questions that must be answered. Validate Northstar’s own baseline and outcome before making any performance claim.",
      cta: "Plan Northstar’s 45-minute expansion working session.",
    },
  },
  {
    id: "operating-value-set",
    title: "Operating-value narrative",
    badge: "Alternative",
    assets:
      "Value hypothesis · executive point of view · seller conversation guide",
    rationale:
      "A fictional foundation for a sponsorship conversation focused on the operating problem, a bounded adoption scope and a decision the sponsor can make.",
    baseContent: {
      headline: "Make more room for the work that moves the business forward.",
      message:
        "Northstar can connect its active technical use to a specific operating priority, giving the business sponsor a clear decision, a bounded scope and a way to judge whether expansion is warranted.",
      proof:
        "A fictional proof framework: tie the adoption opportunity to a specific operating priority, name the baseline to validate and avoid claiming efficiency until Northstar has measured it.",
      cta: "Review Northstar’s operating-value discussion guide.",
    },
  },
  {
    id: "evaluation-set",
    title: "Guided evaluation narrative",
    badge: "Alternative",
    assets: "Evaluation guide · governance FAQ · implementation checklist",
    rationale:
      "A fictional foundation for a bounded technical proof that gives procurement and governance teams a clear path into the decision.",
    baseContent: {
      headline: "Build the foundation for secure, confident AI adoption.",
      message:
        "Northstar can turn its technical team’s early use into an evaluation that the wider organization can assess: a defined use case, explicit governance questions and a clear decision path.",
      proof:
        "A fictional proof framework: define the use case, make the governance questions explicit and show the path from evaluation to an expansion decision. Northstar’s own security, privacy and procurement review remains required.",
      cta: "Review Northstar’s governed-adoption evaluation plan.",
    },
  },
] as const;

export function selectedContentSource(s: AgentState) {
  return (
    contentSourceOptions.find(
      (source) => source.id === processState(s, "s3", 0).choice,
    ) || contentSourceOptions[0]
  );
}
