import { processState } from "./process-state";
import type { AgentState } from "./agent-workspace";

export const contentSourceOptions = [
  {
    id: "adoption-in-practice",
    title: "Adoption in practice",
    badge: "Recommended",
    assets: "Theme: turn useful AI activity into a repeatable way of working",
    rationale:
      "Lead with the practical path from early activity to broader adoption. Use when the room needs to make the work tangible before discussing scale.",
    baseContent: {
      headline:
        "Turn early AI use into a decision the wider organization can make.",
      message:
        "For Northstar Health, the next step is to turn active technical use into a practical, governed expansion plan—connecting the teams already experimenting with the people who own operating outcomes and procurement decisions.",
      proof:
        "A fictional proof framework: show the practical adoption path, the operating decision it enables and the governance questions that must be answered. Validate Northstar’s own baseline and outcome before making any performance claim.",
      cta: "Plan Northstar’s 45-minute expansion working session.",
    },
  },
  {
    id: "business-value",
    title: "Business value",
    badge: "Alternative",
    assets:
      "Theme: connect adoption to an operating outcome the business can own",
    rationale:
      "Lead with the business problem and the decision it enables. Use when a sponsor needs a clear reason to engage.",
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
    id: "confidence-to-scale",
    title: "Confidence to scale",
    badge: "Alternative",
    assets: "Theme: establish the guardrails and proof needed to expand with confidence",
    rationale:
      "Lead with trust, governance and a bounded proof. Use when risk, policy or purchasing confidence is the immediate barrier.",
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

export const newContentSource = {
  id: "new-content-foundation",
  title: "New Northstar content foundation",
  badge: "New content path",
  assets: "New fictional foundation drafted from the campaign brief; review required before release",
  rationale:
    "Use when Morgan chooses to create a purpose-built foundation instead of retrieving an existing approved asset.",
  baseContent: {
    headline: "Turn active AI use into an enterprise decision with a clear next step.",
    message:
      "Northstar’s technical adoption creates an opening to convene the business sponsor and procurement team around one bounded expansion decision, with the evidence and governance questions they need to move forward.",
    proof:
      "A fictional draft framework: state the observed adoption signal, the operating decision it can inform and the governance questions that require review. Do not make performance or ROI claims until Northstar validates them.",
    cta: "Build Northstar’s expansion decision brief.",
  },
} as const;

export function selectedContentSource(s: AgentState) {
  if (s.source === "Source material missing") return newContentSource;
  return (
    contentSourceOptions.find(
      (source) => source.id === processState(s, "s3", 0).choice,
    ) || contentSourceOptions[0]
  );
}
