import {
  type Session,
  type Capability,
  type Boundary,
  type Handoff,
  newId,
} from "./workshop";

export type CurrentQuestion = {
  id: string;
  label: string;
  question: string;
  hint: string;
  aliases: string[];
  layer: string;
};
const q = (
  id: string,
  label: string,
  question: string,
  hint: string,
  layer: string,
  aliases: string[] = [],
): CurrentQuestion => ({ id, label, question, hint, layer, aliases });
export const currentQuestions: Record<string, CurrentQuestion[]> = {
  s1: [
    q(
      "people",
      "People in the account",
      "How do you know who is involved in an account today?",
      "Describe how you identify people, roles and gaps in the buying group.",
      "data",
      ["Data & identity"],
    ),
    q(
      "signals",
      "Account activity",
      "How do you put the different people’s activity together?",
      "Think about website visits, content, events and sales conversations.",
      "reasoning",
      ["Reasoning & audience decisions"],
    ),
    q(
      "coordination",
      "Coordinated outreach",
      "How do marketing and sales coordinate outreach to the group?",
      "What prevents duplicate, conflicting or irrelevant messages?",
      "activation",
      ["Activation & touchpoints", "Sales & offer tools"],
    ),
    q(
      "progress",
      "Account progress",
      "How do you know whether the account is moving forward?",
      "Describe the signals you trust and what you cannot see.",
      "measurement",
      ["Measurement & learning"],
    ),
  ],
  s2: [
    q(
      "signals",
      "Available signals",
      "What tells you an audience needs attention today?",
      "Where do those signals come from, and who looks at them?",
      "data",
      ["Data & identity"],
    ),
    q(
      "interpretation",
      "Understanding the signal",
      "How do you work out what those people need?",
      "Describe the context, research or judgment involved.",
      "reasoning",
      ["Reasoning & audience decisions"],
    ),
    q(
      "action",
      "Choosing the action",
      "How do you decide what to do next?",
      "For example: send content, invite someone to an event, involve sales, or wait.",
      "surface",
      ["Marketer surface"],
    ),
    q(
      "learning",
      "Checking the choice",
      "How do you find out whether that choice was useful?",
      "What feedback reaches the person making the next decision?",
      "measurement",
      ["Measurement & learning"],
    ),
  ],
  s3: [
    q(
      "source",
      "Approved content",
      "Where does approved content live?",
      "How does someone find the current version and know it is approved?",
      "content",
      ["Content operations"],
    ),
    q(
      "audiences",
      "Audience needs",
      "How do you decide which audience needs which message?",
      "What do website activity, content engagement, events or sales tell you?",
      "reasoning",
      ["Reasoning & audience decisions"],
    ),
    q(
      "variants",
      "Creating and approving",
      "How do you create and approve the different versions?",
      "Walk through the people, tools and handoffs involved today.",
      "content",
    ),
    q(
      "results",
      "Knowing what worked",
      "How do you know what worked?",
      "Think about audience response, reuse and time spent producing or editing content.",
      "measurement",
      ["Measurement & learning"],
    ),
  ],
  s4: [
    q(
      "ready",
      "Getting ready",
      "What has to be ready before you can launch a campaign?",
      "Describe how the audience, content and channel setup come together.",
      "content",
      ["Content operations"],
    ),
    q(
      "approval",
      "Getting approval",
      "How do you get a campaign approved today?",
      "Who checks it, where do they respond, and what causes it to wait?",
      "surface",
      ["Marketer surface"],
    ),
    q(
      "launch",
      "Going live",
      "How does an approved campaign get into market?",
      "Which tools and people handle the actual launch?",
      "activation",
      ["Activation & touchpoints"],
    ),
    q(
      "delay",
      "Finding delays",
      "How do you see where a launch got held up?",
      "What records tell you how much time was spent at each step?",
      "measurement",
      ["Measurement & learning"],
    ),
  ],
  s5: [
    q(
      "intake",
      "Receiving requests",
      "Where do routine marketing requests arrive today?",
      "Who sees the request first, and what information do they receive?",
      "surface",
      ["Marketer surface"],
    ),
    q(
      "triage",
      "Sorting requests",
      "How do you tell a routine request from one needing judgment?",
      "Describe the rules people use and the exceptions they look for.",
      "reasoning",
      ["Reasoning & audience decisions"],
    ),
    q(
      "fulfilment",
      "Doing the work",
      "How does a routine request get completed?",
      "Which steps are repeatable, and which still need a specialist?",
      "activation",
      ["Activation & touchpoints"],
    ),
    q(
      "exceptions",
      "Handling exceptions",
      "What happens when a request cannot follow the usual path?",
      "Who takes over, and how does the requester find out?",
      "sales",
      ["Sales & offer tools"],
    ),
  ],
  s6: [
    q(
      "recognition",
      "Spotting a sensitive moment",
      "How do you recognize a moment that needs a person’s judgment?",
      "Consider relationship context, senior contacts and unusual requests.",
      "reasoning",
      ["Reasoning & audience decisions"],
    ),
    q(
      "review",
      "Getting the right person",
      "How does the right person get involved today?",
      "Who receives the context and decides what should happen?",
      "surface",
      ["Marketer surface", "Sales & offer tools"],
    ),
    q(
      "stop",
      "Stopping a message",
      "How can someone change or stop an inappropriate action?",
      "Where is the control, and how quickly can it take effect?",
      "activation",
      ["Activation & touchpoints"],
    ),
    q(
      "record",
      "Keeping a record",
      "How do you record what was decided and why?",
      "What could someone check later if a question comes up?",
      "data",
      ["Data & identity"],
    ),
  ],
  s7: [
    q(
      "outcomes",
      "Gathering outcomes",
      "Where do you look to see what happened after marketing activity?",
      "Include website, content, event and sales outcomes where relevant.",
      "data",
      ["Data & identity"],
    ),
    q(
      "journeys",
      "Comparing journeys",
      "How do you compare what different audiences did next?",
      "Can you follow progression and drop-off across several touchpoints?",
      "measurement",
      ["Measurement & learning"],
    ),
    q(
      "decision",
      "Changing the plan",
      "How do those results change the next plan or message?",
      "Describe who interprets the results and decides what to change.",
      "reasoning",
      ["Reasoning & audience decisions"],
    ),
    q(
      "cadence",
      "Closing the loop",
      "How soon does that learning reach the people doing the work?",
      "What gets shared, where does it go, and what slows it down?",
      "surface",
      ["Marketer surface"],
    ),
  ],
};
export const architectureQuestions = [
  {
    label: "Start the work",
    question: "Where should the marketer start this work?",
    hint: "Name the place they use and the person or team responsible for that experience.",
    layer: "surface",
  },
  {
    label: "Use the right information",
    question: "What information should this work rely on?",
    hint: "Name the source people should trust and who maintains it.",
    layer: "data",
  },
  {
    label: "Do the work",
    question: "Who or what should do the work?",
    hint: "Build on what exists today. Describe the system and the team accountable for this part.",
    layer: "primary",
  },
  {
    label: "Check and pass it on",
    question: "Who checks the result, and what happens next?",
    hint: "Describe what gets passed on, when, and who can change or stop it.",
    layer: "handoff",
  },
  {
    label: "Resolve open decisions",
    question: "What still needs a decision before this can work?",
    hint: "Keep disagreements and unanswered questions visible. Name who can resolve them.",
    layer: "decisions",
  },
];
export function primaryLayer(id: string) {
  return (
    (
      {
        s1: "reasoning",
        s2: "reasoning",
        s3: "content",
        s4: "activation",
        s5: "activation",
        s6: "reasoning",
        s7: "measurement",
      } as Record<string, string>
    )[id] || "reasoning"
  );
}
export function destinationLayer(id: string) {
  return ["s4", "s5"].includes(id)
    ? "measurement"
    : ["s6", "s7"].includes(id)
      ? "surface"
      : "activation";
}
export function findAnswer(
  s: Session,
  caseId: string,
  prompt: CurrentQuestion,
) {
  return (
    s.capabilities.find(
      (c) => c.useCase === caseId && c.questionId === prompt.id,
    ) ||
    s.capabilities.find(
      (c) =>
        c.useCase === caseId &&
        !c.questionId &&
        (c.name === prompt.label || prompt.aliases.includes(c.name)),
    )
  );
}
export function editAnswer(
  s: Session,
  caseId: string,
  prompt: CurrentQuestion,
  patch: Partial<Capability>,
): Session {
  const found = findAnswer(s, caseId, prompt);
  const base: Capability = found || {
    id: newId(),
    useCase: caseId,
    name: prompt.label,
    questionId: prompt.id,
    system: "",
    owner: "",
    fit: "Unknown",
    evidence: "",
    gap: "",
    status: "Unknown",
  };
  const next = {
    ...base,
    ...patch,
    questionId: prompt.id,
    name: prompt.label,
    ...(!("status" in patch) ? { status: "Proposed" as const } : {}),
  };
  return {
    ...s,
    capabilities: found
      ? s.capabilities.map((c) => (c.id === found.id ? next : c))
      : [...s.capabilities, next],
  };
}
export function editBoundary(
  s: Session,
  caseId: string,
  layer: string,
  patch: Partial<Boundary>,
): Session {
  const found = s.boundaries.find(
    (b) => b.useCase === caseId && b.layer === layer,
  );
  const base: Boundary = found || {
    id: newId(),
    useCase: caseId,
    layer,
    system: "",
    owner: "",
    implementer: "",
    truth: "",
    state: "",
    control: "",
    status: "Unknown",
  };
  const next = {
    ...base,
    ...patch,
    ...(!("status" in patch) ? { status: "Proposed" as const } : {}),
  };
  return {
    ...s,
    boundaries: found
      ? s.boundaries.map((b) => (b.id === found.id ? next : b))
      : [...s.boundaries, next],
  };
}
export function primaryHandoff(s: Session, id: string) {
  return s.handoffs.find(
    (h) =>
      h.useCase === id &&
      h.from === primaryLayer(id) &&
      h.to === destinationLayer(id),
  );
}
export function editHandoff(
  s: Session,
  caseId: string,
  patch: Partial<Handoff>,
): Session {
  const found = primaryHandoff(s, caseId);
  const base: Handoff = found || {
    id: newId(),
    useCase: caseId,
    from: primaryLayer(caseId),
    to: destinationLayer(caseId),
    payload: "",
    trigger: "",
    owner: "",
    control: "",
    status: "Unknown",
  };
  const next = {
    ...base,
    ...patch,
    ...(!("status" in patch) ? { status: "Proposed" as const } : {}),
  };
  return {
    ...s,
    handoffs: found
      ? s.handoffs.map((h) => (h.id === found.id ? next : h))
      : [...s.handoffs, next],
  };
}
export function agreementLabel(status: string) {
  return (
    (
      {
        Confirmed: "Agreed",
        Proposed: "Needs checking",
        Disputed: "Disputed",
        Unknown: "Still unknown",
      } as Record<string, string>
    )[status] || status
  );
}
