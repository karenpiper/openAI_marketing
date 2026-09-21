export const scenarioOptions = {
  audiences: [
    "One audience",
    "Three segments",
    "Buying roles",
    "Lifecycle stages",
    "Regions and languages",
  ],
  assets: [
    "Approved assets available",
    "New content needed",
    "Mixed asset coverage",
    "Localization needed",
  ],
  approval: [
    "Standard review",
    "Legal review required",
    "Regional review",
    "Legal and regional review",
  ],
  channels: [
    "Email",
    "Email and event follow-up",
    "Email and website",
    "Email and sales follow-up",
    "Email, website and events",
    "Paid media and website",
  ],
  identity: ["Individual", "Buying group", "Named accounts"],
} as const;
export type WorkflowScenario = {
  [K in keyof typeof scenarioOptions]: (typeof scenarioOptions)[K][number];
} & { notes: string };
export const defaultScenario: WorkflowScenario = {
  audiences: "One audience",
  assets: "Approved assets available",
  approval: "Standard review",
  channels: "Email",
  identity: "Individual",
  notes: "",
};
export const audienceRoutes = {
  "One audience": ["One shared audience"],
  "Three segments": [
    "Exploring · needs orientation",
    "Evaluating · needs evidence",
    "Adopting · needs practical guidance",
  ],
  "Buying roles": [
    "Business sponsor · business value",
    "Technical evaluator · implementation",
    "Security / procurement · assurance",
  ],
  "Lifecycle stages": [
    "Prospect · understand the offer",
    "Trial · reach first value",
    "Customer · deepen adoption",
    "Expansion · broaden usage",
  ],
  "Regions and languages": [
    "Primary market · source language",
    "Regional market · localized language",
    "Additional market · local requirements",
  ],
};
export const channelRoutes = {
  Email: ["Email"],
  "Email and event follow-up": ["Email", "Events"],
  "Email and website": ["Email", "Marketing Website"],
  "Email and sales follow-up": ["Email", "Sales follow-up"],
  "Email, website and events": ["Email", "Marketing Website", "Events"],
  "Paid media and website": ["Paid media", "Marketing Website"],
};
export function scenarioFlow(s: WorkflowScenario) {
  const branches = audienceRoutes[s.audiences],
    routes = channelRoutes[s.channels];
  const segmented = branches.length > 1,
    group = s.identity !== "Individual",
    create = s.assets !== "Approved assets available",
    legal = s.approval.includes("Legal"),
    regional =
      s.approval.includes("Regional") || s.approval.includes("regional"),
    event = routes.includes("Events");
  const reviews = [
    "Standard review",
    ...(legal ? ["Legal checkpoint → release gate"] : []),
    ...(regional ? ["Regional checkpoint → release gate"] : []),
  ];
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
        ? s.identity === "Named accounts"
          ? "Match people to the named-account list, confirm account eligibility and coordinate contact coverage."
          : "Connect people to account and buying-group context; agree how identities are matched."
        : "Use individual engagement and needs to define eligibility.",
      passes: segmented
        ? `${branches.length} audience definitions and their needs`
        : "One audience definition and need",
      branches,
      changed: segmented || group,
      why: group
        ? "Account matching becomes a dependency before targeting."
        : segmented
          ? `Audience context branches into ${branches.length} distinct requirements.`
          : "One audience follows the shared path.",
    },
    {
      id: "brief",
      title: "Set the brief",
      components: ["Codex Interfaces + ChatGPT work", "Agent Interface(s)"],
      detail:
        "The marketer reviews audience needs, objectives and constraints before routing work to existing tools.",
      passes: segmented
        ? `Shared source brief + ${branches.length} audience requirements`
        : "Source brief and audience requirements",
      branches: [],
      changed: segmented,
      why: segmented
        ? "Reuse one core brief while carrying distinct audience needs."
        : "One brief carries the audience context forward.",
    },
    {
      id: "content",
      title:
        s.assets === "Localization needed"
          ? "Localize through existing tools"
          : s.assets === "Mixed asset coverage"
            ? "Reuse what exists; create the gaps"
            : create
              ? "Create through existing tools"
              : "Reuse approved material",
      components: [
        "Adobe CSC (Assets, etc)",
        ...(create ? ["Existing creation tools · confirm with room"] : []),
      ],
      detail: create
        ? s.assets === "Localization needed"
          ? "Route approved source assets to localization, retaining claims, language and regional version references."
          : s.assets === "Mixed asset coverage"
            ? "Check approved coverage by audience and channel. Reuse available material and route only missing pieces to creation."
            : "Route the brief into the team’s creation tools, then return asset references and versions."
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
      title:
        legal && regional
          ? "Coordinate legal and regional approval"
          : regional
            ? "Add regional approval"
            : legal
              ? "Add legal approval"
              : "Review and approve",
      components: ["Adobe Workfront"],
      detail:
        legal || regional
          ? `Route work through ${reviews.join(", ")}. Hold release until the required approvals are recorded.`
          : "Apply the team’s standard review and release rules.",
      passes: "Approved versions and release status",
      branches: reviews,
      changed: legal || regional,
      why:
        legal || regional
          ? "An additional approval gate sits before activation."
          : "Standard approval remains in place.",
    },
    {
      id: "activation",
      title: "Activate and learn",
      components: [
        ...(routes.includes("Email") ? ["CRM (Marketing)"] : []),
        ...(event ? ["Events"] : []),
        ...(routes.includes("Marketing Website") ? ["Marketing Website"] : []),
        ...(routes.includes("Sales follow-up")
          ? ["Salesforce / CRM (Sales)"]
          : []),
        ...(routes.includes("Paid media")
          ? ["Paid-media tooling · addition to validate"]
          : []),
        "Adobe Customer Journey Analytics",
      ],
      detail:
        "Existing activation tools deliver approved work. Responses return to journey analysis and the next audience decision.",
      passes: "Engagement and progression → journey analysis",
      branches: routes.map((route) => `${route} path`),
      changed: event,
      why: `${routes.length} activation ${routes.length === 1 ? "path feeds" : "paths feed"} the learning loop. Confirm consent, suppression and measurement across the selected channels.`,
    },
  ];
}
export function scenarioSummary(s: WorkflowScenario) {
  return [s.audiences, s.assets, s.approval, s.channels, s.identity].join(
    " · ",
  );
}
