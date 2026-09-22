import { processState } from "./process-state";
import type { AgentState } from "./agent-workspace";

export const contentSourceOptions = [
  {
    id: "enterprise-adoption-case-studies",
    title: "Enterprise adoption case-study set",
    badge: "Recommended",
    assets:
      "MUFG customer story · Zenken customer story · Hyatt customer story",
    rationale:
      "Balances operating transformation, sales productivity and scaled adoption. It gives each stakeholder a credible public proof point without inventing customer results.",
    baseContent: {
      headline:
        "How enterprises turn early AI adoption into durable ways of working.",
      message:
        "For Northstar Health, the next step is to turn active technical use into a practical, governed expansion plan—connecting the teams already experimenting with the people who own operating outcomes and procurement decisions.",
      proof:
        "Public OpenAI stories from MUFG, Zenken and Hyatt show how enterprises pair adoption with practical workflows, enablement and governance. They are reference evidence for Northstar’s discussion—not a promise of the same results.",
      cta: "Plan Northstar’s 45-minute expansion working session.",
    },
    references: [
      { label: "MUFG customer story", url: "https://openai.com/index/mufg/" },
      {
        label: "Zenken customer story",
        url: "https://openai.com/index/zenken/",
      },
      {
        label: "Hyatt customer story",
        url: "https://openai.com/index/hyatt-advances-ai-with-chatgpt-enterprise/",
      },
    ],
  },
  {
    id: "operating-value-set",
    title: "Sales and operating-value case-study set",
    badge: "Alternative",
    assets: "Zenken customer story · Enterprise Signals report",
    rationale:
      "Best when the sponsorship decision is the immediate objective. It focuses the story on higher-value work, sales preparation and workflow depth.",
    baseContent: {
      headline: "Make more room for the work that moves the business forward.",
      message:
        "Northstar can connect its active technical use to a specific operating priority, giving the business sponsor a clear decision, a bounded scope and a way to judge whether expansion is warranted.",
      proof:
        "Zenken reports material time savings in knowledge work and a more efficient sales-preparation process. Enterprise Signals describes deeper agentic work where teams connect context, tools and repeatable workflows. Each organization should validate its own baseline and outcome before making any efficiency claim.",
      cta: "Review Northstar’s operating-value discussion guide.",
    },
    references: [
      {
        label: "Zenken customer story",
        url: "https://openai.com/index/zenken/",
      },
      {
        label: "Enterprise Signals",
        url: "https://openai.com/index/how-enterprises-put-ai-to-work/",
      },
    ],
  },
  {
    id: "evaluation-set",
    title: "Governed adoption case-study set",
    badge: "Alternative",
    assets: "CBA customer story · MUFG customer story",
    rationale:
      "Best when the technical team needs a more bounded proof and procurement needs to see how adoption, controls and training work together.",
    baseContent: {
      headline: "Build the foundation for secure, confident AI adoption.",
      message:
        "Northstar can turn its technical team’s early use into an evaluation that the wider organization can assess: a defined use case, explicit governance questions and a clear decision path.",
      proof:
        "CBA describes enterprise-wide rollout supported by connectors, training and leadership participation; MUFG describes structured adoption, learning programs and employee-created workflow tools. Neither story substitutes for an organization’s own security, privacy or procurement review.",
      cta: "Review Northstar’s governed-adoption evaluation plan.",
    },
    references: [
      {
        label: "CBA customer story",
        url: "https://openai.com/index/commonwealth-bank-of-australia/",
      },
      { label: "MUFG customer story", url: "https://openai.com/index/mufg/" },
    ],
  },
] as const;

export function selectedContentSource(s: AgentState) {
  return (
    contentSourceOptions.find(
      (source) => source.id === processState(s, "s3", 0).choice,
    ) || contentSourceOptions[0]
  );
}
