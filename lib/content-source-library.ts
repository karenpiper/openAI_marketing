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
        "Public OpenAI customer stories show enterprises building adoption through practical workflows, deliberate enablement and secure operating foundations—not one-off experimentation.",
      proof:
        "MUFG reports enterprise-wide adoption and employee-led workflow innovation; Zenken describes sales preparation and productivity gains; Hyatt describes marketing and brand teams using AI to scale content and consistency. Use the source stories as evidence, not as a promise that another organization will achieve the same results.",
      cta: "Explore the enterprise adoption case studies.",
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
        "The strongest enterprise adoption stories start with repeatable work: preparing for client conversations, synthesizing context and giving people back time for judgment and customer work.",
      proof:
        "Zenken reports material time savings in knowledge work and a more efficient sales-preparation process. Enterprise Signals describes deeper agentic work where teams connect context, tools and repeatable workflows. Each organization should validate its own baseline and outcome before making any efficiency claim.",
      cta: "Review the sales and operating-value stories.",
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
        "Enterprise adoption scales when people have a usable platform, practical enablement and clear guardrails around the workflows they bring to it.",
      proof:
        "CBA describes enterprise-wide rollout supported by connectors, training and leadership participation; MUFG describes structured adoption, learning programs and employee-created workflow tools. Neither story substitutes for an organization’s own security, privacy or procurement review.",
      cta: "Review the governed-adoption stories.",
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
