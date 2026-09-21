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
    time: "09:15",
    title: "Signal to action",
    short: "An opportunity worth acting on",
    prompt: "Where should we focus today?",
    story:
      "Morgan opens the opportunity from her morning briefing. Technical users are engaged at 12 target accounts, but the broader buying group has not joined the conversation. She needs to decide whether to act.",
    response:
      "Usage is growing across 12 target accounts. Recent website and event activity reinforces technical interest, but business sponsors are underrepresented. I recommend a coordinated adoption campaign, with a different next step for each buying role.",
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
    action: "Build a plan for these accounts",
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
    short: "One brief. Three buying roles.",
    prompt: "Turn this opportunity into an audience-specific plan.",
    story:
      "The same account opportunity now has a brief. Morgan comes back to a proposed plan that carries the audience and objective forward, without asking her to start again.",
    response:
      "For the 12-account opportunity, I have prepared a technical evaluation path, a business-value path and a procurement-readiness path. They share one approved adoption guide. Review the plan below; I will coordinate asset preparation, approvals and channel handoffs.",
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
    action: "Approve the plan and continue the day",
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
    short: "The plan meets an exception",
    prompt: "What needs my attention, and what can you handle?",
    story:
      "Later, Morgan returns to the same campaign. Routine checks can follow the agreed rules, but one consent conflict needs a decision before that contact moves forward.",
    response:
      "For the adoption campaign, I have prepared link and setup checks. One contact has conflicting consent records. My recommendation: hold that contact, route the conflict to the data owner and let eligible contacts continue only after their required approvals. Release remains gated on review and eligibility.",
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
    action: "Hold the contact and review the day",
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
  day: {
    moment: number;
    history: { id: string; time: string; text: string }[];
  };
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
    day: { moment: 0, history: [] },
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
  if (r.day) {
    if (
      !Number.isInteger(r.day.moment) ||
      r.day.moment < 0 ||
      r.day.moment > 4 ||
      !Array.isArray(r.day.history) ||
      r.day.history.some(
        (h) =>
          !chapters.some((c) => c.id === h.id) ||
          typeof h.time !== "string" ||
          typeof h.text !== "string",
      )
    )
      throw Error("Invalid day");
    base.day = r.day;
  }
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

export function guidedReply(
  chapter: (typeof chapters)[number],
  prompt: string,
): string {
  const q = prompt.toLowerCase();
  if (/why these|why.*account/.test(q))
    return "These 12 accounts combine growing product engagement with website and event interest. Technical evaluators are active; business sponsors and procurement are less engaged. The proposed campaign closes that buying-group gap.";
  if (/happens next/.test(q))
    return chapter.id === "s2"
      ? "I’ll carry the account audience and adoption objective into one coordinated content plan. You review the message and channel mix before I route the work."
      : chapter.id === "s3"
        ? "After you approve the plan, I’ll prepare the asset and channel handoffs. Required reviews and eligibility checks still gate release."
        : "I’ll hold the affected contact for the data owner and keep approved work moving for eligible contacts. The unresolved exception stays visible.";
  if (/blocked/.test(q))
    return chapter.id === "s5"
      ? "One contact has conflicting consent records. That contact stays on hold until the data owner resolves the conflict."
      : "Release requires approved source material, completed reviews and eligible audiences. The plan can be prepared while these checks are pending.";

  if (/prove|proof|test|validat/.test(q)) return chapter.proof;
  if (/morgan|human|approv|person|judgment/.test(q)) return chapter.human;
  if (/need|input|tool|connect|capabilit|data/.test(q))
    return (
      chapter.inputs.map(([name, detail]) => `${name}: ${detail}`).join(" ") +
      " These are requirements to confirm, not connected tools."
    );
  if (/output|handoff|deliver/.test(q)) return chapter.output;
  return "This guided prototype can explain the required inputs, Morgan’s role, the handoff, or what we should prove. Use the plan controls to explore other audiences and channels; open-ended agent execution is not connected.";
}

export function advanceDay(s: AgentState, chapterIndex: number): AgentState {
  const c = chapters[chapterIndex];
  if (!c || (chapterIndex === 1 && s.source === "Source material missing"))
    return s;
  const text =
    chapterIndex === 0
      ? "Morgan chose the 12-account adoption opportunity. The agent will prepare an audience-specific plan."
      : chapterIndex === 1
        ? `Morgan approved the proposed plan: ${s.audience}; ${s.channel}; ${s.source}. Required reviews still precede release.`
        : "Morgan chose to hold the contact with conflicting consent and escalate to the data owner. Eligible contacts still require release approval.";
  return {
    ...s,
    outcomes: { ...s.outcomes, [c.id]: text },
    day: {
      moment: chapterIndex + 2,
      history: [
        ...s.day.history.filter(
          (h) => chapters.findIndex((ch) => ch.id === h.id) < chapterIndex,
        ),
        { id: c.id, time: c.time, text },
      ],
    },
  };
}
