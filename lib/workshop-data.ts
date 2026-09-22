// Original narrative content from reference/claude-workshop.html.
// Labels clarify navigation; proof prompts support the workshop discussion.
export type NoRegret = "yes" | "unsure" | "no";
export const useCases = [
  {
    id: "s1",
    label: "Buying-group engagement",
    time: "8:15 AM",
    frac: 0.06,
    chapter: "Stop 1",
    title: "The scale test",
    narrative:
      "Morgan's team already has something that works: spot one interested person, send them something relevant. That's solved for a single buyer. This morning, though, the account showing interest isn't one person — it's eighteen people at Global Financial Group, spread across security, compliance and IT, with four new faces just this week.",
    problem:
      "We don't actually know if today's approach holds up once “the right person” becomes a whole group of people.",
    evidence:
      "OpenAI told Adobe directly: the one-buyer version already works. What's untested is a whole buying group.",
    kpiGrowth: "Reaching the biggest deals",
    kpiProd: "Campaigns per marketer, without new hires",
    question:
      "Where does it actually start to break — more people in the group, more accounts at once, or both?",
    dependsOn:
      "Decision 4 — where buying-group and identity data lives. Everything about acting on a group instead of one buyer needs this answered first.",
    noRegretDefault: "unsure",
    proofPrompt:
      "Prove that a coordinated motion can work when the unit of action is a buying group, not one buyer.",
  },
  {
    id: "s2",
    label: "Signal to action",
    time: "9:30 AM",
    frac: 0.18,
    chapter: "Stop 2",
    title: "Knowing what to do next",
    narrative:
      "The system tells Morgan: these eighteen people are worth paying attention to. Good to know — but it doesn't tell her what to actually do about it. Send an email? Set up a meeting? Loop in sales? Right now, nothing helps her make that call.",
    problem:
      "Even once the right people are identified, deciding what to actually do next isn't solved.",
    evidence:
      "This is the exact gap OpenAI named: finding the right people works, deciding the next move doesn't.",
    kpiGrowth: "Moving deals forward faster",
    kpiProd: "Time from idea to something live in-market",
    question:
      "Today, how does someone actually decide what to do next — a playbook, gut instinct, or nothing consistent?",
    dependsOn:
      "None of the four — this is reasoning inside tools OpenAI already owns outright.",
    noRegretDefault: "yes",
    proofPrompt:
      "Prove that a marketer can move from an identified cohort to a defensible recommended action.",
  },
  {
    id: "s3",
    label: "Engagement at scale",
    time: "10:30 AM",
    frac: 0.3,
    chapter: "Stop 3",
    title: "Can the right action happen at scale?",
    narrative:
      "Say Morgan knows what to do: bring the security team into the evaluation. The question is whether marketing and sales can execute that next action across the account, with relevant materials and the right controls, without rebuilding the plan by hand.",
    problem:
      "Even with the right move identified, teams still need to turn it into coordinated engagement across people, channels and sales follow-up.",
    evidence:
      "The working team identified the execution gap: the next best action needs to become a governed, repeatable motion rather than a one-off handoff.",
    kpiGrowth: "AAR created and advanced from qualified pipeline",
    kpiProd: "Time from recommended action to coordinated execution",
    question:
      "Where does the next-best-action motion break down today: deciding, preparing, routing or following through?",
    dependsOn:
      "Mostly none — the core question is how decisioning, execution and governance connect across the current systems.",
    noRegretDefault: "yes",
    proofPrompt:
      "Prove that a recommended marketing or sales action can become a governed, account-specific engagement motion.",
  },
  {
    id: "s4",
    label: "Campaign launch & approvals",
    time: "12:00 PM",
    frac: 0.42,
    chapter: "Stop 4",
    title: "Getting it out the door",
    narrative:
      "The content exists this time. Morgan still has to pull the right list of people, get it approved, and get it sent — and every hour it sits in review is an hour the moment goes cold.",
    problem:
      "Even when everything needed already exists, getting it out the door still takes days, not hours.",
    evidence:
      "This one wasn't named directly — worth checking if it's still true once content and direction aren't the bottleneck.",
    kpiGrowth: "Faster-moving deals",
    kpiProd: "Time from idea to something live in-market",
    question:
      "When everything you need already exists, how long does it really take to get something out today?",
    dependsOn:
      "Decision 3 — how approvals actually get enforced. Faster shipping only works if there's one defined path to “yes.”",
    noRegretDefault: "unsure",
    proofPrompt:
      "Determine whether launch latency is a material problem after content and direction are no longer bottlenecks.",
  },
  {
    id: "s5",
    label: "Routine marketing operations",
    time: "1:30 PM",
    frac: 0.55,
    chapter: "Stop 5",
    title: "The easy question that waits in line",
    narrative:
      "A message lands asking: can we email the people who signed up for the webinar but didn't show? It's not a hard call. But it still sits behind harder problems, because there aren't enough people to clear even the easy ones quickly.",
    problem:
      "Simple, low-judgment requests wait in the same queue as genuinely hard ones.",
    evidence: "This is the work Matt explicitly asked us to fix first.",
    kpiGrowth: "More campaigns getting through",
    kpiProd: "Campaigns per marketer, without new hires",
    question:
      "How much of what lands in that queue is actually routine, versus a real judgment call?",
    dependsOn:
      "None of the four — this is explicitly the work already underway that Matt asked us to harden first.",
    noRegretDefault: "yes",
    proofPrompt:
      "Prove that routine MOPS requests can be resolved without specialist intervention.",
  },
  {
    id: "s6",
    label: "Human oversight",
    time: "3:30 PM",
    frac: 0.72,
    chapter: "Stop 6",
    title: "The moment a person has to step in",
    narrative:
      "A message comes in from a name Morgan recognizes — someone senior at a major account. This isn't a moment that should be handled the same automatic way as everything else.",
    problem:
      "There's real concern that broader automation could act badly in a sensitive, high-stakes moment.",
    evidence:
      "That concern already shapes how carefully teams behave today — it isn't hypothetical.",
    kpiGrowth: "Protecting the relationships that matter most",
    kpiProd: "Not a productivity metric — this one is about trust",
    question:
      "Where do you most worry about something going out that a person should have caught first?",
    dependsOn:
      "Decision 3 — how approvals get enforced. This is the sharpest version of that question: what counts as high-stakes, and who has to sign off.",
    noRegretDefault: "no",
    proofPrompt:
      "Define the moments where human judgment changes the outcome, and the minimum control needed around them.",
  },
  {
    id: "s7",
    label: "Measurement & learning",
    time: "6:00 PM",
    frac: 0.9,
    chapter: "Stop 7",
    title: "Learning from today",
    narrative:
      "It's evening. Today's outreach got opened, got a click, got one reply. Tomorrow's plan doesn't actually reflect any of that yet.",
    problem: "What happens today rarely changes what gets planned tomorrow.",
    evidence: "Today, that kind of check-in happens monthly, if that.",
    kpiGrowth: "Getting better results over time, not just once",
    kpiProd: "Time from doing something to knowing if it worked",
    question:
      "Do you actually change tomorrow's plan based on today's results — or is that a monthly review, at best?",
    dependsOn: "Decision 2 — who owns measurement and attribution long-term.",
    noRegretDefault: "unsure",
    proofPrompt:
      "Prove that campaign outcomes can be turned into a useful next decision quickly enough to change behavior.",
  },
];
export type UseCase = (typeof useCases)[number];
export const heard = [
  {
    q: "Finding the right people to target, and sending something to them — that part already works.",
    a: "That's why the first stop today doesn't test whether this works at all. It tests whether it still holds up once “the right person” becomes a whole group.",
  },
  {
    q: "What's missing is knowing what to actually do next.",
    a: "That's the second stop, word for word.",
  },
  {
    q: "And whether something good already exists to send — especially the very first message to someone new.",
    a: "That's the third stop.",
  },
  {
    q: "Productivity has to be something we measure directly — not a side effect.",
    a: "That's why every stop today carries two outcomes, not one: a growth number, and a productivity number — campaigns per marketer, rep time shifted to selling, time from idea to in-market, time from doing something to knowing if it worked.",
  },
  {
    q: "Start with the work already underway, and tell us what can move now versus what has to wait on bigger decisions.",
    a: "That's why every stop also gets a plain yes / no / not sure — measured against the four open decisions below, not left abstract.",
  },
];
export const decisions = [
  {
    num: 1,
    t: "Whose data is the system of record",
    q: "When OpenAI's product data and Adobe's marketing data describe the same account or person, which one wins — and does Adobe get its own copy, or read OpenAI's directly?",
    known:
      "Adobe has committed in writing: “we work from your data and your computed signals… we are not proposing a second source of truth.” Adobe is telemetry ingress and an execution layer, not a rival database.",
    open: "The specifics of the connection — direct read, zero-copy, or periodic sync. That's what Tuesday works through.",
  },
  {
    num: 2,
    t: "Who owns which piece of the stack",
    q: "For each layer — content, activation, measurement, governance — is that OpenAI's to build, Adobe's to run, or shared?",
    known:
      "OpenAI keeps intelligence, reasoning and attribution. Adobe brings identity, activation infrastructure and content-governance tooling.",
    open: "The exact line, layer by layer — including judgment calls in between, like whether content-approval logic is a reasoning problem OpenAI owns or a workflow Adobe runs.",
  },
  {
    num: 3,
    t: "How approvals actually get enforced",
    q: "Does every campaign run through one defined, governed workflow with a specific tool and an audit trail — or does it stay person-to-person, the way most of it is today?",
    known:
      "Adobe is proposing a defined, policy-gated system, not case-by-case judgment.",
    open: "Whether OpenAI wants that formalized now, or wants to stay lightweight while the rest of this is still being proven out.",
  },
  {
    num: 4,
    t: "Where buying-group and identity data lives",
    q: "When you need to know who's actually in a buying group and what their role is, whose system answers that — an OpenAI-native graph, or an Adobe system like Real-Time CDP B2B?",
    known:
      "Nothing's decided. OpenAI's current SMB motion doesn't need this today, because it only deals with one buyer at a time.",
    open: "Almost entirely open — and it's the single biggest thing Stop 1 depends on.",
  },
];
export const axes = [
  {
    key: "frequency",
    label: "How often does this happen?",
    hint: "Every day, or hardly ever?",
    lo: "Rare",
    hi: "Constant",
  },
  {
    key: "severity",
    label: "How much does it cost when it happens?",
    hint: "A minor annoyance, or something that kills a deal?",
    lo: "Minor annoyance",
    hi: "Deal-breaking",
  },
  {
    key: "evidence",
    label: "How sure are we?",
    hint: "Are we guessing, or do we actually know this is true?",
    lo: "Just a guess",
    hi: "We heard this directly",
  },
  {
    key: "leverage",
    label: "How much it matters",
    hint: "If we fix it, does it help the biggest deals and the path to IPO?",
    lo: "Nice to have",
    hi: "One of the biggest bets",
  },
] as const;
