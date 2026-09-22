import { contentVariants } from "./content-variants";
import { processState, processDigest } from "./process-state";
import type { AgentState } from "./agent-workspace";
import { selectedContentSource } from "./content-source-library";
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
          "The agent groups Northstar Health’s activity by person and role before proposing a next action for the 12-account expansion cohort.",
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
            "18 weekly active users · +28% in 30 days",
            "Northstar’s technical team completed two workspace projects",
          ],
          [
            "Roundtable + website",
            "3 attendees · 2 governance-guide returns",
            "Technical lead attended; procurement returned to the guide",
          ],
          [
            "Account and role match",
            "Technical lead · business sponsor · procurement team",
            "11 of 12 cohort accounts are matched; one remains excluded",
          ],
        ],
      },
      {
        title: "Explain the opportunity",
        action: "Prepare an action brief",
        summary:
          "The technical lead is active, while the sponsor and procurement need a different reason to engage before the expansion stalls.",
        input: "Joined activity, buying roles and engagement history.",
        output: "Buying-group gap and recommendation rationale.",
        connection: "Identity / CDP + CRM role context → OpenAI reasoning.",
        enables:
          "Distinguishes who is active from who is missing in the buying group.",
        control:
          "Confidence and provenance accompany the recommendation; Morgan chooses the objective.",
        rows: [
          [
            "Technical lead · AI Platforms",
            "2 projects + roundtable attendee",
            "Offer the evaluation plan and technical office hours",
          ],
          [
            "Business sponsor · VP Operations",
            "No recent activity",
            "Show operating value, adoption path and sponsor decision",
          ],
          [
            "Procurement team",
            "2 governance-guide returns",
            "Prepare the approved security and governance brief",
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
            "Northstar Health expansion",
            "Bring the business sponsor and procurement into the active evaluation",
          ],
          [
            "Scope",
            "Northstar + 11 eligible expansion accounts",
            "Carry the eligible cohort into content planning",
          ],
          [
            "Handoff",
            "Role-specific content plan",
            "Carries named roles, source v3.2 and evidence references",
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
    const channel = s.channel.toLowerCase();
    const sourceSet = selectedContentSource(s);
    const newContent = s.source === "Source material missing";
    return [
      {
        title: newContent ? "Create a content foundation" : "Check the source material",
        action: newContent ? "Draft the new foundation" : "Prepare audience briefs",
        summary:
          newContent
            ? "Morgan chose new content. The content adaptation agent is drafting a purpose-built foundation from the campaign brief, with review required before release."
            : `The agent has prepared ${sourceSet.title.toLowerCase()} as the fictional message theme for this account and buying group.`,
        input:
          newContent
            ? "Campaign brief, audience needs, channel requirements and brand / legal guardrails."
            : "Account brief, audience needs, fictional practice theme, rights and brand rules.",
        output:
          newContent
            ? "New content foundation with required brand and legal review gates."
            : "Message-theme brief with claim boundaries and missing-material flags.",
        connection:
          newContent
            ? "Content adaptation agent → OpenAI Frontier → content production workflow + Adobe Workfront review."
            : "Content retrieval agent → OpenAI Frontier → approved asset repository / Adobe content capabilities.",
        enables:
          newContent
            ? "Creates a campaign-specific foundation while preserving an explicit review path."
            : "Grounds every variant in traceable material instead of inventing claims.",
        control:
          newContent
            ? "New claims cannot be released until brand and legal review make this a governed source."
            : "Version and usage permissions travel with the approved source.",
        rows: [
          [
            "Recommended source set",
            newContent
              ? "New foundation requested"
              : sourceSet.badge,
            newContent
              ? sourceSet.assets
              : sourceSet.assets,
          ],
          ["Why this matches", "Ranked for this brief", sourceSet.rationale],
          [
            "Base content",
            sourceSet.baseContent.headline,
            `${sourceSet.baseContent.message} Next action: ${sourceSet.baseContent.cta}`,
          ],
          [
            "Content controls",
            newContent
              ? "Review required before release"
              : "Approved claims only",
            newContent
              ? "The new foundation is traceable to Morgan’s brief and requires brand and legal review before activation"
              : "Morgan can choose a different source set; source rights and claim limits remain attached to every package",
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
              `Source: ${sourceSet.title} · ${s.channel}`,
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
        connection: `OpenAI orchestration → ${channel.includes("event") ? "Marketo / marketing CRM + event platform" : channel.includes("thought leadership") ? "sales CRM + executive communications workflow" : channel.includes("social") ? "social publishing workflow + marketing website" : channel.includes("integrated") ? "marketing CRM + sales CRM + social publishing + event platform" : "Marketo / marketing CRM + website activation"} → journey analytics.`,
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
            channel.includes("event")
              ? "Event follow-up"
              : channel.includes("thought leadership")
                ? "Executive thought leadership"
                : channel.includes("social")
                  ? "Social campaign"
                  : channel.includes("integrated")
                    ? "Sales + social activation"
                    : channel.includes("sales")
                      ? "Sales handoff"
                      : "Website experience",
            "Staged work order",
            channel.includes("event")
              ? "Separate attendee and non-attendee routes"
              : channel.includes("thought leadership")
                ? "Executive POV + seller talking points + approved distribution plan"
                : channel.includes("social")
                  ? "Social variants + website destination + campaign identifiers"
                  : channel.includes("integrated")
                    ? "Coordinated seller, social, event and web activation"
                    : channel.includes("sales")
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
      title: "Run pre-flight release checks",
      action: "Run pre-flight checks",
      summary:
        "Before launch, the agent applies the release checklist and separates routine validation from a consent conflict.",
      input:
        "Staged campaign, destination references, configuration and policy.",
      output: "Pre-flight check results and an exception queue.",
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
          "One otherwise matched contact has conflicting permission records",
        ],
      ],
    },
    {
      title: "Resolve only the exception",
      action: "Apply the proposed hold",
      summary:
        "Hold one matched contact for a consent conflict and ask the data owner to reconcile the records. Do not stop unrelated eligible work.",
      input:
        "Conflicting consent records for one matched contact, plus escalation policy.",
      output: "Proposed contact hold and an assigned reconciliation request.",
      connection:
        "Identity / consent source + activation suppression tool + request system.",
      enables:
        "Contains the consent risk at the affected contact rather than blocking the entire campaign.",
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

function selectedChannels(plan: string) {
  const canonical: Record<string, string> = {
    email: "Email",
    "event follow-up": "Event follow-up",
    website: "Website",
    "sales enablement": "Sales enablement",
    "executive thought leadership": "Executive thought leadership",
    "social campaign": "Social campaign",
  };
  const explicit = plan
    .split(" + ")
    .filter(Boolean)
    .map((channel) => canonical[channel.toLowerCase()] || channel);
  if (explicit.length) return explicit;
  return ["Email", "Website"];
}

function channelDeliverable(
  channel: string,
  example: ReturnType<typeof contentVariants>[number] | undefined,
) {
  if (!example) return `${channel}\nNo representative content pattern is available yet.`;
  const shared = `${example.headline} ${example.body}`;
  if (channel === "Email")
    return `Email\nSubject: ${example.subject}\nMessage: ${shared}\nCTA: ${example.cta}.`;
  if (channel === "Event follow-up")
    return `Event follow-up\nAttendee opening: “Thank you for joining the enterprise adoption roundtable.”\nMessage: ${shared}\nCTA: ${example.cta}.\nNon-attendees receive the session guide and a distinct invitation.`;
  if (channel === "Website")
    return `Website experience\nHeadline: ${example.headline}\nSupporting copy: ${example.body}\nCTA: ${example.cta}.`;
  if (channel === "Sales enablement")
    return `Seller brief\nAccount context: ${example.context}\nTalking point: ${shared}\nNext action: ${example.cta}.`;
  if (channel === "Executive thought leadership")
    return `Executive POV\nPoint of view: ${shared}\nDistribution: executive social post, seller talking point and account-specific invitation.`;
  if (channel === "Social campaign")
    return `Social campaign\nPost theme: ${example.headline}\nDraft: ${example.body}\nDestination: the matching ${example.segment.toLowerCase()} website experience.`;
  return `${channel}\n${shared}\nCTA: ${example.cta}.`;
}

export function workflowArtifact(s: AgentState, id: string, index: number) {
  const stages = workStages(s, id);
  index = Number.isInteger(index)
    ? Math.max(0, Math.min(index, stages.length - 1))
    : 0;
  const stage = stages[index];
  const names: Record<string, string[]> = {
    s2: [
      "Account signal brief",
      "Buying-group opportunity map",
      "Campaign action brief",
    ],
    s3: [
      "Content plan",
      "Audience work packages",
      "Approval packet",
      "Channel handoff bundle",
    ],
    s5: [
      "Pre-flight release check",
      "Consent exception ticket",
      "Decision and audit record",
    ],
  };
  const blocked = false;
  const newContent = id === "s3" && s.source === "Source material missing";
  const sourceSet = selectedContentSource(s);
  const variants = id === "s3" ? contentVariants(s) : [];
  const northstarVariants = variants.filter((variant) => variant.accountId === "ACCT-01");
  const planChannels = selectedChannels(s.channel);
  const title =
    newContent && index === 0 ? "New content foundation" : names[id][index];
  const sections =
    s.artifactEdits?.[artifactKey(s, id, index)] ??
    (id === "s3" && index === 0 && !blocked
      ? [
          {
            name: "Campaign direction",
            status: "Proposed content plan",
            detail: `Objective: ${s.campaign?.objective || "Help Northstar Health move from technical evaluation to an expansion decision"}.\nScope: Northstar plus 11 eligible expansion accounts.\nAudience direction: ${processState(s, "s2", 1).choice || "Technical lead, business sponsor and procurement"}.\nDirection from Morgan: ${s.campaign?.instruction || `Use the ${sourceSet.title} to give each role a distinct next step without creating unsupported claims.`}`,
          },
          {
            name: "Audience and deliverables",
            status: s.audience,
            detail: northstarVariants
              .map(
                (variant) => {
                  const label =
                    variant.segment === "Technical evaluator"
                      ? "Technical evaluators"
                      : variant.segment === "Business sponsor"
                        ? "Business sponsors"
                        : variant.segment === "Procurement"
                          ? "Procurement teams"
                          : variant.segment;
                  return `${label}\nHeadline: ${variant.headline}\nMessage: ${variant.body}\nCTA: ${variant.cta}.`;
                },
              )
              .join("\n\n"),
          },
          {
            name: "Channel plan",
            status: s.channel,
            detail: planChannels
              .map((channel) =>
                channelDeliverable(channel, northstarVariants[0] || variants[0]),
              )
              .join("\n\n"),
          },
          {
            name: "Source and release gates",
            status: newContent
              ? "New content foundation · release not authorized"
              : "Approved source available · release not authorized",
            detail: newContent
              ? `New foundation: ${sourceSet.assets}.\nWhy created: ${sourceSet.rationale}\nThe foundation is traceable to Morgan’s campaign brief and may not be released until brand and legal review are complete.\nNext: prepare audience packages, route required reviews and assemble staged channel handoffs.`
              : `Selected source set: ${sourceSet.assets}.\nWhy selected: ${sourceSet.rationale}\nPreserve approved claims and attach source references to each work package.\nNext: prepare audience packages, route required reviews and assemble staged channel handoffs.\nRelease only after required brand / legal checks and audience eligibility are resolved.`,
          },
        ]
      : id === "s2" && index === 0
        ? [
            {
              name: "Decision context",
              status: "Northstar Health · expansion cohort",
              detail: `Decision to support: whether to move Northstar from technical evaluation toward an expansion conversation.\nCohort: Northstar plus 11 comparable expansion accounts; 11 accounts have reliable person-to-account matching.\nGuardrail: keep the one unmatched account out of activation and account-level conclusions until identity is resolved.`,
            },
            {
              name: "Product adoption signal",
              status: "Growing technical usage",
              detail: `18 weekly active users, up 28% over the past 30 days.\nTwo workspace projects were completed by the technical team this month.\nInterpretation: the technical evaluation appears active; product usage alone does not establish a business decision or expansion intent.`,
            },
            {
              name: "Cross-channel activity",
              status: "Corroborating journey evidence",
              detail: `Three contacts attended the enterprise roundtable.\nThe technical lead attended and returned to the evaluation guide; procurement returned twice to the security and governance guide.\nInterpretation: the account is researching both implementation and governance, but business-sponsor engagement is still absent.`,
            },
            {
              name: "Buying-group coverage",
              status: "One active role · two decision gaps",
              detail: `Technical lead: active in product and event activity.\nBusiness sponsor: no recent activity; value case has not reached the person who can frame an expansion decision.\nProcurement: researching governance; needs approved security and purchasing context before a coordinated next step.`,
            },
            {
              name: "Recommended next step",
              status: "Bring the sponsor into the conversation",
              detail: `Prepare a role-specific adoption plan: technical office hours for the technical lead, an operating-value brief for the business sponsor, and an approved governance brief for procurement.\nWhy now: multiple technical and governance signals are present, but the account cannot progress as a buying group without a sponsor path.\nMorgan can change this direction before any content or handoff work begins.`,
            },
          ]
        : id === "s2" && index === 1
          ? [
              {
                name: "Account progression",
                status: "Technical evaluation is active",
                detail: `Northstar has 18 weekly active users, up 28% in 30 days, and the technical team completed two workspace projects.\nThree contacts attended the enterprise roundtable.\nRead: this is an active evaluation signal, not evidence that an expansion decision has been made.`,
              },
              {
                name: "Technical evaluator path",
                status: "Active · ready for a practical next step",
                detail: `Evidence: technical lead attended the roundtable and returned to the evaluation guide.\nDecision need: confirm how the team can move from trial activity to a scoped adoption path.\nRecommended work: technical office hours and an evaluation-plan brief grounded in approved material.`,
              },
              {
                name: "Business sponsor path",
                status: "Missing · highest progression gap",
                detail: `Evidence: no recent sponsor activity or documented operating-value conversation.\nDecision need: assess whether broader adoption solves a meaningful operating problem.\nRecommended work: an operating-value brief and a clear invitation to discuss the expansion decision with the account team.`,
              },
              {
                name: "Procurement and governance path",
                status: "Researching · needs approved context",
                detail: `Evidence: two returns to the security and governance guide.\nDecision need: understand security, governance and purchasing readiness before joining a coordinated plan.\nRecommended work: the approved governance brief, not a new claim or unreviewed security assertion.`,
              },
              {
                name: "Recommended coordinated move",
                status: "Lead with sponsor value · retain all three paths",
                detail: `Use the business-sponsor gap as the lead priority while keeping the technical evaluator and procurement paths coordinated around the same expansion objective.\nWhy: the technical and governance signals already exist; sponsor participation is the missing condition for a buying-group decision.\nMorgan can change the leading emphasis without collapsing the plan into one audience or one message.`,
              },
            ]
          : stage.rows.map(([name, status, detail]) => ({
              name,
              status,
              detail: deliveredDetail(s, id, index, name, detail),
            })));
  const sources = workflowSources(s, id, index);
  const history = processDigest(s);
  const text = `# ${title}\n\nILLUSTRATIVE PROTOTYPE OUTPUT — Northstar Health is fictional; no live systems queried or actions executed.\n\nCampaign: Northstar Health expansion / 12-account cohort\nObjective: ${s.campaign?.objective || "Help Northstar Health move from technical evaluation to an expansion decision"}\nMorgan’s instruction: ${s.campaign?.instruction || "None added"}\nAudience: ${s.audience}\nChannels: ${s.channel}\n\n${stage.summary}\n\n${sections.map((r) => `## ${r.name}\nStatus: ${r.status}\n${r.detail}`).join("\n\n")}\n\n## Illustrative sources used\n${sources.map((source) => `- ${source.name}: ${source.purpose} | System: ${source.system} | Connection: ${source.connection}`).join("\n")}\n\n## Handoff\n${stage.output}\n\n## Required control\n${stage.control}${history ? `\n\n## Workflow decisions and review history\n${history}` : ""}`;
  const variantText =
    id === "s3" && index >= 1 && !blocked
      ? "\n\n## Candidate email variants reviewed and handed off\n" +
        contentVariants(s)
          .map(
            (v) =>
              `### ${v.id} · ${v.account} · ${v.segment}\nContext: ${v.context}\nSubject: ${v.subject}\n${v.body}\nNext action: ${v.cta}\nSource: ${v.source}\nEligibility: ${v.eligibility}`,
          )
          .join("\n\n")
      : "";
  return { title, sections, text: text + variantText, blocked, sources };
}

export function workflowSources(s: AgentState, id: string, index: number) {
  const sourceSet = selectedContentSource(s);
  const sources: Record<string, { name: string; purpose: string }[][]> = {
    s2: [
      [
        {
          name: "Product telemetry",
          purpose: "Usage and account-level engagement",
        },
        {
          name: "Website and event activity",
          purpose: "Journey signals beyond product usage",
        },
        {
          name: "CRM / account identity",
          purpose: "Link people, accounts and buying roles",
        },
      ],
      [
        {
          name: "Account signal brief",
          purpose: "Carry forward the combined evidence",
        },
        {
          name: "Buying-role and journey context",
          purpose: "Identify active and missing roles",
        },
      ],
      [
        { name: "Opportunity map", purpose: "Ground the recommended action" },
        {
          name: "Morgan’s campaign brief",
          purpose: "Set the objective and direction",
        },
      ],
    ],
    s3: [
      [
        {
          name: "Morgan’s campaign brief",
          purpose: "Objective, audience and instructions",
        },
        {
          name: "Approved asset library",
          purpose: "Find source versions and permitted claims",
        },
        { name: "Rights and brand rules", purpose: "Check allowed reuse" },
      ],
      [
        {
          name: "Morgan’s campaign brief",
          purpose: "Keep all work aligned to the objective",
        },
        {
          name: "Audience / buying-role context",
          purpose: "Tailor each work package to a decision need",
        },
        {
          name: sourceSet.title,
          purpose:
            s.source === "Source material missing"
              ? "Missing — adaptation is blocked"
              : sourceSet.assets,
        },
        {
          name: "Channel specifications",
          purpose: `Prepare requirements for ${s.channel}`,
        },
      ],
      [
        {
          name: "Audience work packages",
          purpose: "Collect briefs and source references",
        },
        {
          name: "Approval policy",
          purpose: "Assign brand, legal and privacy checks",
        },
        {
          name: "Asset permissions",
          purpose: "Verify version and permitted use",
        },
      ],
      [
        {
          name: "Review packet",
          purpose: "Carry approval gates into delivery",
        },
        {
          name: "Audience eligibility / consent",
          purpose: "Exclude ineligible recipients",
        },
        {
          name: "Channel configuration",
          purpose: "Prepare routing and tracking requirements",
        },
      ],
    ],
    s5: [
      [
        {
          name: "Campaign work orders",
          purpose: "Inspect staged setup and destinations",
        },
        {
          name: "Operational checklist",
          purpose: "Apply agreed routine checks",
        },
      ],
      [
        {
          name: "Consent and identity records",
          purpose: "Inspect the conflicting permissions",
        },
        {
          name: "Escalation policy",
          purpose: "Identify the authoritative owner",
        },
      ],
      [
        {
          name: "Morgan’s resolution",
          purpose: "Record the authorized direction",
        },
        {
          name: "Campaign state and audit record",
          purpose: "Preserve holds, gates and open tasks",
        },
      ],
    ],
  };
  return (sources[id]?.[index] || []).map((source) => {
    const name = source.name.toLowerCase();
    let system = "OpenAI agent interface / campaign state";
    let connection = "Agent reads the shared campaign context";
    if (/telemetry/.test(name)) {
      system = "ChatGPT usage → OpenAI data lake";
      connection = "Proposed read connector from the data lake to the agent";
    } else if (/website|event activity/.test(name)) {
      system =
        "Marketing website / Events → Customer Journey Analytics → OpenAI data lake";
      connection = "Proposed query of journey signals available to OpenAI";
    } else if (/crm|identity|buying-role|eligibility|consent/.test(name)) {
      system = "CDP ABM / identity + CRM context";
      connection =
        "Proposed audience and identity lookup; consent source must be confirmed";
    } else if (
      /asset|adoption guide|rights|source set|narrative|casebook|workshop kit/.test(
        name,
      )
    ) {
      system = "Adobe CSC (assets) / approved content repository";
      connection =
        "Proposed asset-search connector returning references, versions and permissions";
    } else if (/approval|review packet|escalation/.test(name)) {
      system = "Adobe Workfront / existing review system";
      connection =
        "Proposed workflow connector for review rules, owners and status";
    } else if (/channel|work orders|operational checklist/.test(name)) {
      system = "CRM (Marketing), Events and Marketing Website";
      connection =
        "Proposed configuration / status connector; Marketo is a candidate CRM implementation";
    }
    return { ...source, system, connection };
  });
}

export function workflowActivity(
  s: AgentState,
  id: string,
  index: number,
): string[] {
  const steps: Record<string, string[][]> = {
    s2: [
      [
        "Bringing account context together from product usage in the OpenAI data lake, website and event activity through journey analytics, and account identities through a proposed CDP / CRM lookup.",
        "Comparing those engagement signals with technical evaluator, business sponsor and procurement roles from account context to identify who is active and who is missing.",
        "Preparing a recommendation that links the buying-group gap to an adoption objective, with supporting signals, audience scope and the proposed next action.",
      ],
      [
        "Reading the account signal brief and retrieving buying-role context through the proposed identity / CDP and CRM connections.",
        "Comparing engagement by role: technical evaluators show interest; business sponsors and procurement need different evidence before they can participate.",
        "Preparing a buying-group opportunity map with the missing roles, the decision each needs to make and a recommended engagement path.",
      ],
      [
        "Carrying the account cohort, supporting signals and buying-group gap forward from the opportunity map in the shared OpenAI workspace.",
        "Combining that evidence with Morgan’s objective and instructions to set the audience scope and content requirements.",
        "Preparing the campaign action brief with source references and a handoff to content planning, without authorizing a send.",
      ],
    ],
    s3: [
      [
        "Searching the approved asset repository through a proposed Adobe CSC / content connector for material matching the campaign objective and audience needs.",
        s.source === "Source material missing"
          ? "Using Morgan’s campaign brief, audience context and channel requirements to draft a new fictional content foundation instead of retrieving existing approved material."
          : "Reading the adoption guide’s version, permitted claims and usage rights from the asset metadata before reusing it.",
        s.source === "Source material missing"
          ? "Preparing the new foundation with its claim boundaries, then routing it to brand and legal review before it can be released."
          : "Preparing a source manifest that links the adoption guide, allowed claims and reuse restrictions to the campaign brief.",
      ],
      [
        "Reading Morgan’s objective and instructions from the shared brief, together with audience and buying-role context from the proposed CDP / CRM connection.",
        `Mapping ${s.audience.toLowerCase()} to the approved adoption guide: selecting the relevant evidence and emphasis while preserving the source claims.`,
        `Preparing audience work packages for ${s.channel.toLowerCase()}, each carrying its decision need, source references and production instructions.`,
      ],
      [
        "Collecting the audience work packages and their source versions from the shared campaign state and approved asset repository.",
        "Applying brand, legal and privacy requirements through the proposed Workfront / review-system connection to determine owners and approval gates.",
        "Preparing a review packet linking each work package to its required checks; Morgan’s direction approval does not bypass release review.",
      ],
      [
        `Mapping the reviewed work packages to ${s.channel.toLowerCase()} through proposed marketing CRM, website or event-platform handoffs.`,
        "Checking audience eligibility through the identity / consent source and attaching required review status from the workflow system; unresolved checks keep release gated.",
        "Preparing staged channel work orders with asset references, audience identifiers and measurement instructions that return response signals to journey analytics.",
      ],
    ],
    s5: [
      [
        "Reading the staged campaign work orders and destination references through proposed marketing activation connectors.",
        "Comparing links, audience settings and asset references against the operational checklist, while checking consent consistency through the identity source.",
        "Preparing a check report that separates routine validation from the conflicting-consent exception requiring human attention.",
      ],
      [
        "Retrieving the affected contact’s identity and consent records through the proposed CDP / consent-source connection.",
        "Comparing the conflicting permissions with escalation policy rather than inferring consent from engagement.",
        "Preparing a contact hold and reconciliation request for the data owner, while preserving the approval gates for everyone else.",
      ],
      [
        "Reading Morgan’s chosen resolution and the campaign’s current release state from the shared OpenAI workspace.",
        "Linking the proposed hold to the affected contact and the escalation task through the activation and request-system connections.",
        "Preparing a decision record with the owner, pending task and release conditions; external execution remains unconfirmed in this simulation.",
      ],
    ],
  };
  return steps[id]?.[index] || [];
}

function deliveredDetail(
  s: AgentState,
  id: string,
  index: number,
  name: string,
  fallback: string,
): string {
  if (id === "s3" && index === 1) {
    const technical = /technical|exploring|eligible/i.test(name),
      business = /business|evaluating/i.test(name);
    const need = technical
      ? "Understand how to evaluate and adopt the product safely"
      : business
        ? "Build an internal case for enterprise adoption"
        : "Resolve governance and purchasing questions";
    const emphasis = technical
      ? "Practical evaluation steps and an approved adoption path"
      : business
        ? "Business outcomes, team readiness and the adoption plan"
        : "Approved governance information and the procurement process";
    const cta = technical
      ? "Review the evaluation guide"
      : business
        ? "Discuss an adoption plan with the account team"
        : "Request a governance discussion";
    const channel = s.channel.toLowerCase().includes("event")
      ? "Prepare an invitation for non-attendees and a follow-up for attendees; suppress duplicate invitations"
      : s.channel.toLowerCase().includes("sales")
        ? "Prepare an email brief and a sales handoff using the same account context"
        : "Prepare an email brief and a matching website experience brief";
    return `Audience need: ${need}.\nMessage emphasis: ${emphasis}.\nProposed next action: ${cta}.\nProduction order: ${channel}.\nSource: Enterprise adoption guide v3 (illustrative approved asset). Preserve source claims; do not add unsupported ROI or security assertions.\nAcceptance criteria: Source references attached, audience eligibility checked, channel versions consistent, brand and required legal reviews complete.`;
  }
  if (id === "s2" && index === 2)
    return name === "Objective"
      ? `Campaign: Enterprise adoption.\nObjective: ${s.campaign?.objective || "Bring business sponsors and procurement into the evaluation alongside active technical users"}.\nSuccess to validate: broader buying-role engagement followed by a qualified account conversation.`
      : name === "Scope"
        ? "Audience: 12 illustrative target accounts with growing product interest.\nPrioritize technical evaluators, business sponsors and procurement by engagement gap.\nExclude contacts without resolved identity or valid permissions."
        : "Deliver to content planning: the 12-account cohort, buying-role needs, signal references and Morgan’s direction.\nPrepare one approved-source content plan across the selected channels.\nDo not release until content review and eligibility gates pass.";
  if (id === "s3" && index === 3)
    return `${fallback}\nCampaign reference: Enterprise adoption / 12 target accounts.\nAudience selection: ${s.audience}.\nChannel plan: ${s.channel}.\nRelease status: STAGED — not sent.\nRequired before release: approved content version, resolved consent, completed brand / legal review and channel configuration check.\nMeasurement handoff: campaign ID, audience role, channel and response event.`;
  if (id === "s5" && index === 1)
    return `${fallback}\nCase: CONSENT-001 (fictional).\nAction: Hold the matched contact; do not infer permission from engagement.\nAssigned role: data / consent owner, individual to be confirmed.\nResolution evidence: authoritative consent record and suppression status.\nRe-entry condition: eligibility rechecked before any activation.`;
  return fallback;
}
