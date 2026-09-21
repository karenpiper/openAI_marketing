import type { AgentState } from "./agent-workspace";
export type WorkStage = {
  title: string;
  action: string;
  summary: string;
  input: string;
  output: string;
  connection: string;
  enables: string;
  control: string;
  rows: [string, string, string][];
};
export function workStages(s: AgentState, id: string): WorkStage[] {
  if (id === "s2")
    return [
      {
        title: "Bring the signals together",
        action: "Inspect the buying-group gap",
        summary:
          "The agent groups recent activity by account before proposing a next action.",
        input:
          "Product usage, website activity, event engagement and account keys.",
        output: "A traceable account-level signal summary.",
        connection:
          "OpenAI data layer / S3 + product telemetry + journey analytics → agent workspace.",
        enables:
          "Combines activity across touchpoints instead of treating an email click as the whole journey.",
        control:
          "Read access and permitted identity joins; missing signals stay explicit.",
        rows: [
          [
            "Product engagement",
            "12 target accounts",
            "Growing usage in the illustrative cohort",
          ],
          [
            "Website + events",
            "Recent evaluation interest",
            "Corroborates intent across touchpoints",
          ],
          [
            "Identity match",
            "Account and role context",
            "Required before any audience is activated",
          ],
        ],
      },
      {
        title: "Explain the opportunity",
        action: "Prepare an action brief",
        summary:
          "Technical interest is present, but business sponsors and procurement need a different reason to engage.",
        input: "Joined activity, buying roles and engagement history.",
        output: "Buying-group gap and recommendation rationale.",
        connection: "Identity / CDP + CRM role context → OpenAI reasoning.",
        enables:
          "Distinguishes who is active from who is missing in the buying group.",
        control:
          "Confidence and provenance accompany the recommendation; Morgan chooses the objective.",
        rows: [
          ["Technical evaluators", "Active", "Offer an evaluation path"],
          [
            "Business sponsors",
            "Underrepresented",
            "Show adoption value and operating outcomes",
          ],
          [
            "Procurement",
            "Little visible activity",
            "Prepare approved governance material",
          ],
        ],
      },
      {
        title: "A brief ready to carry forward",
        action: "Build the content plan",
        summary:
          "The agent carries this account set and objective into content operations—Morgan does not re-enter them.",
        input: "Morgan’s direction and the audience recommendation.",
        output:
          "Campaign brief with account scope, role needs, objective and evidence references.",
        connection:
          "OpenAI workspace → orchestration state → content workflow.",
        enables: "The next workflow inherits the same campaign context.",
        control:
          "Morgan approves the direction; this does not authorize external release.",
        rows: [
          [
            "Objective",
            "Enterprise adoption",
            "Bring the wider buying group into evaluation",
          ],
          [
            "Scope",
            "12 target accounts",
            "Eligibility checked again before activation",
          ],
          [
            "Handoff",
            "Content plan",
            "Same brief, audience and evidence references",
          ],
        ],
      },
    ];
  if (id === "s3") {
    const roles =
      s.audience === "Buying roles"
        ? ["Technical evaluator", "Business sponsor", "Procurement"]
        : s.audience === "Lifecycle stages"
          ? ["Exploring", "Evaluating", "Ready for sales"]
          : ["Eligible audience"];
    return [
      {
        title: "Check the source material",
        action: "Prepare audience briefs",
        summary:
          s.source === "Source material missing"
            ? "No approved source is available. The agent has prepared a source request; audience adaptation is on hold."
            : "The agent has matched the brief to an approved adoption guide and recorded what can be reused.",
        input:
          "Account brief, audience needs, approved asset metadata, rights and brand rules.",
        output:
          "Source manifest with version, allowed claims and missing material.",
        connection:
          "OpenAI agent → approved asset repository / Adobe content capabilities.",
        enables:
          "Grounds every variant in traceable material instead of inventing claims.",
        control:
          "No approved source means no adaptation; version and usage permissions travel with the work.",
        rows: [
          [
            "Enterprise adoption guide",
            s.source === "Source material missing"
              ? "Missing · blocked"
              : "v3 · illustrative approved source",
            "Primary source for all audience briefs",
          ],
          [
            "Claims and proof points",
            "Reuse within source limits",
            "No invented ROI or unsupported claims",
          ],
          [
            "Source request",
            s.source === "Source material missing"
              ? "Required before proceeding"
              : "Not required",
            "Asset owner supplies and approves the source",
          ],
        ],
      },
      {
        title: "Build the audience work packages",
        action: "Route the packages for review",
        summary: `The agent has split one campaign brief into ${roles.length} audience work package${roles.length === 1 ? "" : "s"}, with source references and distinct objectives.`,
        input:
          "Approved source manifest + audience definition + campaign objective.",
        output:
          "Audience briefs with message purpose, source references and asset requirements.",
        connection:
          "OpenAI orchestration + audience / identity context → existing content production tools.",
        enables:
          "Personalization at scale without losing the common campaign objective or source lineage.",
        control:
          "These are work instructions, not generated marketing copy. Morgan can revise the audience or channel above.",
        rows: roles.map(
          (r, i) =>
            [
              r,
              i === 0
                ? "Explain evaluation and practical adoption"
                : i === 1
                  ? "Connect adoption to business value"
                  : "Address governance and purchasing readiness",
              `Source: adoption guide v3 · ${s.channel}`,
            ] as [string, string, string],
        ),
      },
      {
        title: "Assemble the approval package",
        action: "Approve direction and assemble handoffs",
        summary:
          "Each package carries its audience, source version and intended channel. Required reviews are assigned before release.",
        input: "Audience packages, channel requirements and approval policy.",
        output: "Review packet with owners, required checks and release gates.",
        connection:
          "OpenAI agent → Workfront or existing review system → approval status back to workspace.",
        enables:
          "Review happens on the complete package with a visible status, rather than in disconnected messages.",
        control:
          "Morgan approves direction. Brand, legal and eligibility gates cannot be bypassed by that approval.",
        rows: [
          ["Morgan", "Direction review", "Audience promise and channel mix"],
          [
            "Brand / asset owner",
            "Required review",
            "Source usage, claims and consistency",
          ],
          [
            "Legal / privacy",
            "Policy-based review",
            "Triggered by claims, regions or consent requirements",
          ],
        ],
      },
      {
        title: "Handoffs ready. Release still controlled.",
        action: "Continue to the afternoon check-in",
        summary:
          "The agent has assembled the delivery handoffs and measurement instructions. The campaign stays staged until the required approvals and eligibility checks pass.",
        input:
          "Approved direction, review packet, eligibility rules and channel configuration.",
        output: "Staged channel work orders and a measurement plan.",
        connection: `OpenAI orchestration → ${s.channel.includes("event") ? "Marketo / marketing CRM + event platform" : s.channel.includes("sales") ? "Marketo / marketing CRM + sales CRM" : "Marketo / marketing CRM + website activation"} → journey analytics.`,
        enables:
          "Coordinates channels and returns response signals to the same campaign context.",
        control:
          "No external send is simulated as completed. Release remains a separate, permissioned action.",
        rows: [
          [
            "Email",
            "Staged work order",
            "Eligible recipients + approved asset references",
          ],
          [
            s.channel.includes("event")
              ? "Event follow-up"
              : s.channel.includes("sales")
                ? "Sales handoff"
                : "Website experience",
            "Staged work order",
            s.channel.includes("event")
              ? "Separate attendee and non-attendee routes"
              : s.channel.includes("sales")
                ? "Account brief + role context + next action"
                : "Audience rule + approved experience reference",
          ],
          [
            "Measurement",
            "Tracking requirements prepared",
            "Campaign / audience IDs feed the next recommendation",
          ],
        ],
      },
    ];
  }
  return [
    {
      title: "Run the routine checks",
      action: "Inspect the exception",
      summary:
        "The agent applies the campaign checklist and separates routine checks from a consent conflict.",
      input:
        "Staged campaign, destination references, configuration and policy.",
      output: "Check results and an exception queue.",
      connection:
        "Scoped read tools for marketing activation + campaign state → OpenAI agent.",
      enables:
        "Routine validation does not consume a specialist’s attention for every request.",
      control:
        "Only defined checks run automatically; uncertain policy matches escalate.",
      rows: [
        [
          "Link destinations",
          "Check prepared",
          "Compare against approved destination list",
        ],
        [
          "Campaign configuration",
          "Check prepared",
          "Match audience, assets and channel requirements",
        ],
        [
          "Consent consistency",
          "Exception found",
          "One contact has conflicting records",
        ],
      ],
    },
    {
      title: "Resolve only the exception",
      action: "Apply the proposed hold",
      summary:
        "Hold the affected contact and ask the data owner to reconcile the records. Do not stop unrelated eligible work.",
      input:
        "Conflicting consent records, identity match and escalation policy.",
      output: "Proposed contact hold and an assigned reconciliation request.",
      connection:
        "Identity / consent source + activation suppression tool + request system.",
      enables:
        "Contains risk at the affected contact rather than blocking the entire campaign.",
      control:
        "Morgan authorizes this proposed resolution. The agent cannot infer consent from engagement.",
      rows: [
        [
          "Affected contact",
          "Hold proposed",
          "Suppress from activation pending reconciliation",
        ],
        [
          "Data owner",
          "Reconciliation request",
          "Confirm the authoritative consent record",
        ],
        [
          "Other contacts",
          "Continue existing checks",
          "No bypass of release or eligibility gates",
        ],
      ],
    },
    {
      title: "Record the decision and hand back control",
      action: "Review the day",
      summary:
        "The simulated hold and escalation are recorded against the same campaign, ready for the next check-in.",
      input: "Morgan’s resolution and campaign state.",
      output: "Decision record, held-contact status and an open owner task.",
      connection:
        "OpenAI orchestration state + audit log + review / request system.",
      enables:
        "Makes every action and unresolved dependency visible when Morgan returns.",
      control:
        "A failed tool action would stay pending; the interface must never label an unconfirmed external action as done.",
      rows: [
        [
          "Decision record",
          "Prepared in the simulation",
          "Hold contact; reconcile consent",
        ],
        [
          "Release state",
          "Still gated",
          "Required reviews and eligibility remain in force",
        ],
        [
          "Next check-in",
          "Data owner response",
          "Return the exception to Morgan when resolved",
        ],
      ],
    },
  ];
}
export function workSignature(s: AgentState, id: string) {
  return JSON.stringify([
    id,
    id === "s3" ? [s.audience, s.channel, s.source] : null,
    s.campaign?.objective || "",
    s.campaign?.instruction || "",
  ]);
}
export function artifactKey(s: AgentState, id: string, index: number) {
  return `${workSignature(s, id)}:${index}`;
}
export function currentWorkStep(s: AgentState, id: string) {
  const w = s.work?.[id];
  return w?.signature === workSignature(s, id)
    ? Math.min(w.step, workStages(s, id).length - 1)
    : 0;
}

export function workflowArtifact(s: AgentState, id: string, index: number) {
  const stage = workStages(s, id)[index];
  const names: Record<string, string[]> = {
    s2: [
      "Account signal brief",
      "Buying-group opportunity map",
      "Campaign action brief",
    ],
    s3: [
      "Approved source manifest",
      "Audience work packages",
      "Approval packet",
      "Channel handoff bundle",
    ],
    s5: [
      "Campaign check report",
      "Consent exception ticket",
      "Decision and audit record",
    ],
  };
  const blocked = id === "s3" && s.source === "Source material missing";
  const title = blocked ? "Source material request" : names[id][index];
  const sections =
    s.artifactEdits?.[artifactKey(s, id, index)] ??
    stage.rows.map(([name, status, detail]) => ({
      name,
      status,
      detail,
    }));
  const text = `# ${title}\n\nILLUSTRATIVE PROTOTYPE OUTPUT — no live systems queried or actions executed.\n\nCampaign: Enterprise adoption / 12 target accounts\nObjective: ${s.campaign?.objective || "Grow enterprise adoption across the buying group"}\nMorgan’s instruction: ${s.campaign?.instruction || "None added"}\nAudience: ${s.audience}\nChannels: ${s.channel}\n\n${stage.summary}\n\n${sections.map((r) => `## ${r.name}\nStatus: ${r.status}\n${r.detail}`).join("\n\n")}\n\n## Handoff\n${stage.output}\n\n## Required control\n${stage.control}`;
  return { title, sections, text, blocked };
}
