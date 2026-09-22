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
            "10 of 12 cohort accounts are matched; two remain excluded",
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
            "Northstar + 11 matched expansion accounts",
            "Keep unmatched accounts out of activation until resolved",
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
    return [
      {
        title: "Check the source material",
        action: "Prepare audience briefs",
        summary:
          s.source === "Source material missing"
            ? "No approved source is available. The agent has prepared a source request; audience adaptation is on hold."
            : `The agent searched the approved content bank and ranked the ${sourceSet.title.toLowerCase()} for this account and buying group.`,
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
            "Recommended source set",
            s.source === "Source material missing"
              ? "Missing · blocked"
              : sourceSet.badge,
            s.source === "Source material missing"
              ? "No approved material is available for this request"
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
            s.source === "Source material missing"
              ? "Required before proceeding"
              : "Approved claims only",
            "Morgan can choose a different source set; source rights and claim limits remain attached to every package",
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
      "Campaign check report",
      "Consent exception ticket",
      "Decision and audit record",
    ],
  };
  const blocked = id === "s3" && s.source === "Source material missing";
  const sourceSet = selectedContentSource(s);
  const title = blocked ? "Source material request" : names[id][index];
  const sections =
    s.artifactEdits?.[artifactKey(s, id, index)] ??
    (id === "s3" && index === 0 && !blocked
      ? [
          {
            name: "Campaign direction",
            status: "Proposed content plan",
            detail: `Objective: ${s.campaign?.objective || "Help Northstar Health move from technical evaluation to an expansion decision"}.\nScope: Northstar plus 11 matched expansion accounts; two unmatched accounts remain excluded.\nAudience direction: ${processState(s, "s2", 1).choice || "Technical lead, business sponsor and procurement"}.\nDirection from Morgan: ${s.campaign?.instruction || `Use the ${sourceSet.title} to give each role a distinct next step without creating unsupported claims.`}`,
          },
          {
            name: "Audience and deliverables",
            status: s.audience,
            detail:
              s.audience === "Buying roles"
                ? "Technical evaluators: evaluation-plan brief with office-hours CTA.\nBusiness sponsors: operating-value brief tied to expansion decision.\nProcurement: governance-readiness brief grounded in approved material."
                : s.audience === "Lifecycle stages"
                  ? "Exploring: introductory adoption brief.\nEvaluating: practical evaluation brief.\nReady for sales: account handoff and governance brief."
                  : "One eligible audience: a unified adoption brief and next-action recommendation.",
          },
          {
            name: "Channel plan",
            status: s.channel,
            detail: s.channel.toLowerCase().includes("event")
              ? "Email: role-specific message briefs.\nEvents: invitation and follow-up requirements, separated for attendees and non-attendees."
              : s.channel.toLowerCase().includes("sales")
                ? "Email: role-specific message briefs.\nSales: account and buying-role handoff with the same objective."
                : "Email: role-specific message briefs.\nWebsite: aligned experience brief and eligibility rules.",
          },
          {
            name: "Source and release gates",
            status: "Approved source available · release not authorized",
            detail: `Selected source set: ${sourceSet.assets}.\nWhy selected: ${sourceSet.rationale}\nPreserve approved claims and attach source references to each work package.\nNext: prepare audience packages, route required reviews and assemble staged channel handoffs.\nRelease only after required brand / legal checks and audience eligibility are resolved.`,
          },
        ]
      : stage.rows.map(([name, status, detail]) => ({
          name,
          status,
          detail: deliveredDetail(s, id, index, name, detail),
        })));
  const sources = workflowSources(s, id, index);
  const text = `# ${title}\n\nILLUSTRATIVE PROTOTYPE OUTPUT — Northstar Health is fictional; no live systems queried or actions executed.\n\nCampaign: Northstar Health expansion / 12-account cohort\nObjective: ${s.campaign?.objective || "Help Northstar Health move from technical evaluation to an expansion decision"}\nMorgan’s instruction: ${s.campaign?.instruction || "None added"}\nAudience: ${s.audience}\nChannels: ${s.channel}\n\n${stage.summary}\n\n${sections.map((r) => `## ${r.name}\nStatus: ${r.status}\n${r.detail}`).join("\n\n")}\n\n## Illustrative sources used\n${sources.map((source) => `- ${source.name}: ${source.purpose} | System: ${source.system} | Connection: ${source.connection}`).join("\n")}\n\n## Handoff\n${stage.output}\n\n## Required control\n${stage.control}\n\n## Workflow decisions and review history\n${processDigest(s) || "No decisions recorded yet."}`;
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
          ? "Finding no approved source in this scenario; marking adaptation as blocked instead of supplying unsupported claims."
          : "Reading the adoption guide’s version, permitted claims and usage rights from the asset metadata before reusing it.",
        s.source === "Source material missing"
          ? "Preparing a source request identifying the missing approved material and the review needed before adaptation can resume."
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
    return `${fallback}\nCase: CONSENT-001 (fictional).\nAction: Hold the affected contact; do not infer permission from engagement.\nAssigned role: data / consent owner, individual to be confirmed.\nResolution evidence: authoritative consent record and suppression status.\nRe-entry condition: eligibility rechecked before any activation.`;
  return fallback;
}
