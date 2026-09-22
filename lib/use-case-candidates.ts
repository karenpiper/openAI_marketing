export const useCaseCandidates = [
  {
    id: "s1",
    time: "08:15 AM",
    title: "Buying-group engagement",
    short:
      "See who is involved, missing or disengaging across an enterprise account.",
    subUseCases: [
      "Detect buying-role coverage gaps",
      "See new or disengaging stakeholders",
      "Coordinate an account-level engagement plan",
    ],
    source: "Original Morgan’s Tuesday",
  },
  {
    id: "s2",
    time: "09:30 AM",
    title: "Signal to action",
    short:
      "Turn product, journey and account signals into a defensible next action.",
    subUseCases: [
      "Recommend the next best action",
      "Explain why now and for whom",
      "Route the right action to marketing or sales",
    ],
    source: "Original Morgan’s Tuesday",
  },
  {
    id: "s3",
    time: "10:30 AM",
    title: "Engagement at scale",
    short:
      "Turn the best marketing or sales next action into coordinated, account-specific engagement.",
    subUseCases: [
      "Recommend the next action for an account and buying role",
      "Adapt the engagement plan across marketing and sales channels",
      "Execute the approved action with the right controls",
    ],
    source: "Original Morgan’s Tuesday",
  },
  {
    id: "s4",
    time: "12:00 PM",
    title: "Campaign launch & approvals",
    short:
      "Move a complete campaign through review, governance and activation with less manual coordination.",
    subUseCases: [
      "Build the review packet from approved inputs",
      "Route reviewers by risk",
      "Stage coordinated multi-channel activation",
    ],
    source: "Original Morgan’s Tuesday",
  },
  {
    id: "s5",
    time: "1:30 PM",
    title: "Routine marketing operations",
    short:
      "Resolve repeatable marketing operations requests without always waiting for a specialist.",
    subUseCases: [
      "Follow up with event registrants and attendees",
      "Prepare a governed audience request",
      "Answer routine campaign setup questions",
    ],
    source: "Original Morgan’s Tuesday",
  },
  {
    id: "s6",
    time: "3:30 PM",
    title: "Human oversight",
    short:
      "Bring the right exceptions, risks and approvals to people at the right time.",
    subUseCases: [
      "Escalate sensitive-account activity",
      "Hold consent or identity conflicts",
      "Bring consequential claims to the right reviewer",
    ],
    source: "Original Morgan’s Tuesday",
  },
  {
    id: "s7",
    time: "6:00 PM",
    title: "Measurement & learning",
    short:
      "Learn from campaign and journey outcomes to improve the next decision.",
    subUseCases: [
      "Compare response by role, account and channel",
      "Identify what changed account progression",
      "Feed a useful learning into the next plan",
    ],
    source: "Original Morgan’s Tuesday",
  },
  {
    id: "s8",
    time: "Existing accounts",
    title: "Expansion & attrition risk",
    short:
      "Identify upsell, cross-sell and retention opportunities across existing enterprise accounts.",
    subUseCases: [
      "Spot adoption expansion signals",
      "Flag attrition or disengagement risk",
      "Coordinate the customer-growth motion",
    ],
    source: "Adobe feedback",
  },
  {
    id: "s9",
    time: "Uncertain data",
    title: "Decisions with limited data",
    short:
      "Make a useful, transparent recommendation when the full signal set is not yet available.",
    subUseCases: [
      "Show confidence and missing evidence",
      "Recommend a low-risk next step",
      "Ask for the signal that would change the call",
    ],
    source: "Adobe feedback",
  },
  {
    id: "s10",
    time: "Sales signal",
    title: "Initial sales data capture",
    short:
      "Capture early sales context and signals so marketing and sales can build a shared account view.",
    subUseCases: [
      "Capture seller observations after a conversation",
      "Structure account context for the shared view",
      "Trigger a coordinated follow-up from a new signal",
    ],
    source: "Adobe feedback",
  },
] as const;
