import { reviewWorkflow } from "./architecture-workflow";
import { saveInterpretation } from "./live-synthesis";
import { currentQuestions, findAnswer, editAnswer } from "./workshop-guide";
import {
  createSession,
  selectionStamp,
  signature,
  type Session,
  type Status,
} from "./workshop";

export const DEMO_SESSION_KEY = "oai-full-workshop-demo-v1";
export const DEMO_CHANNEL = "oai-workshop-room-demo";

/** Fictional examples for exercising the UI; never evidence of actual capabilities. */
export function createDemoSession(): Session {
  const s = createSession();
  s.title = "DEMO DATA · Fictional workshop for testing";
  s.stage = 1;
  s.scene = 9;
  s.focus = "s3";
  s.selected = ["s2", "s3", "s5"];
  s.selectionBy = "Demo room · simulated agreement";
  const scores = [
    [3, 4, 3, 4],
    [4, 4, 4, 5],
    [5, 5, 4, 5],
    [2, 2, 2, 3],
    [5, 3, 4, 4],
    [2, 4, 3, 3],
    [3, 3, 2, 4],
  ];
  Object.entries(s.assessments).forEach(([id, a], i) => {
    [a.frequency, a.severity, a.evidence, a.leverage] = scores[i];
    a.discussed = true;
    a.note = "Fictional test response. Replace with what the actual room says.";
    if (id === "s4") {
      a.veto = true;
      a.note = "Demo veto: the sample room ruled this problem out.";
    }
  });
  s.assessments.s3.note =
    "Demo: approved content is scattered. We want to test whether one source can serve three audience needs without starting from scratch.";
  s.selectionSignature = selectionStamp(s);
  const addCapability = (
    useCase: string,
    name: string,
    system: string,
    fit: Session["capabilities"][number]["fit"],
    status: Status,
    evidence: string,
    gap: string,
  ) =>
    s.capabilities.push({
      id: `demo-c${s.capabilities.length + 1}`,
      useCase,
      name,
      system,
      fit,
      status,
      owner: "Demo capability owner",
      evidence: `Fictional example: ${evidence}`,
      gap,
    });
  addCapability(
    "s3",
    "Content operations",
    "Sample approved asset library",
    "Reuse",
    "Confirmed",
    "the practice guide has approved source text for this exercise.",
    "Need to confirm the actual library and access rights.",
  );
  addCapability(
    "s3",
    "Reasoning & audience decisions",
    "Sample briefing workflow",
    "Extend",
    "Proposed",
    "audience needs can be entered manually.",
    "Define reusable audience briefs and content matching rules.",
  );
  addCapability(
    "s3",
    "Measurement & learning",
    "Not yet identified",
    "Missing",
    "Disputed",
    "reviewers disagree on whether variant-level feedback exists.",
    "Find out who records reuse, editing effort and approval outcomes.",
  );
  addCapability(
    "s3",
    "Data & identity",
    "",
    "Unknown",
    "Unknown",
    "we have not established how people and accounts connect.",
    "Verify available audience signals with the operator.",
  );
  addCapability(
    "s2",
    "Reasoning & audience decisions",
    "Sample cohort workspace",
    "Extend",
    "Proposed",
    "a marketer can inspect an identified cohort.",
    "Make the next-action rationale explicit.",
  );
  addCapability(
    "s2",
    "Data & identity",
    "Sample signal table",
    "Reuse",
    "Confirmed",
    "a fictional table supplies website and content signals.",
    "Real data coverage and freshness remain to be checked.",
  );
  addCapability(
    "s5",
    "Activation & touchpoints",
    "Sample request queue",
    "Extend",
    "Proposed",
    "routine audience requests follow a repeatable intake.",
    "Identify the cases that require specialist judgment.",
  );
  s.boundaries = [
    {
      id: "demo-b1",
      useCase: "s3",
      layer: "surface",
      system: "Sample marketer workspace",
      owner: "Demo OpenAI lead",
      implementer: "Demo C&T interface lead",
      truth: "The workshop brief",
      state: "Current source, audiences and draft versions",
      control: "Marketer reviews drafts before any downstream handoff.",
      status: "Proposed",
    },
    {
      id: "demo-b2",
      useCase: "s3",
      layer: "content",
      system: "Sample asset and review workflow",
      owner: "Demo content operations lead",
      implementer: "Demo Adobe + C&T leads",
      truth: "Approved source asset and version",
      state: "Draft, reviewer comments and approval record",
      control: "Named reviewer checks factual claims and message relevance.",
      status: "Confirmed",
    },
    {
      id: "demo-b3",
      useCase: "s3",
      layer: "measurement",
      system: "Sample review record",
      owner: "Demo measurement lead",
      implementer: "To be agreed",
      truth: "Not agreed",
      state: "Variant outcomes and manual editing time",
      control: "The room must agree how outcomes return to the next brief.",
      status: "Disputed",
    },
    {
      id: "demo-b4",
      useCase: "s2",
      layer: "reasoning",
      system: "Sample recommendation workspace",
      owner: "Demo OpenAI lead",
      implementer: "Demo implementation lead",
      truth: "Current cohort signals",
      state: "Recommendation and rationale",
      control: "Marketer accepts or changes the next action.",
      status: "Proposed",
    },
    {
      id: "demo-b5",
      useCase: "s5",
      layer: "activation",
      system: "Sample request handler",
      owner: "Demo MOPS lead",
      implementer: "Demo C&T lead",
      truth: "Approved request",
      state: "Queue status and completion log",
      control: "Exceptions return to a specialist.",
      status: "Proposed",
    },
  ];
  s.handoffs = [
    {
      id: "demo-h1",
      useCase: "s3",
      from: "surface",
      to: "content",
      payload: "Source reference, audience need and proposed variants",
      trigger: "Marketer requests review",
      owner: "Demo content lead",
      control: "Reject unsupported claims and return edit notes.",
      status: "Proposed",
    },
    {
      id: "demo-h2",
      useCase: "s3",
      from: "content",
      to: "activation",
      payload: "Reviewed variant, audience rule and approval reference",
      trigger: "Named reviewer signs off",
      owner: "Demo MOPS lead",
      control: "Hold delivery if approval or contact permission is missing.",
      status: "Disputed",
    },
  ];
  s.decisions[0] = {
    ...s.decisions[0],
    answer:
      "Demo proposal: keep the approved source and its version authoritative; do not create a competing content record.",
    owner: "Demo data lead",
    due: "Before pilot setup",
    status: "Proposed",
  };
  s.decisions[1] = {
    ...s.decisions[1],
    answer:
      "Demo discussion: content review ownership is proposed, but measurement responsibilities are unresolved.",
    owner: "Demo architecture lead",
    due: "Next working session",
    status: "Disputed",
  };
  s.decisions[2] = {
    ...s.decisions[2],
    answer:
      "Demo agreement: a named person reviews every draft in this exercise. No content is sent automatically.",
    owner: "Demo content lead",
    due: "During the exercise",
    status: "Confirmed",
  };
  s.decisions[3] = {
    ...s.decisions[3],
    answer:
      "Demo open question: validate which person and account signals exist today.",
    owner: "Demo identity lead",
    due: "Before any real audience test",
    status: "Unknown",
  };
  s.lab.baseline = "90";
  s.lab.editMinutes = "12";
  s.lab.result =
    "Fictional test result: the first variant is usable for rehearsal; the second needs a stronger CTA; the event follow-up still needs review. These sample timings are not measured results.";
  s.lab.status = "Proposed";
  const copy = [
    {
      subject: "Choose a practical first AI workflow",
      body: "Start with one repeatable task your team knows well. The guide includes a worksheet to identify the task, available information and a useful outcome.\n\nEvery pilot needs a named human reviewer.\n\nExplore the worksheet.",
      headline: "Find a useful place to start",
      review: "Usable" as const,
      note: "Demo review: usable for rehearsal only, not production approval.",
    },
    {
      subject: "Put a clear outcome around your pilot",
      body: "Before you begin, decide what useful work would look like and who will review it. Use the guide’s worksheet to prepare those choices for your pilot discussion.\n\nEvery pilot needs a named human reviewer.\n\nPlan a pilot discussion.",
      headline: "Define what the pilot needs to prove",
      review: "Needs edits" as const,
      note: "Demo review: make the call to action more specific to the team’s next meeting.",
    },
    {
      subject: "Take the session into your next team discussion",
      body: "Bring one workflow to your team’s next discussion. The guide’s worksheet helps you identify the task, check the available information and define a useful outcome.\n\nEvery pilot needs a named human reviewer.\n\nShare the guide with your team.",
      headline: "Turn the conversation into a practical exercise",
      review: "Pending" as const,
      note: "Demo review: awaiting the event owner’s input.",
    },
  ];
  s.lab.drafts = s.lab.audiences.map((a, i) => ({
    id: `demo-draft-${i + 1}`,
    audienceId: a.id,
    audienceName: a.name,
    signature: signature(s.lab, a),
    mode: "Practice",
    ...copy[i],
    rationale:
      "Handwritten fictional sample for testing draft review and comparison. Not AI-generated.",
    createdAt: "2026-09-21T12:00:00Z",
    seconds: 0,
    previous: {
      subject: "A guide for your team",
      body: "Explore the guide and use the worksheet to plan a pilot.",
      headline: "Start a pilot discussion",
    },
  }));
  s.actions = [
    {
      id: "demo-a1",
      useCase: "s3",
      task: "Choose a real approved source asset and confirm usage permission.",
      owner: "Demo content owner",
      when: "First · before rehearsal",
      blockedBy: "Asset selection",
      sponsorship: "Confirm which team can supply the source.",
      status: "Proposed",
    },
    {
      id: "demo-a2",
      useCase: "s3",
      task: "Rehearse three audience variants and record review effort.",
      owner: "Demo facilitator",
      when: "Second · after source approval",
      blockedBy: "Approved source and named reviewer",
      sponsorship: "Agree who will judge usefulness in the room.",
      status: "Proposed",
    },
    {
      id: "demo-a3",
      useCase: "s2",
      task: "Verify which cohort signals are available for a recommendation test.",
      owner: "",
      when: "Third · before pilot scoping",
      blockedBy: "Data access and source-of-truth decision",
      sponsorship: "Nominate a person to verify signal coverage.",
      status: "Unknown",
    },
    {
      id: "demo-a4",
      useCase: "s5",
      task: "Bring five routine requests to classify with the MOPS team.",
      owner: "Demo operations lead",
      when: "Next working session",
      blockedBy: "",
      sponsorship: "",
      status: "Confirmed",
    },
  ];
  s.parking =
    "DEMO: Who can confirm source access?\nDEMO: What would count as enough evidence to run a pilot?";
  s.timer = { stage: 1, remaining: 1800, runningSince: null };
  let demo = addDemoGuideExamples(s);
  demo = saveInterpretation(demo, "s3", 0, {
    coverage: "Works with gaps",
    status: "Confirmed",
    change:
      "Make the approved source and version easy to find across the tools already in use.",
    nextOwner: "Demo content operations lead",
  });
  demo = saveInterpretation(demo, "s3", 1, {
    coverage: "Works with gaps",
    status: "Proposed",
  });
  demo = reviewWorkflow(demo, "s3", 0, {
    choice: "Keep",
    systems:
      "Sample analytics workspace — compare activity\nSample audience brief — record the need",
    handoff: "Audience brief with source signals goes to the content lead.",
    controls:
      "The audience lead checks signal coverage and contact permissions.",
    owner: "Demo audience lead",
    next: "Verify available audience signals before the pilot.",
  });
  demo = reviewWorkflow(demo, "s3", 1, {
    choice: "Change",
    change:
      "Use the existing approved library first; verify whether the proposed asset system is needed.",
    systems:
      "Sample approved library — source and version\nSample review log — approval record",
    handoff: "Approved source and permitted claims pass to the writer.",
    controls: "The content lead verifies the version before drafting.",
    owner: "Demo content lead",
    next: "Bring an approved source and its version record.",
  });
  demo = reviewWorkflow(demo, "s3", 3, {
    choice: "Unresolved",
    owner: "Demo operations lead",
    next: "Decide who gives final approval and how it reaches delivery.",
  });
  return demo;
}

/** Add missing rehearsal answers without replacing the user's existing demo edits. */
export function addDemoGuideExamples(session: Session): Session {
  let s = session;
  const examples: Record<string, string[]> = {
    s1: [
      "The account owner checks contact roles in the CRM and fills gaps in a shared account sheet.",
      "An analyst combines website activity, event attendance and sales notes in a weekly account review.",
      "Marketing and sales compare planned outreach in a shared calendar before contacting the account.",
      "The team checks meetings and opportunity movement; individual engagement is easier to see than buying-group progress.",
    ],
    s2: [
      "A weekly report combines website visits, content engagement and event attendance to flag audiences needing attention.",
      "A marketer reviews recent activity alongside account context and asks sales about intent.",
      "The marketer chooses content, an event invitation, a sales follow-up or no action, and records the rationale in a brief.",
      "The next weekly review compares response and progression; the original rationale is not consistently linked to the result.",
    ],
    s3: [
      "Approved assets live in a shared library. A separate review record holds approval and version details.",
      "The team manually combines content engagement, event attendance and sales context to write audience briefs.",
      "A writer adapts the approved source for each audience in a document. A reviewer checks claims; operations copies approved versions into the delivery tool.",
      "The team checks engagement by campaign. Editing effort and audience progression across touchpoints are not consistently connected.",
    ],
    s4: [
      "The campaign owner assembles an audience brief, approved copy and a channel checklist before requesting launch.",
      "Brand and operations review the draft in a shared document. Changes can trigger another review.",
      "Operations builds the campaign in a delivery tool, runs a test and schedules it after sign-off.",
      "Request and approval timestamps show some waiting time, but rework in chat is not tracked.",
    ],
    s5: [
      "Requests arrive through a shared form and sometimes chat. Operations copies them into the queue.",
      "The specialist checks a checklist for routine requests and asks for missing audience or approval details.",
      "Operations uses saved templates for recurring requests and manually verifies the result.",
      "Unusual cases go to a specialist. The requester gets an update in the ticket when someone takes ownership.",
    ],
    s6: [
      "The account owner flags sensitive contacts in the CRM and tells marketing about active conversations.",
      "A marketer sends the proposed action and account context to the relationship owner for a decision.",
      "Operations can pause scheduled delivery; late requests depend on someone seeing the message in time.",
      "The decision is noted in the request record, with some supporting context still left in chat.",
    ],
    s7: [
      "An analyst pulls channel reports, event attendance and sales outcomes into a weekly report.",
      "Audience comparisons use a spreadsheet. Following one audience across touchpoints requires manual matching.",
      "Marketing reviews the results and adjusts the next audience brief and message priorities.",
      "A weekly meeting shares recommendations; the next campaign may already be in production before the report arrives.",
    ],
  };
  const tools: Record<string, string> = {
    data: "Sample CRM — account and contact records\nSample warehouse — website, content and event history\nSample identity service — person-to-account matching",
    reasoning:
      "Sample analytics workspace — compare audience activity\nSample planning document — record interpretation and recommended action",
    surface:
      "Sample request workspace — marketer input and progress\nSample team chat — follow-up questions",
    content:
      "Sample asset library — approved source and version\nSample document editor — audience variants\nSample review tool — comments and approval record",
    activation:
      "Sample marketing delivery tool — audience setup and delivery\nSample request queue — handoffs and launch checklist",
    measurement:
      "Sample analytics workspace — audience journeys and drop-off\nSample reporting sheet — review notes and production effort",
    sales:
      "Sample CRM — relationship context\nSample request queue — specialist follow-up",
  };
  for (const [caseId, questions] of Object.entries(currentQuestions))
    questions.forEach((q, i) => {
      if (!findAnswer(s, caseId, q))
        s = editAnswer(s, caseId, q, {
          evidence: "Fictional example: " + examples[caseId][i],
          system: tools[q.layer],
          owner: "Demo team lead — verify with the real operator",
          gap: "The process works manually. Confirm actual coverage, delays and handoffs with the team.",
          fit: "Unknown",
          status: i === 3 ? "Unknown" : "Proposed",
        });
    });
  return s;
}
