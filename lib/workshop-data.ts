export type NoRegret = "yes" | "unsure" | "no";
export type Confidence = "confirmed" | "hypothesis" | "open";

export type UseCase = {
  id: string;
  time: string;
  short: string;
  title: string;
  dayMoment: string;
  problem: string;
  evidence: string;
  confidence: Confidence;
  growthOutcome: string;
  productivityOutcome: string;
  question: string;
  proofPrompt: string;
  dependency: string;
  noRegret: NoRegret;
};

export const useCases: UseCase[] = [
  {
    id: "scale-test",
    time: "8:15 AM",
    short: "Scale test",
    title: "The scale test",
    dayMoment: "The current motion works when the unit is one buyer. Enterprise introduces a group.",
    problem: "We do not yet know whether the one-buyer motion holds when the decision involves an 18-person buying group.",
    evidence: "Confirmed: cohort identification and launching work today for SMB / single-buyer motion. Buying-group scale is not yet proven.",
    confidence: "confirmed",
    growthOutcome: "Progress larger enterprise opportunities",
    productivityOutcome: "Campaigns per marketer without new headcount",
    question: "Where does the current motion actually start to break: more people in the group, more accounts at once, or both?",
    proofPrompt: "Prove that a coordinated motion can work when the unit of action is a buying group, not one buyer.",
    dependency: "Depends on Decision 4: where buying-group and identity data lives.",
    noRegret: "unsure"
  },
  {
    id: "next-action",
    time: "9:30 AM",
    short: "Next action",
    title: "Knowing what to do next",
    dayMoment: "The audience is known. The next move is not.",
    problem: "The right people can be found, but nothing consistently tells the marketer what to do about that signal.",
    evidence: "Confirmed directly in OpenAI feedback: the named gap is knowing which action to take.",
    confidence: "confirmed",
    growthOutcome: "Move demand toward pipeline faster",
    productivityOutcome: "Time from idea to in-market",
    question: "How does someone decide what to do next today: playbook, prior performance, human judgment, or something else?",
    proofPrompt: "Prove that a recommendation is useful enough for a marketer to act on, and explainable enough to trust.",
    dependency: "No blocking dependency among the four open decisions. The detail still needs to be validated in the room.",
    noRegret: "yes"
  },
  {
    id: "content-ready",
    time: "10:30 AM",
    short: "Content ready",
    title: "Do you even have something to send?",
    dayMoment: "A marketer may know the move before knowing whether approved content exists to make it.",
    problem: "Especially at first touch, the right approved content may not exist, or may be hard to find.",
    evidence: "Confirmed directly in OpenAI feedback: approved content availability is a named gap, particularly top-of-funnel.",
    confidence: "confirmed",
    growthOutcome: "Create more effective first-touch demand",
    productivityOutcome: "Campaigns per marketer without new headcount",
    question: "When this breaks today, is the bigger issue that the content does not exist, or that it exists and nobody can find or reuse it?",
    proofPrompt: "Prove that the team can quickly determine what approved content exists, what is reusable, and what is genuinely missing.",
    dependency: "Mostly no blocking dependency. Decision 2 may affect where content governance ultimately lives.",
    noRegret: "yes"
  },
  {
    id: "out-the-door",
    time: "12:00 PM",
    short: "Out the door",
    title: "Getting it out the door",
    dayMoment: "Assume the audience, action and content are ready. The remaining question is how long launch still takes.",
    problem: "Approval, assembly and handoffs may still slow a ready campaign before it reaches market.",
    evidence: "Hypothesis to test. This was not named as clearly as the content and next-action gaps.",
    confidence: "hypothesis",
    growthOutcome: "Reduce lost momentum between signal and activation",
    productivityOutcome: "Time from idea to in-market",
    question: "When everything needed already exists, how long does it actually take to get something out today, and where does that time go?",
    proofPrompt: "Determine whether launch latency is a material problem after content and direction are no longer bottlenecks.",
    dependency: "Related to Decision 3: how approvals actually get enforced.",
    noRegret: "unsure"
  },
  {
    id: "ask-mops",
    time: "1:30 PM",
    short: "Routine requests",
    title: "The easy question that waits in line",
    dayMoment: "Routine MOPS work competes for attention with work that requires genuine judgment.",
    problem: "Simple, low-judgment requests can wait in the same queue as genuinely hard ones.",
    evidence: "Confirmed direction: harden the SMB / marketing-operations work already underway and include a no-regrets set.",
    confidence: "confirmed",
    growthOutcome: "Get more useful marketing activity through the system",
    productivityOutcome: "Campaigns per marketer without new headcount",
    question: "How much of the current MOPS queue is repeatable work versus a real judgment call?",
    proofPrompt: "Prove that a routine request can move from intake to completion with materially fewer specialist touches.",
    dependency: "No blocking dependency among the four open decisions. This is explicitly tied to work already underway.",
    noRegret: "yes"
  },
  {
    id: "human-step-in",
    time: "3:30 PM",
    short: "Human judgment",
    title: "The moment a person has to step in",
    dayMoment: "Some marketing moments are routine. Others carry enough relationship or brand risk to require human judgment.",
    problem: "The team needs confidence that automation will not act badly in a sensitive, high-stakes moment.",
    evidence: "Confirmed concern, but the exact high-stakes boundaries still need to be defined with the operators.",
    confidence: "open",
    growthOutcome: "Protect high-value relationships and trust",
    productivityOutcome: "Trust / risk outcome, rather than forcing a productivity KPI",
    question: "Where do you most worry about something going out that a person should have caught first?",
    proofPrompt: "Define the moments where human judgment changes the outcome, and the minimum control needed around them.",
    dependency: "Depends on Decision 3: how approvals and control points get enforced.",
    noRegret: "no"
  },
  {
    id: "learning-loop",
    time: "4:30 PM",
    short: "Learning loop",
    title: "Learning from today",
    dayMoment: "Execution produces data. The unresolved question is whether that learning changes the next decision quickly enough.",
    problem: "Outcomes do not consistently reshape the next plan in a fast learning loop.",
    evidence: "Problem is in the candidate set, but the exact current cadence and ownership need validation in the room.",
    confidence: "hypothesis",
    growthOutcome: "Improve performance across successive campaigns",
    productivityOutcome: "Time from execution to knowing what worked",
    question: "How quickly does what happened today change what you do next: same day, weekly, monthly, or only when someone investigates?",
    proofPrompt: "Prove that campaign outcomes can be turned into a useful next decision quickly enough to change behavior.",
    dependency: "Related to Decision 2: stack ownership across measurement and attribution.",
    noRegret: "unsure"
  }
];

export const productivityMetrics = [
  "Campaigns per marketer without new headcount",
  "Rep time shifted from research to selling",
  "Time from idea to in-market",
  "Time from execution to knowing what worked"
];
