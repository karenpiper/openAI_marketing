import { workflows, workflowState } from "./architecture-workflow";
import { defaults, restore, type StateMap } from "./assessment";
import { useCases, decisions } from "./workshop-data";

export const SESSION_KEY = "oai-full-workshop-v1";
export const statuses = [
  "Proposed",
  "Confirmed",
  "Disputed",
  "Unknown",
] as const;
export type Status = (typeof statuses)[number];
export const stages = [
  {
    title: "Use cases",
    subtitle: "Which problems earn priority?",
    minutes: 30,
  },
  { title: "Current state", subtitle: "What can we build on?", minutes: 30 },
  {
    title: "Architecture",
    subtitle: "How should the work connect?",
    minutes: 45,
  },
  { title: "Readout", subtitle: "What have we agreed to do?", minutes: 15 },
];
export const layerSeeds = [
  {
    id: "surface",
    title: "Marketer surface",
    suggestion: "Codex / ChatGPT Work / agent interfaces",
    boundary: "OpenAI",
    purpose: "Where the marketer asks, reviews and acts",
  },
  {
    id: "reasoning",
    title: "Reasoning & audience decisions",
    suggestion: "OpenAI-owned reasoning and growth tools",
    boundary: "OpenAI",
    purpose: "Interpret signals and choose an action",
  },
  {
    id: "data",
    title: "Data & identity",
    suggestion: "OpenAI Data Lake / identity / buying groups",
    boundary: "OpenAI + Adobe",
    purpose: "Resolve people and accounts; establish authoritative data",
  },
  {
    id: "content",
    title: "Content operations",
    suggestion: "Approved assets / Adobe CSC / Workfront",
    boundary: "Adobe + OpenAI",
    purpose: "Find source material, create variants and manage review",
  },
  {
    id: "activation",
    title: "Activation & touchpoints",
    suggestion: "Marketo / marketing CRM / website / events",
    boundary: "To confirm",
    purpose: "Deliver messages and record engagement",
  },
  {
    id: "measurement",
    title: "Measurement & learning",
    suggestion: "Journey measurement feeding OpenAI attribution",
    boundary: "OpenAI + Adobe",
    purpose: "Compare audience journeys and inform the next decision",
  },
  {
    id: "sales",
    title: "Sales & offer tools",
    suggestion: "Salesforce / existing CRM and offer tools",
    boundary: "OpenAI",
    purpose: "Coordinate relationship context and sales handoffs",
  },
];
export type Synthesis = {
  name: string;
  coverage:
    | "Not established"
    | "Works today"
    | "Works with gaps"
    | "Not in place";
  change: string;
  nextOwner: string;
  source: string;
  status: Status;
};
export function synthesisSource(c: Capability): string {
  return JSON.stringify([c.evidence, c.system, c.owner, c.gap, c.status]);
}
export function synthesisStatus(c: Capability): string {
  return c.synthesis?.source === synthesisSource(c)
    ? c.synthesis.status
    : "Needs recheck";
}
export type Capability = {
  synthesis?: Synthesis;
  questionId?: string;
  id: string;
  useCase: string;
  name: string;
  system: string;
  fit: "Unknown" | "Reuse" | "Extend" | "Missing";
  owner: string;
  evidence: string;
  gap: string;
  status: Status;
};
export type Boundary = {
  id: string;
  useCase: string;
  layer: string;
  system: string;
  owner: string;
  implementer: string;
  truth: string;
  state: string;
  control: string;
  status: Status;
};
export type Handoff = {
  id: string;
  useCase: string;
  from: string;
  to: string;
  payload: string;
  trigger: string;
  owner: string;
  control: string;
  status: Status;
};
export type Decision = {
  id: string;
  title: string;
  useCase: string;
  answer: string;
  owner: string;
  due: string;
  status: Status;
};
export type Action = {
  id: string;
  useCase: string;
  task: string;
  owner: string;
  when: string;
  blockedBy: string;
  sponsorship: string;
  status: Status;
};
export type Audience = {
  id: string;
  name: string;
  signal: string;
  need: string;
  cta: string;
};
export type Draft = {
  id: string;
  audienceId: string;
  audienceName: string;
  signature: string;
  mode: "Practice" | "AI";
  subject: string;
  body: string;
  headline: string;
  rationale: string;
  review: "Pending" | "Usable" | "Needs edits" | "Rejected";
  note: string;
  createdAt: string;
  seconds: number;
  previous?: { subject: string; body: string; headline: string };
};
export type Lab = {
  useCase: string;
  title: string;
  source: string;
  fixed: string;
  guidance: string;
  sourceStatus: "Practice" | "Approved for exercise";
  approvedBy: string;
  audiences: Audience[];
  drafts: Draft[];
  baseline: string;
  editMinutes: string;
  result: string;
  status: Status;
};
export type WorkflowReview = {
  useCase: string;
  step: number;
  choice: "Not reviewed" | "Keep" | "Change" | "Unresolved";
  change: string;
  owner: string;
  next: string;
  source: string;
};
export type Session = {
  overview: boolean;
  attendees: string;
  workflowReviews: WorkflowReview[];
  schema: 1;
  title: string;
  stage: number;
  scene: number;
  focus: string;
  architectureTab: "map" | "lab";
  guide: { current: number; architecture: number };
  assessments: StateMap;
  selected: string[];
  selectionSignature: string;
  selectionBy: string;
  capabilities: Capability[];
  boundaries: Boundary[];
  handoffs: Handoff[];
  decisions: Decision[];
  actions: Action[];
  parking: string;
  lab: Lab;
  timer: { stage: number; remaining: number; runningSince: number | null };
};
export const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function practiceLab(): Lab {
  return {
    useCase: "s3",
    title: "A practical guide to choosing a first AI workflow",
    source:
      "Fictional practice asset, not an OpenAI product claim.\nThe guide helps teams choose one repeatable workflow for an AI pilot. It includes a worksheet for naming the task, checking what information is available, choosing a human reviewer and defining a useful outcome. Teams can use the worksheet to prepare a pilot discussion.",
    fixed:
      "Do not claim security certifications, guaranteed savings or autonomous execution. Keep this sentence exactly: Every pilot needs a named human reviewer.",
    guidance:
      "Plain language. One short email per audience and one landing-page headline. Match the emphasis and call to action to the stated need. Use only facts in the source.",
    sourceStatus: "Practice",
    approvedBy: "",
    audiences: [
      {
        id: "a1",
        name: "Exploring a first use case",
        signal:
          "Visited the use-case page and downloaded an introductory article.",
        need: "Find a practical place to start.",
        cta: "Explore the worksheet",
      },
      {
        id: "a2",
        name: "Evaluating a pilot",
        signal: "Read implementation material and returned to the website.",
        need: "Decide what to measure and who should review the work.",
        cta: "Plan a pilot discussion",
      },
      {
        id: "a3",
        name: "Following up after an event",
        signal: "Attended a session and asked how to take the next step.",
        need: "Turn the discussion into a concrete team exercise.",
        cta: "Share the guide with your team",
      },
    ],
    drafts: [],
    baseline: "",
    editMinutes: "",
    result: "",
    status: "Proposed",
  };
}
export function createSession(): Session {
  return {
    schema: 1,
    overview: true,
    attendees: "",
    workflowReviews: [],
    title: "OpenAI × Adobe × Code and Theory",
    stage: 0,
    scene: 0,
    focus: "s3",
    architectureTab: "map",
    guide: { current: 0, architecture: 0 },
    assessments: defaults(),
    selected: [],
    selectionSignature: "",
    selectionBy: "",
    capabilities: [],
    boundaries: [],
    handoffs: [],
    decisions: decisions.map((d) => ({
      id: `d${d.num}`,
      title: d.t,
      useCase: "",
      answer: "",
      owner: "",
      due: "",
      status: "Unknown",
    })),
    actions: [],
    parking: "",
    lab: practiceLab(),
    timer: { stage: 0, remaining: 1800, runningSince: null },
  };
}
export function activeCases(s: Session) {
  return useCases.filter(
    (u) => s.selected.includes(u.id) && !s.assessments[u.id].veto,
  );
}
export function selectionStamp(s: Session) {
  return JSON.stringify(activeCases(s).map((u) => [u.id, s.assessments[u.id]]));
}
export function selectionConfirmed(s: Session) {
  return (
    activeCases(s).length > 0 &&
    s.selectionSignature === selectionStamp(s) &&
    !!s.selectionBy.trim()
  );
}
export function signature(lab: Lab, a: Audience) {
  return JSON.stringify([
    lab.title,
    lab.source,
    lab.fixed,
    lab.guidance,
    lab.sourceStatus,
    lab.approvedBy,
    a,
  ]);
}
export function draftCurrent(lab: Lab, d: Draft) {
  const a = lab.audiences.find((a) => a.id === d.audienceId);
  return !!a && d.signature === signature(lab, a);
}
export function practiceDraft(
  lab: Lab,
  a: Audience,
): Omit<Draft, "id" | "createdAt" | "seconds"> {
  return {
    audienceId: a.id,
    audienceName: a.name,
    signature: signature(lab, a),
    mode: "Practice",
    subject: `${lab.title}: ${a.name}`,
    headline: `${lab.title} — ${a.need}`,
    body: `You’re looking to ${a.need.charAt(0).toLowerCase() + a.need.slice(1)}\n\n${lab.source}\n\n${lab.fixed}\n\n${a.cta}`,
    rationale: `Template assembly for rehearsal. Audience context: ${a.signal}. The source and fixed wording are copied verbatim; a writer must interpret guidance and polish the result.`,
    review: "Pending",
    note: "",
  };
}

const record = (v: unknown): Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
const str = (v: unknown, f = "") =>
  typeof v === "string" ? v.slice(0, 30000) : f;
const choice = <T extends string>(
  v: unknown,
  options: readonly T[],
  fallback: T,
): T => (options.includes(v as T) ? (v as T) : fallback);
function rows<T>(v: unknown, read: (r: Record<string, unknown>) => T): T[] {
  return Array.isArray(v)
    ? v
        .slice(0, 200)
        .filter((x) => x && typeof x === "object" && !Array.isArray(x))
        .map((x) => read(record(x)))
    : [];
}
const status = (r: Record<string, unknown>) =>
  choice(r.status, statuses, "Unknown");
const id = (r: Record<string, unknown>) => str(r.id) || newId();
const uc = (v: unknown) =>
  useCases.some((u) => u.id === v) ? (v as string) : "";
export function parseSession(raw: unknown): Session {
  const r = record(raw);
  if (r.schema !== 1 || !r.assessments || !Array.isArray(r.selected) || !r.lab)
    throw Error("This is not a supported workshop backup.");
  const s = createSession();
  s.title = str(r.title, s.title);
  s.overview = r.overview !== false;
  s.attendees = str(r.attendees);
  s.stage =
    typeof r.stage === "number" &&
    Number.isInteger(r.stage) &&
    r.stage >= 0 &&
    r.stage <= 3
      ? r.stage
      : 0;
  s.scene =
    typeof r.scene === "number" &&
    Number.isInteger(r.scene) &&
    r.scene >= 0 &&
    r.scene <= 9
      ? r.scene
      : 0;
  s.focus = uc(r.focus) || "s3";
  s.architectureTab = choice(r.architectureTab, ["map", "lab"], "map");
  const guide = record(r.guide);
  const step = (v: unknown, max: number) =>
    typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= max ? v : 0;
  s.guide = {
    current: step(guide.current, 4),
    architecture: step(guide.architecture, 5),
  };
  s.assessments = restore(r.assessments);
  s.selected = Array.isArray(r.selected)
    ? [...new Set(r.selected.map(uc).filter(Boolean))]
    : [];
  s.selectionSignature =
    typeof r.selectionSignature === "string"
      ? r.selectionSignature.slice(0, 300000)
      : "";
  s.selectionBy = str(r.selectionBy);
  s.parking = str(r.parking);
  s.capabilities = rows(r.capabilities, (x) => ({
    ...(typeof x.questionId === "string"
      ? { questionId: str(x.questionId) }
      : {}),
    ...(x.synthesis && typeof x.synthesis === "object"
      ? {
          synthesis: (() => {
            const v = record(x.synthesis);
            return {
              name: str(v.name),
              coverage: choice(
                v.coverage,
                [
                  "Not established",
                  "Works today",
                  "Works with gaps",
                  "Not in place",
                ],
                "Not established",
              ) as Synthesis["coverage"],
              change: str(v.change),
              nextOwner: str(v.nextOwner),
              source: str(v.source),
              status: status(v),
            };
          })(),
        }
      : {}),
    id: id(x),
    useCase: uc(x.useCase),
    name: str(x.name),
    system: str(x.system),
    fit: choice(x.fit, ["Unknown", "Reuse", "Extend", "Missing"], "Unknown"),
    owner: str(x.owner),
    evidence: str(x.evidence),
    gap: str(x.gap),
    status: status(x),
  }));
  s.workflowReviews = rows(r.workflowReviews, (x) => ({
    useCase: uc(x.useCase),
    step:
      typeof x.step === "number" &&
      Number.isInteger(x.step) &&
      x.step >= 0 &&
      x.step < 5
        ? x.step
        : 0,
    choice: choice(
      x.choice,
      ["Not reviewed", "Keep", "Change", "Unresolved"],
      "Not reviewed",
    ) as WorkflowReview["choice"],
    change: str(x.change),
    owner: str(x.owner),
    next: str(x.next),
    source: typeof x.source === "string" ? x.source.slice(0, 500000) : "",
  }));
  s.boundaries = rows(r.boundaries, (x) => ({
    id: id(x),
    useCase: uc(x.useCase),
    layer: str(x.layer),
    system: str(x.system),
    owner: str(x.owner),
    implementer: str(x.implementer),
    truth: str(x.truth),
    state: str(x.state),
    control: str(x.control),
    status: status(x),
  }));
  s.handoffs = rows(r.handoffs, (x) => ({
    id: id(x),
    useCase: uc(x.useCase),
    from: str(x.from),
    to: str(x.to),
    payload: str(x.payload),
    trigger: str(x.trigger),
    owner: str(x.owner),
    control: str(x.control),
    status: status(x),
  }));
  s.decisions = rows(r.decisions, (x) => ({
    id: id(x),
    title: str(x.title),
    useCase: uc(x.useCase),
    answer: str(x.answer),
    owner: str(x.owner),
    due: str(x.due),
    status: status(x),
  }));
  s.actions = rows(r.actions, (x) => ({
    id: id(x),
    useCase: uc(x.useCase),
    task: str(x.task),
    owner: str(x.owner),
    when: str(x.when),
    blockedBy: str(x.blockedBy),
    sponsorship: str(x.sponsorship),
    status: status(x),
  }));
  const l = record(r.lab);
  if (Object.keys(l).length) {
    s.lab = {
      ...s.lab,
      useCase: uc(l.useCase),
      title: str(l.title),
      source: str(l.source),
      fixed: str(l.fixed),
      guidance: str(l.guidance),
      sourceStatus: choice(
        l.sourceStatus,
        ["Practice", "Approved for exercise"],
        "Practice",
      ),
      approvedBy: str(l.approvedBy),
      baseline: str(l.baseline),
      editMinutes: str(l.editMinutes),
      result: str(l.result),
      status: status(l),
    };
    s.lab.audiences = rows(l.audiences, (a) => ({
      id: id(a),
      name: str(a.name),
      signal: str(a.signal),
      need: str(a.need),
      cta: str(a.cta),
    })).slice(0, 6);
    s.lab.drafts = rows(l.drafts, (d) => ({
      id: id(d),
      audienceId: str(d.audienceId),
      audienceName: str(d.audienceName),
      signature:
        typeof d.signature === "string" ? d.signature.slice(0, 100000) : "",
      mode: choice(d.mode, ["Practice", "AI"], "Practice"),
      subject: str(d.subject),
      body: str(d.body),
      headline: str(d.headline),
      rationale: str(d.rationale),
      review: choice(
        d.review,
        ["Pending", "Usable", "Needs edits", "Rejected"],
        "Pending",
      ),
      note: str(d.note),
      createdAt: str(d.createdAt),
      seconds:
        typeof d.seconds === "number" && Number.isFinite(d.seconds)
          ? Math.max(0, d.seconds)
          : 0,
      ...(d.previous
        ? {
            previous: {
              subject: str(record(d.previous).subject),
              body: str(record(d.previous).body),
              headline: str(record(d.previous).headline),
            },
          }
        : {}),
    }));
  }
  const t = record(r.timer);
  s.timer = {
    stage: s.stage,
    remaining:
      typeof t.remaining === "number" && Number.isFinite(t.remaining)
        ? Math.max(0, Math.min(7200, t.remaining))
        : stages[s.stage].minutes * 60,
    runningSince:
      typeof t.runningSince === "number" && Number.isFinite(t.runningSince)
        ? t.runningSince
        : null,
  };
  return s;
}
export function readout(s: Session): string {
  const name = (id: string) =>
    (useCases.find((u) => u.id === id)?.label || "Workshop-wide") +
    (id && !activeCases(s).some((u) => u.id === id)
      ? " (outside current working set)"
      : "");
  return [
    `# Workshop readout\n${s.title}\n\nWorking set: ${selectionConfirmed(s) ? `Confirmed by ${s.selectionBy}` : "Proposed / needs confirmation"}`,
    `Attendees: ${s.attendees || "Not recorded"}`,
    "## Priority use cases",
    ...activeCases(s).map(
      (u) =>
        `### ${u.label}\nGrowth: ${u.kpiGrowth}\nProductivity: ${u.kpiProd}\nProve: ${s.assessments[u.id].proofText}\nCan move now: ${s.assessments[u.id].noRegret}\nDependency: ${u.dependsOn}\nRoom notes: ${s.assessments[u.id].note || "None captured"}`,
    ),
    "## Ruled out",
    ...useCases
      .filter((u) => s.assessments[u.id].veto)
      .map((u) => `${u.label}: ${s.assessments[u.id].note || "No note"}`),
    "## Current capabilities",
    ...s.capabilities.map(
      (c) =>
        `${name(c.useCase)} | ${c.name} | ${c.fit} | ${c.status}\nSystem: ${c.system || "Unknown"}; owner: ${c.owner || "Unassigned"}\nEvidence: ${c.evidence || "Not captured"}\nWhat works / needs work: ${c.gap || "Not captured"}`,
    ),
    "## Live capability map",
    ...s.capabilities
      .filter((c) => c.synthesis)
      .map(
        (c) =>
          `${name(c.useCase)} | ${c.synthesis!.name} | ${synthesisStatus(c)}\nCoverage: ${c.synthesis!.coverage}\nChange to discuss: ${c.synthesis!.change || "Not captured"}\nWho takes it forward: ${c.synthesis!.nextOwner || "Unassigned"}\nBased on: ${c.evidence}\nTools and roles: ${c.system || "Unknown"}`,
      ),
    "## Proposed workflow decisions",
    ...s.workflowReviews
      .filter((r) => workflows[r.useCase]?.[r.step])
      .map(
        (r) =>
          `${name(r.useCase)} | ${workflows[r.useCase][r.step].title} | ${workflowState(s, r.useCase, r.step).stale ? "Evidence changed — recheck" : r.choice}\nProposal: ${workflows[r.useCase][r.step].proposal}\nCorrection: ${r.change || "None captured"}\nOwner: ${r.owner || "Unassigned"}\nNext decision or action: ${r.next || "Not captured"}`,
      ),
    "## Architecture boundaries",
    ...s.boundaries.map(
      (b) =>
        `${name(b.useCase)} | ${b.layer} | ${b.status}\nSystem: ${b.system || "Unknown"}; owner: ${b.owner || "Unassigned"}; implementation: ${b.implementer || "Unassigned"}\nSource of truth: ${b.truth || "Unknown"}; state: ${b.state || "Unknown"}\nControls: ${b.control || "Unknown"}`,
    ),
    "## Handoffs",
    ...s.handoffs.map(
      (h) =>
        `${name(h.useCase)} | ${h.from} → ${h.to} | ${h.status}\nPayload: ${h.payload}; trigger: ${h.trigger}; owner: ${h.owner}; control: ${h.control}`,
    ),
    "## Decisions",
    ...s.decisions.map(
      (d) =>
        `${d.status}: ${d.title}\n${d.answer || "Open"}\nOwner: ${d.owner || "Unassigned"}; needed by: ${d.due || "Not set"}; scope: ${name(d.useCase)}`,
    ),
    "## Content exercise",
    `Use case: ${name(s.lab.useCase)}\nSource: ${s.lab.title} (${s.lab.sourceStatus})\nBaseline minutes: ${s.lab.baseline || "Not captured"}; editing minutes: ${s.lab.editMinutes || "Not captured"}\nResult (${s.lab.status}): ${s.lab.result || "Not yet assessed"}`,
    ...s.lab.drafts.map(
      (d) =>
        `${d.audienceName} | ${d.mode} | ${draftCurrent(s.lab, d) ? d.review : "Outdated — review again"}\nSubject: ${d.subject}\n${d.body}\nHeadline: ${d.headline}\nReview note: ${d.note}`,
    ),
    "## Sequence and sponsorship",
    ...s.actions.map(
      (a, i) =>
        `${i + 1}. ${a.task || "Untitled action"} (${a.status})\nUse case: ${name(a.useCase)}; owner: ${a.owner || "Unassigned"}; timing: ${a.when || "Not set"}\nBlocked by: ${a.blockedBy || "None captured"}\nAsk for Colin: ${a.sponsorship || "None captured"}`,
    ),
    "## Parking lot",
    s.parking || "None captured",
  ].join("\n\n");
}
