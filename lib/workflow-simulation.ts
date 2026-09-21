export type WorkflowScenario = {
  audiences: "One audience" | "Three segments";
  assets: "Approved assets available" | "New content needed";
  approval: "Standard review" | "Legal review required";
  channels: "Email" | "Email and event follow-up";
  identity: "Individual" | "Buying group";
  notes: string;
};
export const defaultScenario: WorkflowScenario = {
  audiences: "One audience",
  assets: "Approved assets available",
  approval: "Standard review",
  channels: "Email",
  identity: "Individual",
  notes: "",
};
export const scenarioOptions = {
  audiences: ["One audience", "Three segments"],
  assets: ["Approved assets available", "New content needed"],
  approval: ["Standard review", "Legal review required"],
  channels: ["Email", "Email and event follow-up"],
  identity: ["Individual", "Buying group"],
} as const;
export function scenarioFlow(s: WorkflowScenario) {
  const segmented = s.audiences === "Three segments",
    group = s.identity === "Buying group",
    create = s.assets === "New content needed",
    legal = s.approval === "Legal review required",
    event = s.channels === "Email and event follow-up";
  return [
    {
      id: "signals",
      title: "Understand the journey",
      components: ["Adobe Customer Journey Analytics", "OpenAI Data Lake"],
      detail:
        "Combine marketing website, CRM and event engagement to understand progression.",
      passes: "Journey signals and audience context",
      branches: [],
      changed: event,
      why: event
        ? "Event engagement joins the feedback loop."
        : "Journey evidence informs the audience decision.",
    },
    {
      id: "audience",
      title: "Define the audience",
      components: [
        "Adobe CDP (w/ ABM)",
        ...(group ? ["CRM / account identity inputs"] : []),
      ],
      detail: group
        ? "Connect people to account and buying-group context; agree how identities are matched."
        : "Use individual engagement and needs to define eligibility.",
      passes: segmented
        ? "Three segment definitions and their needs"
        : "One audience definition and need",
      branches: segmented
        ? [
            "Exploring · needs orientation",
            "Evaluating · needs evidence",
            "Adopting · needs practical guidance",
          ]
        : ["One shared audience"],
      changed: segmented || group,
      why: group
        ? "Account matching becomes a dependency before targeting."
        : segmented
          ? "Audience context branches into three briefs."
          : "One audience follows the shared path.",
    },
    {
      id: "brief",
      title: "Set the brief",
      components: ["Codex Interfaces + ChatGPT work", "Agent Interface(s)"],
      detail:
        "The marketer reviews audience needs, objectives and constraints before routing work to existing tools.",
      passes: segmented
        ? "Shared source brief + three audience requirements"
        : "Source brief and audience requirements",
      branches: [],
      changed: segmented,
      why: segmented
        ? "Reuse one core brief while carrying distinct audience needs."
        : "One brief carries the audience context forward.",
    },
    {
      id: "content",
      title: create
        ? "Create through existing tools"
        : "Reuse approved material",
      components: [
        "Adobe CSC (Assets, etc)",
        ...(create ? ["Existing creation tools · confirm with room"] : []),
      ],
      detail: create
        ? "Route the brief into the team’s creation tools, then return asset references and versions."
        : "Find approved assets and route audience requirements to the team’s existing adaptation tools.",
      passes: "Asset references, versions and audience mapping",
      branches: [],
      changed: create,
      why: create
        ? "A creation handoff is added; tool ownership needs confirmation."
        : "Approved material is reused; no copy is generated here.",
    },
    {
      id: "review",
      title: legal ? "Add legal approval" : "Review and approve",
      components: ["Adobe Workfront"],
      detail: legal
        ? "Route sensitive claims to legal alongside the standard review. Hold release until required approvals are recorded."
        : "Apply the team’s standard review and release rules.",
      passes: "Approved versions and release status",
      branches: legal
        ? ["Standard review", "Legal checkpoint → release gate"]
        : ["Standard review → release"],
      changed: legal,
      why: legal
        ? "An additional approval gate sits before activation."
        : "Standard approval remains in place.",
    },
    {
      id: "activation",
      title: "Activate and learn",
      components: [
        "CRM (Marketing)",
        ...(event ? ["Events"] : []),
        "Adobe Customer Journey Analytics",
      ],
      detail:
        "Existing activation tools deliver approved work. Responses return to journey analysis and the next audience decision.",
      passes: "Engagement and progression → journey analysis",
      branches: event ? ["Email path", "Event follow-up path"] : ["Email path"],
      changed: event,
      why: event
        ? "Two activation paths feed the same learning loop."
        : "One activation path feeds the learning loop.",
    },
  ];
}
export function scenarioSummary(s: WorkflowScenario) {
  return [s.audiences, s.assets, s.approval, s.channels, s.identity].join(
    " · ",
  );
}
