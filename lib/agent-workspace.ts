import { createSession, parseSession, type Session } from "./workshop";
export const AGENT_KEY = "oai-agent-workspace-v1";
export const availability = [
  "Unknown",
  "Available now",
  "Feasible internally",
  "Needs additional capability",
] as const;
export const priorities = [
  "To discuss",
  "Priority",
  "Later",
  "Not needed",
] as const;
export const chapters = [
  {
    id: "s2",
    time: "09:30",
    title: "Signal to action",
    short: "Find the opportunity",
    prompt: "Where should we focus today?",
    story:
      "Morgan opens her workspace. The agent has found an audience worth considering. Before she acts, she needs to know why this recommendation is credible.",
    response:
      "I found a possible gap between product interest and buying-group engagement. Here is an action to review, with the evidence it would require.",
    inputs: [
      [
        "Product signals",
        "Recent usage and intent, with permission to use it.",
      ],
      [
        "Journey and account context",
        "Website, event and CRM activity linked to the right people and accounts.",
      ],
      [
        "Recommendation logic",
        "Explain why this audience, why this action and why now.",
      ],
    ],
    action: "Review audience recommendation",
    human:
      "Morgan checks the rationale and sets the objective. The agent assembles evidence and proposes the next action.",
    output: "An audience definition and a defensible action brief.",
    proof:
      "Can richer journey and account signals produce a better recommendation than product telemetry alone?",
  },
  {
    id: "s3",
    time: "11:00",
    title: "Content at scale",
    short: "Make it relevant",
    prompt: "Turn this opportunity into an audience-specific plan.",
    story:
      "Morgan wants to reach different people with a relevant message. The agent prepares a coordinated plan using approved material, and brings the choices that need judgment back to her.",
    response:
      "I can prepare a plan for each audience, check approved source material and route the work for review. Choose the conditions below to see the plan adapt.",
    inputs: [
      [
        "Audience context",
        "Segment needs, buying roles, eligibility and consent.",
      ],
      [
        "Approved material",
        "Searchable source assets, usage rights, brand rules and localization needs.",
      ],
      [
        "Orchestration and activation",
        "Content operations, approval routing and channel handoffs.",
      ],
    ],
    action: "Approve simulated plan",
    human:
      "The agent prepares the brief and routes the work. Morgan reviews the audience promise and approves the proposed plan; required legal and brand reviews still apply.",
    output:
      "Segment briefs, asset requirements and an approval-to-activation handoff.",
    proof:
      "Can one approved source support relevant audience variants with traceable review and channel handoffs?",
  },
  {
    id: "s5",
    time: "15:00",
    title: "Routine marketing operations",
    short: "Keep work moving",
    prompt: "What needs my attention, and what can you handle?",
    story:
      "Morgan returns to an exception queue. Routine requests have a proposed resolution; ambiguous or higher-risk cases need a person. The room decides where that boundary belongs.",
    response:
      "I have prepared resolutions for routine requests and isolated one exception. Nothing has been executed. Review the proposed boundary before allowing the agent to act.",
    inputs: [
      [
        "Request and campaign context",
        "A queue of requests with campaign state, policies and permissions.",
      ],
      [
        "Action tools",
        "Scoped access to validate links, prepare tickets and check campaign setup.",
      ],
      [
        "Audit and escalation",
        "An action record, failure handling and a named escalation path.",
      ],
    ],
    action: "Approve simulated routing",
    human:
      "The agent handles only explicitly permitted routine actions. Morgan resolves exceptions and changes policy; ambiguous permission stays with a person.",
    output:
      "Resolved routine requests, a visible exception queue and an audit trail.",
    proof:
      "Can routine work be resolved safely, with exceptions escalated and every action traceable?",
  },
] as const;
export type Finding = {
  priority: string;
  process: string;
  capabilities: Record<string, string>;
  note: string;
  proof: string;
  owner: string;
  decision: string;
};
export type AgentState = {
  findings: Record<string, Finding>;
  audience: string;
  channel: string;
  source: string;
  outcomes: Record<string, string>;
  architecture: Session;
};
export function createAgentState(): AgentState {
  const architecture = createSession();
  architecture.selected = ["s2", "s3", "s5"];
  return {
    findings: Object.fromEntries(
      chapters.map((c) => [
        c.id,
        {
          priority: "To discuss",
          process: "Unknown",
          capabilities: {},
          note: "",
          proof: c.proof,
          owner: "",
          decision: "",
        },
      ]),
    ),
    audience: "Buying roles",
    channel: "Email + event follow-up",
    source: "Approved source available",
    outcomes: {},
    architecture,
  };
}
export function restoreAgentState(raw: unknown): AgentState {
  const base = createAgentState();
  if (!raw || typeof raw !== "object") throw Error("Invalid backup");
  const r = raw as AgentState;
  if (!r.findings || !r.architecture) throw Error("Invalid backup");
  for (const c of chapters) {
    const f = r.findings[c.id];
    if (
      !f ||
      !priorities.includes(f.priority as (typeof priorities)[number]) ||
      ![
        "Unknown",
        "Established process",
        "Informal workaround",
        "Not done today",
      ].includes(f.process) ||
      !f.capabilities ||
      typeof f.capabilities !== "object" ||
      ["note", "proof", "owner", "decision"].some(
        (k) => typeof f[k as keyof Finding] !== "string",
      )
    )
      throw Error("Invalid findings");
    const capabilities: Record<string, string> = {};
    for (const [label] of c.inputs) {
      const v = f.capabilities[label];
      if (v !== undefined) {
        if (!availability.includes(v as (typeof availability)[number]))
          throw Error("Invalid capability");
        capabilities[label] = v;
      }
    }
    base.findings[c.id] = {
      priority: f.priority,
      process: f.process,
      capabilities,
      note: f.note,
      proof: f.proof,
      owner: f.owner,
      decision: f.decision,
    };
  }
  if (
    !["Buying roles", "Lifecycle stages", "One audience"].includes(
      r.audience,
    ) ||
    ![
      "Email + event follow-up",
      "Email + website",
      "Email + sales follow-up",
    ].includes(r.channel) ||
    !["Approved source available", "Source material missing"].includes(r.source)
  )
    throw Error("Invalid scenario");
  base.audience = r.audience;
  base.channel = r.channel;
  base.source = r.source;
  for (const c of chapters)
    if (typeof r.outcomes?.[c.id] === "string")
      base.outcomes[c.id] = r.outcomes[c.id];
  base.architecture = parseSession(r.architecture);
  return base;
}
export function planRows(
  s: Pick<AgentState, "audience" | "channel" | "source">,
) {
  return [
    {
      label: "Audience",
      value:
        s.audience === "Buying roles"
          ? "Technical evaluator · Business sponsor · Procurement"
          : s.audience === "Lifecycle stages"
            ? "Exploring · Evaluating · Ready for sales"
            : "One eligible audience",
      detail:
        "Resolve identity and consent before creating the activation audience.",
    },
    {
      label: "Content",
      value:
        s.source === "Approved source available"
          ? "Adapt from an approved source"
          : "Pause adaptation · source material needed",
      detail:
        s.source === "Approved source available"
          ? "Prepare role-specific briefs; preserve source claims and review requirements."
          : "Create a source brief and assign approval before variants can proceed.",
    },
    {
      label: "Activation",
      value: s.channel,
      detail: s.channel.includes("event")
        ? "Separate invitations, attendee follow-up and non-attendee follow-up."
        : s.channel.includes("sales")
          ? "Prepare a coordinated handoff with account context for sales."
          : "Prepare channel-specific requirements and eligibility checks.",
    },
    {
      label: "Learning",
      value: "Return response signals to the journey",
      detail:
        "Compare audience response and recommend the next action; do not treat engagement as proven revenue impact.",
    },
  ];
}
export function architectureSession(s: AgentState): Session {
  return {
    ...s.architecture,
    selected: chapters
      .filter((c) => s.findings[c.id].priority !== "Not needed")
      .map((c) => c.id),
    architectureAdditions: [
      ...s.architecture.architectureAdditions.filter(
        (a) => !a.id.startsWith("agent-"),
      ),
      ...chapters.map((c) => {
        const f = s.findings[c.id];
        return {
          id: "agent-" + c.id,
          useCase: c.id,
          owner: f.owner,
          note: `${c.title} — ${f.priority}. Process: ${f.process}. ${c.inputs.map(([label]) => `${label}: ${f.capabilities[label] || "Unknown"}`).join("; ")}. Room finding: ${f.note || "Not captured"}. Decision / dependency: ${f.decision || "Not captured"}. Prove: ${f.proof}`,
        };
      }),
    ],
  };
}
export function agentReadout(s: AgentState) {
  return (
    "# Agent-led marketing workshop\n\nIllustrative product simulation; capability statements below are room inputs, not verified integrations.\n\n" +
    chapters
      .map((c) => {
        const f = s.findings[c.id];
        return `## ${c.title} — ${f.priority}\n\nProcess: ${f.process}\n\n${c.inputs.map(([label]) => `- ${label}: ${f.capabilities[label] || "Unknown"}`).join("\n")}\n\nRoom finding: ${f.note || "Not captured"}\n\nProve: ${f.proof}\n\nDecision / dependency: ${f.decision || "Not captured"}\n\nOwner: ${f.owner || "Unassigned"}`;
      })
      .join("\n\n")
  );
}
