import type { Session } from "./workshop";
import { currentQuestions, findAnswer } from "./workshop-guide";
export const pdfBoxes = {
  orchestration: "OpenAI Frontier orchestration layer",
  interface: "Codex Interfaces + ChatGPT work / Agent Interface(s)",
  data: "OpenAI Data Lake / Adobe CDP (w/ ABM)",
  assets: "Adobe CSC",
  review: "Adobe Workfront",
  touchpoints: "Events / CRM (Marketing) / Marketing Website",
  journeys: "Adobe Customer Journey Analytics → OpenAI Data Lake",
  sales: "Salesforce / CRM (Sales) / Offer Tools",
};
export type WorkflowStep = {
  title: string;
  proposal: string;
  ask: string;
  boxes: (keyof typeof pdfBoxes)[];
  sources: number[];
  output: string;
};
const step = (
  title: string,
  proposal: string,
  ask: string,
  boxes: WorkflowStep["boxes"],
  sources: number[],
  output: string,
): WorkflowStep => ({ title, proposal, ask, boxes, sources, output });
const learn = step(
  "Deliver and learn",
  "Deliver through the relevant touchpoints, compare audience journeys, and return results to the next decision.",
  "Where should approved work go, and which results should change the next message?",
  ["touchpoints", "journeys"],
  [3],
  "Engagement and progression results for the next audience decision",
);
export const workflows: Record<string, WorkflowStep[]> = {
  s1: [
    step(
      "Identify the buying group",
      "Bring person and account context together to identify roles and gaps.",
      "Can the existing sources connect people to the right account?",
      ["data", "sales"],
      [0],
      "Account, known roles and identity gaps",
    ),
    step(
      "Understand account activity",
      "Bring activity into the marketer’s workspace to understand what the account needs.",
      "Which signals are useful, and which could be misleading?",
      ["interface", "data", "journeys"],
      [1],
      "Account context and a proposed next action",
    ),
    step(
      "Coordinate the outreach",
      "Use shared context to coordinate marketing and sales activity.",
      "Who decides the next contact, and how do we prevent conflicting outreach?",
      ["interface", "sales"],
      [2],
      "Coordinated outreach plan and relationship owner",
    ),
    step(
      "Check before acting",
      "Ask the relationship owner to check sensitive outreach before delivery.",
      "What must a person approve or stop?",
      ["review", "sales"],
      [2],
      "Approved action or a hold with a reason",
    ),
    learn,
  ],
  s2: [
    step(
      "Bring signals together",
      "Make relevant audience activity available for a marketer to inspect.",
      "Which sources are available and trustworthy enough to use?",
      ["data", "journeys"],
      [0],
      "Audience signals with their source and freshness",
    ),
    step(
      "Understand audience needs",
      "Use the marketer interface to interpret signals alongside account context.",
      "What context is required before suggesting an action?",
      ["interface", "data"],
      [1],
      "Audience need and supporting evidence",
    ),
    step(
      "Recommend the next action",
      "Present a proposed action and rationale for the marketer to review.",
      "What would make the recommendation defensible?",
      ["interface"],
      [2],
      "Recommendation, rationale and alternatives",
    ),
    step(
      "Approve and route the action",
      "A marketer accepts, changes or stops the recommendation, then passes it to the right team.",
      "Who approves it, and where does it go next?",
      ["review", "touchpoints", "sales"],
      [2],
      "Approved action and destination",
    ),
    learn,
  ],
  s3: [
    step(
      "Identify an audience and its needs",
      "Combine relevant signals to define an audience and the message it needs.",
      "Can your existing signals support this? What is missing?",
      ["data", "journeys", "interface"],
      [1],
      "Audience brief with need, signals and intended response",
    ),
    step(
      "Find the right approved content",
      "Use the audience brief to find a suitable approved source and its current version.",
      "Which existing sources should we use, and how do we know the content is approved?",
      ["assets", "interface"],
      [0],
      "Approved source, version and permitted claims",
    ),
    step(
      "Produce relevant message variants",
      "Draft audience-specific variants from approved material in the marketer’s workspace.",
      "What can the system draft, and what must stay fixed?",
      ["interface", "assets"],
      [2],
      "Draft variants linked to their audience and source",
    ),
    step(
      "Review and approve",
      "Route variants for a named person to check claims, relevance and permissions.",
      "Who approves? What must always require a person?",
      ["review", "assets"],
      [2],
      "Approved variants or requested changes",
    ),
    learn,
  ],
  s4: [
    step(
      "Assemble the launch brief",
      "Bring the audience, assets and intended touchpoints into one launch brief.",
      "What must be present before review can begin?",
      ["interface", "data", "assets"],
      [0],
      "Complete campaign brief and source assets",
    ),
    step(
      "Check readiness",
      "Check the brief against the launch requirements before requesting approval.",
      "Which checks can be repeatable, and which need judgment?",
      ["interface", "review"],
      [0],
      "Readiness checklist with exceptions",
    ),
    step(
      "Approve the campaign",
      "Route the campaign to the accountable reviewers.",
      "Who must sign off, and what triggers another review?",
      ["review"],
      [1],
      "Approval record tied to a campaign version",
    ),
    step(
      "Launch through the right touchpoints",
      "Hand approved content and audience instructions to the delivery process.",
      "Which existing tools launch it, and who can pause it?",
      ["touchpoints"],
      [2],
      "Scheduled delivery and launch record",
    ),
    step(
      "Learn from delays and outcomes",
      "Compare launch timing and audience results to improve the next campaign.",
      "Which timestamps and outcomes can we actually capture?",
      ["review", "journeys"],
      [3],
      "Launch delays, audience results and improvements",
    ),
  ],
  s5: [
    step(
      "Receive the request",
      "Give the requester a consistent place to state the task and required context.",
      "Where should requests enter, and what information is essential?",
      ["interface"],
      [0],
      "Request with required context",
    ),
    step(
      "Identify routine work",
      "Check whether the request matches an agreed repeatable process.",
      "Which requests are safe to handle routinely?",
      ["interface", "data"],
      [1],
      "Routine or exception classification with rationale",
    ),
    step(
      "Complete the routine task",
      "Use the existing tools to carry out the agreed repeatable steps.",
      "Which tools can do this today, and what needs connecting?",
      ["interface", "touchpoints"],
      [2],
      "Completed task and execution record",
    ),
    step(
      "Route exceptions",
      "Send exceptions to the specialist with the original request and context.",
      "Who takes over, and how does the requester hear back?",
      ["review", "interface"],
      [3],
      "Named specialist and exception context",
    ),
    step(
      "Return the result",
      "Show completion and use recurring exceptions to improve the process.",
      "What proves completion and which exceptions should we learn from?",
      ["interface", "review"],
      [2, 3],
      "Completion response and improvement backlog",
    ),
  ],
  s6: [
    step(
      "Recognize a sensitive moment",
      "Bring relationship context into the decision before an action is taken.",
      "What signals mean a person must intervene?",
      ["data", "sales"],
      [0],
      "Flagged action and reason for review",
    ),
    step(
      "Give the reviewer context",
      "Show the proposed action and supporting context to the right person.",
      "Who needs to see it, and what information is essential?",
      ["interface", "sales"],
      [1],
      "Review request with context",
    ),
    step(
      "Make the human decision",
      "Let the accountable reviewer approve, change or reject the action.",
      "Which decisions are reserved for a person?",
      ["review", "interface"],
      [1],
      "Decision and rationale",
    ),
    step(
      "Apply the decision",
      "Pass the decision to the delivery process, including a stop when needed.",
      "Where is the stop control, and how do we know it took effect?",
      ["touchpoints", "sales"],
      [2],
      "Changed or stopped action with acknowledgement",
    ),
    step(
      "Keep the record",
      "Retain the decision, context and outcome for later review.",
      "Which system should hold the authoritative record?",
      ["review", "data"],
      [3],
      "Traceable decision and outcome",
    ),
  ],
  s7: [
    step(
      "Bring outcomes together",
      "Connect touchpoint activity and downstream outcomes for analysis.",
      "Which outcomes can we connect reliably today?",
      ["touchpoints", "journeys", "data"],
      [0],
      "Outcomes linked to audience and activity",
    ),
    step(
      "Compare audience journeys",
      "Compare progression and drop-off across audiences and touchpoints.",
      "Which audience differences would change a marketing decision?",
      ["journeys", "data"],
      [1],
      "Journey comparison and gaps",
    ),
    step(
      "Decide what to change",
      "Bring findings to the marketer’s workspace to choose a response.",
      "Who interprets the findings, and what makes a change justified?",
      ["interface"],
      [2],
      "Recommended change with supporting evidence",
    ),
    step(
      "Agree the next experiment",
      "Review the proposed change and define a measurable next test.",
      "Who approves the test and what must it prove?",
      ["review", "interface"],
      [2],
      "Agreed experiment and success measure",
    ),
    step(
      "Close the loop",
      "Return the learning to the next brief before production begins.",
      "Who receives it, and how soon must it arrive?",
      ["interface", "assets"],
      [3],
      "Updated brief and learning cadence",
    ),
  ],
  s8: [
    step(
      "Bring account health together",
      "Combine adoption, relationship and engagement signals to distinguish an expansion opening from an attrition risk.",
      "Which health signals are reliable enough to change an account plan?",
      ["data", "journeys", "sales"],
      [0],
      "Account health view with expansion and retention signals",
    ),
    step(
      "Identify the account decision",
      "Use the marketer workspace to explain the recommended account motion and the evidence behind it.",
      "Is this an expansion opportunity, a retention risk, or both?",
      ["interface", "data"],
      [1],
      "Recommended account action with confidence and rationale",
    ),
    step(
      "Coordinate the customer-growth motion",
      "Align marketing and sales on the audience, timing and next conversation.",
      "Who owns the customer relationship and what should happen next?",
      ["interface", "sales", "touchpoints"],
      [2],
      "Coordinated account plan and customer-facing action",
    ),
    step(
      "Review and learn",
      "Check consequential outreach and return account progression to the next decision.",
      "What requires human review, and which outcomes prove the motion worked?",
      ["review", "journeys", "data"],
      [3],
      "Approved action and account-health learning",
    ),
  ],
  s9: [
    step(
      "Show what is known and missing",
      "Present the available account signals alongside their freshness, confidence and gaps.",
      "Which missing signal would materially change the recommendation?",
      ["interface", "data", "journeys"],
      [0],
      "Evidence view with confidence and explicit gaps",
    ),
    step(
      "Choose a safe next move",
      "Recommend a reversible action that is proportionate to the evidence available.",
      "What can move now without overstating certainty?",
      ["interface", "sales"],
      [1],
      "Low-risk recommendation with rationale and alternatives",
    ),
    step(
      "Request the missing evidence",
      "Route a focused data or seller-context request to the person or system that can resolve it.",
      "Who can supply the missing evidence, and how will it be recorded?",
      ["review", "sales", "data"],
      [2],
      "Targeted evidence request and accountable owner",
    ),
    step(
      "Update the decision",
      "Bring new evidence back into the recommendation and record what changed.",
      "When does the recommendation need to be revisited?",
      ["interface", "data"],
      [3],
      "Updated recommendation and decision record",
    ),
  ],
  s10: [
    step(
      "Capture the seller signal",
      "Give sellers a lightweight way to record a useful observation immediately after an account conversation.",
      "What is the smallest amount of context that makes the signal reusable?",
      ["interface", "sales"],
      [0],
      "Structured seller observation with account and contact context",
    ),
    step(
      "Connect it to the account",
      "Match the signal to the account, buying group and existing activity while preserving provenance.",
      "Can we link it safely to the right people and account?",
      ["data", "sales"],
      [1],
      "Shared account context with source and confidence",
    ),
    step(
      "Recommend the coordinated follow-up",
      "Use the new sales context with marketing signals to recommend a relevant next action.",
      "Should marketing act, sales act, or should the team wait for more evidence?",
      ["interface", "data", "touchpoints"],
      [2],
      "Recommended cross-functional follow-up",
    ),
    step(
      "Record outcomes and improve capture",
      "Return the action and outcome to the shared record so future signals are more useful.",
      "What outcome proves the captured signal was worth acting on?",
      ["sales", "journeys", "data"],
      [3],
      "Closed-loop sales signal and improved capture guidance",
    ),
  ],
};
export function suggestedSystems(caseId: string, index: number): string {
  return workflows[caseId][index].boxes.map((key) => pdfBoxes[key]).join("\n");
}
export function workflowSystems(s: Session, caseId: string, index: number) {
  const r = s.workflowReviews.find(
    (r) => r.useCase === caseId && r.step === index,
  );
  const suggested = !r?.systemsOrigin && !r?.systems.trim();
  return {
    value: suggested ? suggestedSystems(caseId, index) : r!.systems,
    suggested: suggested || r?.systemsOrigin === "Suggested",
    unreviewed: suggested,
  };
}
export function workflowSource(s: Session, caseId: string, index: number) {
  if (s.currentWorkflows[caseId])
    return JSON.stringify({ workflow: s.currentWorkflows[caseId] });
  if (Object.prototype.hasOwnProperty.call(s.currentStories, caseId))
    return JSON.stringify({ story: s.currentStories[caseId] });
  return JSON.stringify(
    workflows[caseId][index].sources.map(
      (i) => findAnswer(s, caseId, currentQuestions[caseId][i]) || null,
    ),
  );
}
export function workflowState(s: Session, caseId: string, index: number) {
  const r = s.workflowReviews.find(
    (r) => r.useCase === caseId && r.step === index,
  );
  return {
    record: r,
    stale: !!r && r.source !== workflowSource(s, caseId, index),
  };
}
export function reviewWorkflow(
  s: Session,
  caseId: string,
  index: number,
  patch: Partial<Session["workflowReviews"][number]>,
): Session {
  const { record: r } = workflowState(s, caseId, index);
  const systems = workflowSystems(s, caseId, index);
  const next = {
    useCase: caseId,
    step: index,
    choice: "Not reviewed" as const,
    systems: suggestedSystems(caseId, index),
    systemsOrigin: systems.suggested
      ? ("Suggested" as const)
      : ("Room" as const),
    handoff: "",
    controls: "",
    change: "",
    owner: "",
    next: "",
    ...r,
    ...(systems.unreviewed
      ? { systems: systems.value, systemsOrigin: "Suggested" as const }
      : {}),
    ...patch,
    ...("systems" in patch ? { systemsOrigin: "Room" as const } : {}),
    source:
      "choice" in patch || !r ? workflowSource(s, caseId, index) : r.source,
  };
  return {
    ...s,
    workflowReviews: r
      ? s.workflowReviews.map((x) => (x === r ? next : x))
      : [...s.workflowReviews, next],
  };
}
