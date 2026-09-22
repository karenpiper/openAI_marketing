"use client";
import ReviewComments from "./review-comments";
import UseCaseScoring from "./use-case-scoring";
import { useEffect, useState, type ReactNode } from "react";
import {
  AGENT_KEY,
  chapters,
  availability,
  priorities,
  createAgentState,
  restoreAgentState,
  planRows,
  architectureSession,
  agentReadout,
  type Finding,
  guidedReply,
  advanceDay,
} from "../lib/agent-workspace";
import { WorkflowWork } from "./workflow-work";
import { CampaignEditor } from "./campaign-editor";
import { processKey, processState } from "../lib/process-state";
import {
  currentWorkStep,
  workSignature,
  workStages,
} from "../lib/workflow-work";
import PerformanceLoop from "./performance-loop";
import MorningInbox from "./morning-inbox";
import AgentBriefing, { MeetMorgan } from "./agent-briefing";
import ArchitectureOutput from "./architecture-output";
import { useCaseCandidates } from "../lib/use-case-candidates";
import { SaveContext } from "./save-footer";
import "./agent-workspace.css";

const channelOptions = [
  "Email",
  "Event follow-up",
  "Website",
  "Sales enablement",
  "Executive thought leadership",
  "Social campaign",
] as const;

const planChannels: Record<string, string[]> = {
  "Email + event follow-up": ["Email", "Event follow-up"],
  "Email + website": ["Email", "Website"],
  "Sales enablement + executive thought leadership": [
    "Sales enablement",
    "Executive thought leadership",
  ],
  "Social campaign + website": ["Social campaign", "Website"],
  "Integrated account activation": [
    "Sales enablement",
    "Executive thought leadership",
    "Social campaign",
    "Event follow-up",
    "Website",
  ],
};

function channelsForPlan(plan: string) {
  return planChannels[plan] || plan.split(" + ").filter(Boolean);
}

function planForChannels(channels: string[]) {
  return channels.join(" + ");
}

function routeForArchitectureActivity(activity: string) {
  const value = activity.toLowerCase();
  if (/approval queue|send.*review|route.*review|review packet/.test(value))
    return ["Approval packet [via OpenAI Frontier orchestration]", "Adobe Workfront", "Brand + legal review [Adobe Workfront]"];
  if (/audience|channel|plan choice|campaign context/.test(value))
    return ["Morgan’s plan choice", "Campaign strategist [via OpenAI Frontier orchestration]", "Adobe CDP / ABM"];
  if (/content|creative|source|catalog|cdp-connected/.test(value))
    return [
      "Content retrieval agent [via OpenAI Frontier orchestration]",
      "Adobe CSC content library",
    ];
  if (/approve|approval|review|brand|legal|privacy/.test(value))
    return ["Governance agent [via OpenAI Frontier orchestration]", "Adobe Workfront", "Brand + legal review [Adobe Workfront]"];
  if (/check|consent|exception|hold|reconcil/.test(value))
    return ["Release validation agent [via OpenAI Frontier orchestration]", "Identity / consent source [Adobe CDP / ABM]", "Adobe Workfront"];
  if (/handoff|stage|release|marketo|website|social|event|sales enablement/.test(value))
    return ["Activation agent [via OpenAI Frontier orchestration]", "Marketo / CRM [Adobe marketing tools]", "Activation channel [B2B Marketing Touchpoints]"];
  if (/result|performance|learn|measure/.test(value))
    return ["Journey analytics [Adobe Customer Journey Analytics]", "OpenAI data lake", "Learning agent [via OpenAI Frontier orchestration]"];
  return ["Workflow coordinator [via OpenAI Frontier orchestration]"];
}

function workspaceInteraction(target: EventTarget | null) {
  const element = target instanceof HTMLElement ? target : null;
  const control = element?.closest<HTMLElement>(
    "button, input, select, textarea",
  );
  if (
    !control ||
    control.closest(
      ".chat-sidebar, .workflow-architecture-rail, .monitor-toolbar",
    )
  )
    return "";
  const label =
    control.closest("label")?.textContent?.replace(/\s+/g, " ").trim() ||
    control.textContent?.replace(/\s+/g, " ").trim() ||
    control.getAttribute("aria-label") ||
    "a workflow control";
  return `Morgan selected “${label.slice(0, 120)}”.`;
}

function WorkflowArchitectureRail({
  session,
  id,
  onClose,
  activity,
  activeRoute,
  activityVersion,
}: {
  session: ReturnType<typeof createAgentState>;
  id: string;
  onClose: () => void;
  activity: string;
  activeRoute: string[] | null;
  activityVersion: number;
}) {
  const step = currentWorkStep(session, id);
  const stage = workStages(session, id)[step];
  const isPlanning = id === "s3" && !session.campaign;
  const contentChoice = processState(session, id, step).choice;
  const defaultRoute =
    isPlanning
      ? [
          "Morgan’s plan choices",
          `Campaign strategist [via OpenAI Frontier orchestration] · ${session.audience}`,
          `CDP / ABM · ${session.channel}`,
        ]
      : id === "s3" && step === 0 && contentChoice
        ? [
            "Content retrieval agent [via OpenAI Frontier orchestration]",
            "Adobe CSC · approved source selected",
          ]
      : id === "s3" && step === 0
      ? ["Content retrieval agent [via OpenAI Frontier orchestration]", "Adobe CDP / ABM", "Adobe CSC content library"]
      : id === "s3" && step === 1
        ? ["Content adaptation agent [via OpenAI Frontier orchestration]", "CDP / identity [Adobe CDP / ABM]", "Content production tools [Adobe CSC]"]
        : id === "s3" && step === 2
          ? ["Governance agent [via OpenAI Frontier orchestration]", "Adobe Workfront", "Brand + legal review [Adobe Workfront]"]
          : id === "s3"
            ? ["Activation agent [via OpenAI Frontier orchestration]", "Marketo / CRM [Adobe marketing tools]", "Journey analytics [Adobe Customer Journey Analytics]"]
            : id === "s2"
              ? step === 0
                ? ["Identity resolution agent [via OpenAI Frontier orchestration]", "OpenAI data lake", "Adobe CDP / ABM"]
                : step === 1
                  ? ["Buying-group intelligence agent [via OpenAI Frontier orchestration]", "OpenAI data lake", "Adobe CDP / ABM"]
                  : ["Campaign strategist [via OpenAI Frontier orchestration]", "Shared campaign state [OpenAI Frontier orchestration]"]
              : id === "s5"
                ? step === 0
                  ? ["Release validation agent [via OpenAI Frontier orchestration]", "Identity / consent source [Adobe CDP / ABM]", "Adobe Workfront"]
                  : ["Exception-resolution agent [via OpenAI Frontier orchestration]", "Activation controls [B2B Marketing Touchpoints]", "Data-owner request [CRM (Sales)]"]
                : ["Workflow coordinator [via OpenAI Frontier orchestration]"];
  const transition =
    isPlanning
      ? "Audience + channel mix → campaign context"
      : id === "s3" && step === 0 && contentChoice
        ? "CDP recommendation → approved creative"
      : id === "s3" && step === 0
      ? "Plan choices → recommended creative"
      : stage.action;

  return (
    <aside className="prototype-context-popover workflow-architecture-rail">
      <header>
        <span className="agent-kicker">Live workflow architecture</span>
        <button aria-label="Close workflow architecture" onClick={onClose}>
          ×
        </button>
      </header>
      <p className="workflow-architecture-now">Now moving through</p>
      <h3>{transition}</h3>
      <p className="workflow-architecture-summary">
        {activity ||
          (isPlanning
            ? `Using ${session.audience.toLowerCase()} and ${session.channel.toLowerCase()} to shape the campaign context.`
            : stage.summary)}
      </p>
      <div
        className="workflow-architecture-route"
        aria-label="Systems active in this transition"
      >
        {(activeRoute || defaultRoute).map((component, index, route) => (
          <div
            key={`${activityVersion}-${component}`}
            className="workflow-architecture-route-step"
            style={{ animationDelay: `${index * 0.55}s` }}
          >
            <span>{component}</span>
            {index < route.length - 1 && <i aria-hidden="true">↓</i>}
          </div>
        ))}
      </div>
      <div className="workflow-architecture-pass">
        <span>Passes forward</span>
        <b>{stage.output}</b>
      </div>
      <p className="workflow-architecture-note">
        Each named agent is a proposed specialist role coordinated through
        OpenAI Frontier. Open the full workflow architecture in Step 4 to
        review every component and boundary.
      </p>
    </aside>
  );
}

function MorganScreen({
  children,
  workflow = false,
  onRestart,
  onToggleArchitecture,
  architectureOpen = false,
  architectureRail,
  onArchitectureInteraction,
  onCampaignResults,
  campaignResultsOpen = false,
}: {
  children: ReactNode;
  workflow?: boolean;
  onRestart?: () => void;
  onToggleArchitecture?: () => void;
  architectureOpen?: boolean;
  architectureRail?: ReactNode;
  onArchitectureInteraction?: (activity: string) => void;
  onCampaignResults?: () => void;
  campaignResultsOpen?: boolean;
}) {
  function jump(selector: string, e: React.MouseEvent<HTMLButtonElement>) {
    const screen = e.currentTarget.closest(".monitor-screen");
    const target = screen?.querySelector<HTMLElement>(selector);
    if (screen && target)
      screen.scrollTo({
        top:
          target.getBoundingClientRect().top -
          screen.getBoundingClientRect().top +
          screen.scrollTop -
          55,
        behavior: "smooth",
      });
  }

  return (
    <div className="monitor-wrap">
      <div className="monitor-label">
        <b>MORGAN’S WORKSPACE</b>
        <span>Proposed experience · fictional data · no live actions</span>
      </div>
      <div className="monitor-bezel">
        <div className="monitor-camera" aria-hidden="true" />
        <div className="monitor-screen">
          <div className="monitor-toolbar">
            <span className="workspace-title">ChatGPT Work</span>
            <span className="workspace-project">Enterprise marketing</span>
            <span className="workspace-user" aria-label="Morgan's profile">
              M
            </span>
          </div>
          <div
            className="workspace-desktop"
            onClickCapture={(event) => {
              const activity = workspaceInteraction(event.target);
              if (activity) onArchitectureInteraction?.(activity);
            }}
            onChangeCapture={(event) => {
              const activity = workspaceInteraction(event.target);
              if (activity) onArchitectureInteraction?.(activity);
            }}
          >
            <aside className="chat-sidebar">
              <button
                className="new-chat"
                onClick={(e) => jump(".agent-product", e)}
              >
                <span aria-hidden="true">＋</span> New chat
              </button>
              {onRestart && (
                <button className="restart-chat" onClick={onRestart}>
                  <span aria-hidden="true">↺</span> Restart prototype
                </button>
              )}
              {onToggleArchitecture && (
                <button
                  className="architecture-sidebar-tool"
                  aria-expanded={architectureOpen}
                  onClick={onToggleArchitecture}
                >
                  <span aria-hidden="true">◇</span>
                  {architectureOpen
                    ? "Close workflow architecture"
                    : "Workflow architecture for this step"}
                </button>
              )}
              {onCampaignResults && (
                <button
                  className="campaign-results-sidebar-tool"
                  aria-pressed={campaignResultsOpen}
                  onClick={onCampaignResults}
                >
                  <span aria-hidden="true">◌</span>
                  {campaignResultsOpen
                    ? "Back to today’s recap"
                    : "Campaign results & learnings"}
                </button>
              )}
              <button className="chat-search" onClick={(e) => jump(".agent-composer", e)}>
                <span aria-hidden="true">⌕</span> Search chats
              </button>
              <span className="chat-sidebar-label">Project</span>
              <button className="project-chat" onClick={(e) => jump(".agent-product", e)}>
                <span className="project-icon" aria-hidden="true">▣</span>
                Enterprise adoption
              </button>
              <span className="chat-sidebar-label">Recent</span>
              <button
                className="chat-thread active-thread"
                onClick={(e) =>
                  jump(".agent-product, .day-arrival, .day-evening", e)
                }
              >
                Morgan’s workspace
              </button>
              {workflow && (
                <>
                  <button onClick={(e) => jump(".campaign-editor", e)}>
                    Campaign brief
                  </button>
                  <button
                    onClick={(e) =>
                      jump(".execution-assets, .work-artifact", e)
                    }
                  >
                    Work products
                  </button>
                </>
              )}
              <small>Enterprise marketing</small>
            </aside>
            {architectureRail}
            <div className="workspace-thread">{children}</div>
          </div>
        </div>
        <div className="monitor-chin" aria-hidden="true" />
      </div>
    </div>
  );
}
export default function AgentWorkspace() {
  const [s, setS] = useState(createAgentState);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [page, setPage] = useState("intro");
  const [showStepContext, setShowStepContext] = useState(false);
  const [architectureActivity, setArchitectureActivity] = useState("");
  const [architectureRoute, setArchitectureRoute] = useState<string[] | null>(
    null,
  );
  const [architectureActivityVersion, setArchitectureActivityVersion] =
    useState(0);
  const [showRecapResults, setShowRecapResults] = useState(false);
  const chapter = Math.max(0, Math.min(2, s.day.moment - 1));
  function setChapter(index: number) {
    setS((prev) => ({ ...prev, day: { ...prev.day, moment: index + 1 } }));
  }
  function resetPrototype() {
    const fresh = createAgentState();
    setS((prev) => ({
      ...prev,
      // Restart inside the same full-screen workspace rather than returning
      // to the separate arrival layout.
      day: { ...fresh.day, moment: 0 },
      audience: fresh.audience,
      channel: fresh.channel,
      source: fresh.source,
      campaign: undefined,
      artifactEdits: {},
      work: {},
      process: {},
      learning: undefined,
      outcomes: fresh.outcomes,
    }));
    setConversation({});
    setDraft("");
    setShowStepContext(false);
    setArchitectureActivity("");
    setArchitectureRoute(null);
    setArchitectureActivityVersion(0);
    setShowRecapResults(false);
    setPage("workspace");
    requestAnimationFrame(() =>
      document
        .querySelector<HTMLElement>(".monitor-screen")
        ?.scrollTo({ top: 0, behavior: "instant" }),
    );
  }
  function updateInMonitor(update: () => void, showWork = false) {
    const before = document
      .querySelector(".monitor-bezel")
      ?.getBoundingClientRect().top;
    update();
    requestAnimationFrame(() => {
      const monitor = document.querySelector(".monitor-bezel");
      const screen = document.querySelector<HTMLElement>(".monitor-screen");
      if (before !== undefined && monitor)
        window.scrollBy({
          top: monitor.getBoundingClientRect().top - before,
          behavior: "instant",
        });
      if (screen) {
        const artifact = showWork
          ? screen.querySelector<HTMLElement>(".work-artifact")
          : null;
        const top = artifact
          ? artifact.getBoundingClientRect().top -
            screen.getBoundingClientRect().top +
            screen.scrollTop -
            55
          : 0;
        screen.scrollTo({ top, behavior: "instant" });
      }
    });
  }
  const [demo, setDemo] = useState(false);
  const [draft, setDraft] = useState("");
  const [adjustingRecommendation, setAdjustingRecommendation] = useState(false);
  const [planStatus, setPlanStatus] = useState("");
  const [conversation, setConversation] = useState<
    Record<string, { prompt: string; reply: string }[]>
  >({});
  function ask(prompt: string) {
    if (!prompt.trim()) return;
    let reply = guidedReply(chapters[chapter], prompt);
    const q = prompt.toLowerCase();
    if (
      /website|sales follow.up|sales enablement|thought leadership|social|lifecycle|one audience|^objective:/.test(
        q,
      )
    ) {
      setS((prev) => ({
        ...prev,
        ...(q.includes("website") ? { channel: "Email + website" } : {}),
        ...(q.includes("sales follow") ||
        q.includes("sales enablement") ||
        q.includes("thought leadership")
          ? { channel: "Sales enablement + executive thought leadership" }
          : {}),
        ...(q.includes("social")
          ? { channel: "Social campaign + website" }
          : {}),
        ...(q.includes("lifecycle") ? { audience: "Lifecycle stages" } : {}),
        ...(q.includes("one audience") ? { audience: "One audience" } : {}),
        ...(q.startsWith("objective:")
          ? {
              campaign: {
                objective: prompt.slice(10).trim(),
                instruction: prev.campaign?.instruction || "",
              },
            }
          : {}),
      }));
      reply =
        "I’ve updated the campaign conditions from your request. The work packages will rebuild from the updated brief. You can review the changed audience, channel or objective above.";
    } else if (
      /^(add|include|avoid|change|update|revise|make|keep|focus)/i.test(prompt)
    ) {
      setS((prev) => ({
        ...prev,
        campaign: {
          objective:
            prev.campaign?.objective ||
            "Grow enterprise adoption across the buying group",
          instruction: prompt.trim(),
        },
      }));
      reply =
        "I’ve attached your instruction to the campaign brief and its work products. Open an artifact to review or edit the specific instructions; this prototype does not generate new marketing copy.";
    }
    setConversation((prev) => ({
      ...prev,
      [chapters[chapter].id]: [
        ...(prev[chapters[chapter].id] || []),
        { prompt: prompt.trim(), reply },
      ],
    }));
    setDraft("");
  }
  const c = chapters[chapter],
    f = s.findings[c.id],
    key = AGENT_KEY + (demo ? "-demo" : "");
  useEffect(() => {
    const d = new URLSearchParams(location.search).get("demo") === "1";
    setDemo(d);
    try {
      const raw = localStorage.getItem(AGENT_KEY + (d ? "-demo" : ""));
      if (raw) setS(restoreAgentState(JSON.parse(raw)));
    } catch {
      setError(
        "Saved data could not be read. Export a backup before continuing; the saved copy will not be overwritten.",
      );
    }
    const params = new URLSearchParams(location.search);
    const view = params.get("view");
    if (
      view &&
      [
        "intro",
        "meet",
        "priorities",
        "workspace",
        "performance",
        "capabilities",
        "architecture",
        "readout",
      ].includes(view)
    )
      setPage(view);
    const day = params.get("day");
    if (day !== null && /^[0-4]$/.test(day))
      setS((prev) => ({ ...prev, day: { ...prev.day, moment: Number(day) } }));
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || error) return;
    try {
      localStorage.setItem(key, JSON.stringify(s));
      setSaved("Saved in this browser");
    } catch {
      setError("Autosave unavailable. Export a backup before leaving.");
    }
  }, [s, ready, error, key]);
  useEffect(() => {
    if (!ready) return;
    const url = new URL(location.href);
    url.searchParams.set("view", page);
    if (page === "workspace") url.searchParams.set("day", String(s.day.moment));
    else url.searchParams.delete("day");
    history.replaceState(history.state, "", url);
  }, [ready, page, s.day.moment]);
  function save() {
    if (error) return { ok: false, message: error };
    try {
      localStorage.setItem(key, JSON.stringify(s));
      setSaved("Saved just now");
      return { ok: true, message: "Saved just now" };
    } catch {
      setError("Save unavailable. Export a backup.");
      return { ok: false, message: "Save unavailable" };
    }
  }
  function finding(p: Partial<Finding>) {
    setS((prev) => ({
      ...prev,
      findings: { ...prev.findings, [c.id]: { ...prev.findings[c.id], ...p } },
    }));
  }
  function download(backup = false) {
    const url = URL.createObjectURL(
      new Blob([backup ? JSON.stringify(s, null, 2) : agentReadout(s)], {
        type: backup ? "application/json" : "text/markdown",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${demo ? "DEMO-" : ""}agent-workshop.${backup ? "json" : "md"}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function condition(p: Partial<typeof s>) {
    setPlanStatus("Plan choices saved in this browser. Confirm the plan to continue.");
    recordArchitectureActivity(
      "Audience and channel choices are updating the CDP context for the next recommendation.",
    );
    setS((prev) => ({
      ...prev,
      ...p,
      campaign:
        "audience" in p || "channel" in p || "source" in p
          ? undefined
          : prev.campaign,
      outcomes: { ...prev.outcomes, [c.id]: "" },
    }));
  }
  function recordArchitectureActivity(activity: string) {
    setArchitectureActivity(activity);
    setArchitectureRoute(routeForArchitectureActivity(activity));
    setArchitectureActivityVersion((version) => version + 1);
  }
  const arch = architectureSession(s);
  return (
    <SaveContext.Provider value={{ save, revision: s, error }}>
      <div className="agent-app">
        <header className="agent-top">
          <ReviewComments />
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPage("intro");
            }}
            className="agent-brand"
          >
            OpenAI <span>× Code and Theory</span>
          </a>
          <nav aria-label="Workshop navigation">
            {[
              ["intro", "0 · Briefing"],
              ["meet", "1 · Morgan’s Tuesday"],
              ["priorities", "2 · Priorities"],
              ["workspace", "3 · Prototype flow"],
              ["architecture", "4 · Workflow architecture"],
              ["readout", "5 · Readout"],
            ].map(([id, label]) => (
              <button
                key={id}
                aria-current={page === id ? "page" : undefined}
                onClick={() => setPage(id)}
              >
                {label}
              </button>
            ))}
          </nav>
          <span className="agent-prototype">
            {demo ? "DEMO SESSION" : "WORKING PROTOTYPE"}
          </span>
        </header>
        {error && (
          <p role="alert" className="agent-error">
            {error}{" "}
            <button onClick={() => download(true)}>Export backup</button>
          </p>
        )}
        {page === "intro" ? (
          <AgentBriefing
            onEnter={() => {
              setPage("meet");
              window.scrollTo({ top: 0 });
            }}
          />
        ) : page === "meet" ? (
          <MeetMorgan
            onEnter={() => {
              setPage("priorities");
              window.scrollTo({ top: 0 });
            }}
          />
        ) : page === "priorities" ? (
          <UseCaseScoring
            assessments={s.useCases}
            onChange={(id, patch) =>
              setS((prev) => ({
                ...prev,
                useCases: {
                  ...prev.useCases,
                  [id]: { ...prev.useCases[id], ...patch },
                },
              }))
            }
            onContinue={() => {
              setS((prev) => ({ ...prev, day: { ...prev.day, moment: 1 } }));
              setPage("workspace");
              window.scrollTo({ top: 0 });
            }}
          />
        ) : page === "capabilities" ? (
          <main className="agent-wide">
            <span className="agent-kicker">
              Agenda 2 · Current-state workflow architecture and capability reuse · 25
              minutes
            </span>
            <h1>What can we build on?</h1>
            <p className="agent-lede">
              Review the requirements exposed by Morgan’s day. Confirm what
              exists across Codex, product/growth infrastructure, S3/data,
              Marketo and internal tooling. These are areas to discuss—not
              pre-confirmed integrations.
            </p>
            <div className="agent-readout-cards">
              {chapters.map((ch) => {
                const finding = s.findings[ch.id];
                return (
                  <article key={ch.id}>
                    <h2>{ch.title}</h2>
                    {ch.inputs.map(([label, detail]) => (
                      <label key={label}>
                        {label}
                        <small>{detail}</small>
                        <select
                          value={finding.capabilities[label] || "Unknown"}
                          onChange={(e) =>
                            setS((prev) => ({
                              ...prev,
                              findings: {
                                ...prev.findings,
                                [ch.id]: {
                                  ...prev.findings[ch.id],
                                  capabilities: {
                                    ...prev.findings[ch.id].capabilities,
                                    [label]: e.target.value,
                                  },
                                },
                              },
                            }))
                          }
                        >
                          {availability.map((a) => (
                            <option key={a}>{a}</option>
                          ))}
                        </select>
                      </label>
                    ))}
                    <label>
                      Existing tools, reuse opportunities and missing
                      foundations
                      <textarea
                        value={finding.note}
                        onChange={(e) =>
                          setS((prev) => ({
                            ...prev,
                            findings: {
                              ...prev.findings,
                              [ch.id]: {
                                ...prev.findings[ch.id],
                                note: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </label>
                  </article>
                );
              })}
            </div>
            <button onClick={save}>Save capability findings</button>{" "}
            <button
              className="agent-primary"
              onClick={() => {
                setPage("architecture");
                window.scrollTo({ top: 0 });
              }}
            >
              Next · Workflow architecture →
            </button>
          </main>
        ) : page === "performance" ? (
          <main className="agent-wide">
            <div className="agent-story">
              <span className="agent-kicker">
                Time jump · after the approved campaign has run
              </span>
              <h1>Morgan comes back to the evidence.</h1>
              <p>
                She wants to know what changed for the account—not just whether
                the emails went out. This illustrative follow-up shows how the
                next decision draws on results.
              </p>
            </div>
            <MorganScreen
              onRestart={resetPrototype}
              onToggleArchitecture={() => setPage("architecture")}
            >
              <PerformanceLoop
                session={s}
                onSave={(learning) => setS((prev) => ({ ...prev, learning }))}
                onApply={(instruction) => {
                  setS((prev) => ({
                    ...prev,
                    campaign: {
                      objective:
                        prev.campaign?.objective ||
                        "Help Northstar Health move from technical evaluation to an expansion decision",
                      instruction,
                    },
                    day: { ...prev.day, moment: 2 },
                  }));
                  setPage("workspace");
                }}
              />
            </MorganScreen>
            <button onClick={() => setPage("readout")}>
              Take the decision into the readout →
            </button>
          </main>
        ) : page === "workspace" ? (
          <main className="agent-main prototype-main">
            <section className="agent-stage" id="morgan-day">
              {s.day.moment === 0 ? (
                <div className="prototype-screen-layout">
                  <MorganScreen onRestart={resetPrototype}>
                    <div className="day-arrival">
                      <span className="agent-kicker">
                        08:45 · Morgan arrives
                      </span>
                      <h1>Good morning, Morgan.</h1>
                      <p className="agent-lede">
                        Four things need your attention this morning. I
                        recommend starting with the adoption opportunity; the
                        other items are ready when you are.
                      </p>
                      <MorningInbox
                        onStart={() => updateInMonitor(() => setChapter(0))}
                      />
                      <div className="day-agenda">
                        <h3>While you focus on this</h3>
                        <p>
                          I’ll prepare a content plan when you choose the
                          direction, bring approvals back to you, and surface
                          only the operational exceptions that need judgment.
                        </p>
                      </div>
                      <p className="agent-disclaimer">
                        Illustrative end state · All signals, counts and actions
                        are fictional.
                      </p>
                    </div>
                  </MorganScreen>
                </div>
              ) : s.day.moment === 4 ? (
                <div className="prototype-screen-layout">
                  <MorganScreen
                    workflow
                    onRestart={resetPrototype}
                    onToggleArchitecture={() => setPage("architecture")}
                    onCampaignResults={() =>
                      setShowRecapResults((shown) => !shown)
                    }
                    campaignResultsOpen={showRecapResults}
                  >
                    {showRecapResults ? (
                      <div className="agent-product campaign-results-chat">
                        <header>
                          <b>
                            Marketing agent <span aria-hidden="true">⌄</span>
                          </b>
                          <span>Enterprise adoption campaign</span>
                        </header>
                        <div className="agent-conversation">
                          <div className="day-recap-thread">
                            <span>17:30 · Campaign results &amp; learnings</span>
                            <p>
                              Morgan asked to inspect the first campaign signals
                              and decide what they should change in the next run.
                            </p>
                          </div>
                          <div className="agent-reply campaign-results-reply">
                            <span className="agent-orb">✳</span>
                            <div>
                              <b>Marketing agent</b>
                              <p>
                                I’ve opened the campaign dashboard as an
                                artifact in this conversation. It combines the
                                reference results, the limits of the evidence,
                                and a recommendation for the next iteration.
                              </p>
                            </div>
                          </div>
                          <section className="campaign-results-artifact" aria-label="Campaign results dashboard artifact">
                            <div className="campaign-results-artifact-bar">
                              <span>Dashboard artifact</span>
                              <b>Northstar Health · first-week reference</b>
                            </div>
                            <PerformanceLoop
                              session={s}
                              onSave={(learning) =>
                                setS((prev) => ({ ...prev, learning }))
                              }
                              onApply={(instruction) => {
                                setS((prev) => ({
                                  ...prev,
                                  campaign: {
                                    objective:
                                      prev.campaign?.objective ||
                                      "Help Northstar Health move from technical evaluation to an expansion decision",
                                    instruction,
                                  },
                                  day: { ...prev.day, moment: 2 },
                                }));
                                setShowRecapResults(false);
                              }}
                            />
                          </section>
                          <button
                            className="campaign-results-return"
                            onClick={() => setShowRecapResults(false)}
                          >
                            Back to today’s recap
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="agent-product day-recap-chat">
                        <header>
                          <b>
                            Marketing agent <span aria-hidden="true">⌄</span>
                          </b>
                          <span>Enterprise adoption campaign</span>
                        </header>
                        <div className="agent-conversation">
                          <div className="day-recap-thread">
                            <span>17:30 · Today’s activity</span>
                            <p>
                              I’ve brought together the work you directed today
                              and the first illustrative campaign signals.
                            </p>
                          </div>
                          <div className="agent-reply day-recap-reply">
                            <span className="agent-orb">✳</span>
                            <div>
                              <b>Marketing agent</b>
                              <h2>Here’s what moved today.</h2>
                              <p>
                                Three coordinated campaign patterns are staged
                                for 12 accounts. The first results show where
                                the buying group is engaging and where Morgan’s
                                next decision should focus.
                              </p>
                            </div>
                          </div>
                          <section className="day-recap-metrics" aria-label="Illustrative campaign results">
                            <article>
                              <b>3</b>
                              <span>campaign patterns deployed</span>
                              <small>sales, web and event routes</small>
                            </article>
                            <article>
                              <b>36</b>
                              <span>individual audience paths</span>
                              <small>12 accounts · 3 buying roles</small>
                            </article>
                            <article>
                              <b>38%</b>
                              <span>decision-maker engagement</span>
                              <small>illustrative first-week signal</small>
                            </article>
                            <article>
                              <b>7</b>
                              <span>sales-ready conversations</span>
                              <small>based on role and response signals</small>
                            </article>
                          </section>
                          <section className="day-recap-insights">
                            <span className="agent-kicker">What the data suggests</span>
                            <article>
                              <b>Business sponsors are now engaging.</b>
                              <p>
                                The operating-value path created the strongest
                                response among contacts who had not previously
                                entered the evaluation.
                              </p>
                            </article>
                            <article>
                              <b>Governance remains the release constraint.</b>
                              <p>
                                Two contacts are held for consent and review
                                checks; the rest of the staged work can proceed
                                once required approvals are complete.
                              </p>
                            </article>
                          </section>
                          <section className="day-recap-history">
                            <span className="agent-kicker">Today’s decisions</span>
                            {s.day.history.length ? (
                              s.day.history.map((h) => (
                                <article key={h.id} className="day-history">
                                  <span>{h.time}</span>
                                  <p>{h.text}</p>
                                </article>
                              ))
                            ) : (
                              <p>No decisions have been made yet.</p>
                            )}
                          </section>
                          <div className="day-brief">
                            <h2>Ready for the next handoff.</h2>
                            <p>
                              {s.day.history.some((h) => h.id === "s3")
                                ? "Your approved plan is queued for required reviews. Release remains gated on approvals and audience eligibility."
                                : "The campaign plan still needs your review before I can prepare the next handoff."}
                            </p>
                            <p>
                              Open “Campaign results & learnings” in the sidebar
                              to inspect the signals and apply a learning to the
                              next plan.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </MorganScreen>
                </div>
              ) : (
                <>
                  <div className="prototype-screen-layout">
                    <MorganScreen
                      workflow
                      onRestart={resetPrototype}
                      onToggleArchitecture={() =>
                        setShowStepContext((shown) => !shown)
                      }
                      architectureOpen={showStepContext}
                      onArchitectureInteraction={recordArchitectureActivity}
                      architectureRail={
                        showStepContext ? (
                          <WorkflowArchitectureRail
                            session={s}
                            id={c.id}
                            onClose={() => setShowStepContext(false)}
                            activity={architectureActivity}
                            activeRoute={architectureRoute}
                            activityVersion={architectureActivityVersion}
                          />
                        ) : undefined
                      }
                    >
                      <div className="agent-product">
                        <header>
                          <b>
                            Marketing agent <span aria-hidden="true">⌄</span>
                          </b>
                          <span>Enterprise adoption campaign</span>
                        </header>
                        <div className="agent-conversation">
                          {s.day.history
                            .filter(
                              (h) =>
                                chapters.findIndex((ch) => ch.id === h.id) <
                                chapter,
                            )
                            .map((h) => (
                              <article className="day-history" key={h.id}>
                                <span>{h.time} · Earlier in this thread</span>
                                <p>{h.text}</p>
                              </article>
                            ))}

                          <div className="agent-prompt">{c.prompt}</div>
                          <div className="agent-reply">
                            <span className="agent-orb">✳</span>
                            <div>
                              <b>Marketing agent</b>
                              <p>{c.response}</p>
                            </div>
                          </div>
                          {chapter === 1 ? (
                            <section className="agent-recommendation">
                              <div className="recommendation-header">
                                <div>
                                  <span className="agent-kicker">
                                    Recommended next step
                                  </span>
                                  <h3>
                                    Bring Northstar’s business sponsor and
                                    procurement into the active evaluation.
                                  </h3>
                                  <p>
                                    Northstar’s technical team has completed two
                                    workspace projects; the business sponsor has
                                    not yet engaged; procurement returned to the
                                    governance guide after last week’s
                                    roundtable. Send a role-specific follow-up
                                    from the selected fictional content
                                    foundation, then apply the same pattern to
                                    the other 11 accounts in the cohort.
                                  </p>
                                </div>
                                <span className="recommendation-badge">
                                  Recommended
                                </span>
                              </div>
                              <div className="recommendation-actions">
                                <button
                                  className="agent-primary"
                                  onClick={() =>
                                    setAdjustingRecommendation(true)
                                  }
                                >
                                  Review plan choices
                                </button>
                                <button
                                  aria-expanded={adjustingRecommendation}
                                  onClick={() =>
                                    setAdjustingRecommendation((open) => !open)
                                  }
                                >
                                  {adjustingRecommendation
                                    ? "Hide plan choices"
                                    : "Adjust recommendation"}
                                </button>
                              </div>
                              {adjustingRecommendation && (
                                <div className="recommendation-adjustments">
                                  <section>
                                    <span className="adjustment-label">
                                      Audience focus
                                    </span>
                                    <p>
                                      The recommendation starts with buying
                                      roles. Choose another focus only if it
                                      better fits this opportunity.
                                    </p>
                                    <div className="audience-options">
                                      {[
                                        [
                                          "Buying roles",
                                          "Reach technical evaluators, business sponsors and procurement differently.",
                                        ],
                                        [
                                          "Lifecycle stages",
                                          "Prioritize where each contact is in the adoption journey.",
                                        ],
                                        [
                                          "One audience",
                                          "Use one eligible group when segmentation would not change the work.",
                                        ],
                                      ].map(([value, detail]) => (
                                        <button
                                          key={value}
                                          className={
                                            s.audience === value
                                              ? "selected"
                                              : ""
                                          }
                                          onClick={() =>
                                            condition({ audience: value })
                                          }
                                        >
                                          <b>{value}</b>
                                          <span>{detail}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </section>
                                  <section>
                                    <span className="adjustment-label">
                                      Channel mix
                                    </span>
                                    <p>
                                      Start with the recommended mix, then add
                                      or remove the channels that this account
                                      opportunity needs.
                                    </p>
                                    <div className="channel-options">
                                      {channelOptions.map((channel) => {
                                        const checked = channelsForPlan(
                                          s.channel,
                                        ).includes(channel);
                                        return (
                                          <button
                                            key={channel}
                                            type="button"
                                            aria-pressed={checked}
                                            className={checked ? "selected" : ""}
                                            onClick={() => {
                                              const selected = channelsForPlan(s.channel);
                                              const next = checked
                                                ? selected.filter((item) => item !== channel)
                                                : [...selected, channel];
                                              if (next.length) condition({ channel: planForChannels(next) });
                                            }}
                                          >
                                            <span aria-hidden="true">{checked ? "✓" : "+"}</span>
                                            {channel}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </section>
                                  <section className="source-availability">
                                    <span className="adjustment-label">
                                      Approved creative
                                    </span>
                                    <p>
                                      The content step will use the CDP context
                                      to search the approved library. Confirm
                                      whether that library is available in this
                                      scenario.
                                    </p>
                                    <div>
                                      {["Approved source available", "Source material missing"].map((value) => (
                                        <button
                                          key={value}
                                          className={s.source === value ? "selected" : ""}
                                          aria-pressed={s.source === value}
                                          onClick={() => condition({ source: value })}
                                        >
                                          <b>{value === "Approved source available" ? "Use approved creative" : "Create new content"}</b>
                                          <span>{value === "Approved source available" ? "Search for an approved creative foundation in the next step." : "Skip library retrieval and prepare a new-content request from the campaign brief."}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </section>
                                  <div className="recommendation-confirm">
                                    <b>Confirm this plan before work begins</b>
                                    <p>
                                      The agent will not select a content
                                      foundation or prepare packages until you
                                      confirm the audience, channel mix and
                                      source status.
                                    </p>
                                    <button
                                      className="agent-primary"
                                      onClick={() => {
                                        setS((prev) => ({
                                          ...prev,
                                          campaign: {
                                            objective:
                                              prev.campaign?.objective ||
                                              "Help Northstar Health move from technical evaluation to an expansion decision",
                                            instruction:
                                              prev.campaign?.instruction || "",
                                          },
                                        }));
                                        setPlanStatus(
                                          "Plan confirmed. The fictional practice library is ready for Morgan’s selection.",
                                        );
                                        recordArchitectureActivity(
                                          "The confirmed audience and channel mix are now passing into CDP-informed content discovery.",
                                        );
                                      }}
                                    >
                                      Confirm audience, channels & source
                                    </button>
                                    {planStatus && (
                                      <p role="status" className="plan-status">
                                        {planStatus}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </section>
                          ) : null}
                          <CampaignEditor
                            session={s}
                            onApply={(campaign) =>
                              setS((prev) => ({ ...prev, campaign }))
                            }
                          />
                          <WorkflowWork
                            onArchitectureActivity={recordArchitectureActivity}
                            onProcess={(value) =>
                              setS((prev) => ({
                                ...prev,
                                process: {
                                  ...prev.process,
                                  [processKey(
                                    prev,
                                    c.id,
                                    currentWorkStep(prev, c.id),
                                  )]: value,
                                },
                              }))
                            }
                            onCampaignChange={(patch) =>
                              setS((prev) => ({
                                ...prev,
                                ...patch,
                                outcomes: { ...prev.outcomes, [c.id]: "" },
                              }))
                            }
                            key={`${c.id}:${workSignature(s, c.id)}`}
                            onEdit={(key, rows) =>
                              setS((prev) => ({
                                ...prev,
                                artifactEdits: {
                                  ...prev.artifactEdits,
                                  [key]: rows,
                                },
                              }))
                            }
                            session={s}
                            id={c.id}
                            onStep={(step) =>
                              updateInMonitor(
                                () =>
                                  setS((prev) => ({
                                    ...prev,
                                    work: {
                                      ...prev.work,
                                      [c.id]: {
                                        signature: workSignature(prev, c.id),
                                        step,
                                      },
                                    },
                                  })),
                                true,
                              )
                            }
                            onFinish={() => {
                              updateInMonitor(() => {
                                setS((prev) => advanceDay(prev, chapter));
                              });
                            }}
                          />
                          {(conversation[c.id] || []).map((turn, i) => (
                            <div key={i} className="agent-followup">
                              <div className="agent-prompt">{turn.prompt}</div>
                              <div className="agent-reply">
                                <span className="agent-orb">✳</span>
                                <div>
                                  <b>Marketing agent</b>
                                  <p>{turn.reply}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          <form
                            className="agent-composer"
                            onSubmit={(e) => {
                              e.preventDefault();
                              ask(draft);
                            }}
                          >
                            <label className="sr-only" htmlFor="agent-message">
                              Ask about this workflow
                            </label>
                            <textarea
                              id="agent-message"
                              rows={2}
                              value={draft}
                              onChange={(e) => setDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (
                                  e.key === "Enter" &&
                                  !e.shiftKey &&
                                  !e.nativeEvent.isComposing
                                ) {
                                  e.preventDefault();
                                  ask(draft);
                                }
                              }}
                              placeholder="Ask about this workflow"
                            />
                            <div>
                              <span>Guided prototype · no live tools</span>
                              <button
                                aria-label="Send message"
                                disabled={!draft.trim()}
                                type="submit"
                              >
                                ↑
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </MorganScreen>
                  </div>
                </>
              )}
            </section>
          </main>
        ) : page === "architecture" ? (
          <main className="agent-wide">
            <span className="agent-kicker">
              Step 4 · Capabilities, workflow architecture and operating boundaries · 25
              minutes
            </span>
            <h1>How would we make it work?</h1>
            <p className="agent-lede">
              Now bring the relevant capabilities into the full workflow architecture.
              The diagram is our starting proposal; use the room’s feedback to
              adapt the flows, ownership and open decisions.
            </p>
            <section className="architecture-bridge">
              <b>What this section does</b>
              <p>
                Connect the prototype components to the wider systems of record,
                intelligence, activation, governance and measurement. Confirm
                what can be reused, what must be connected and what remains a
                gap.
              </p>
            </section>
            <ArchitectureOutput
              session={arch}
              explorer
              setSession={(action) =>
                setS((prev) => ({
                  ...prev,
                  architecture:
                    typeof action === "function"
                      ? action(architectureSession(prev))
                      : action,
                }))
              }
            />
          </main>
        ) : (
          <main className="agent-wide">
            <span className="agent-kicker">
              Agenda 4 · Decisions, sequencing, and Colin readout · 15 minutes
            </span>
            <h1>What we’re taking forward.</h1>
            <p className="agent-lede">
              {
                useCaseCandidates.filter(
                  (candidate) =>
                    s.useCases[candidate.id].priority === "Priority",
                ).length
              }{" "}
              of {useCaseCandidates.length} candidate areas marked as
              priorities. Unknowns remain open.
            </p>
            <p>
              <b>Workshop aim:</b> {s.northstar || "Not agreed yet"}
            </p>
            <section className="readout-priority-set">
              <span className="agent-kicker">Agreed priority use-case set</span>
              {useCaseCandidates.some(
                (candidate) => s.useCases[candidate.id].priority === "Priority",
              ) ? (
                <ol>
                  {useCaseCandidates
                    .filter(
                      (candidate) =>
                        s.useCases[candidate.id].priority === "Priority",
                    )
                    .map((candidate) => (
                      <li key={candidate.id}>
                        <b>{candidate.title}</b>
                        <span>{candidate.short}</span>
                      </li>
                    ))}
                </ol>
              ) : (
                <p>The room has not selected a priority set yet.</p>
              )}
            </section>
            <div className="agent-readout-cards">
              {chapters.map((ch, i) => {
                const finding = s.findings[ch.id];
                return (
                  <article key={ch.id}>
                    <span className="agent-kicker">{finding.priority}</span>
                    <h2>{ch.title}</h2>
                    <p>
                      <b>Business outcome</b>
                      <br />
                      {finding.businessOutcome || "Not captured yet"}
                    </p>
                    <p>
                      <b>Prove</b>
                      <br />
                      {finding.proof}
                    </p>
                    <p>
                      <b>Decision / dependency</b>
                      <br />
                      {finding.decision || "Not captured yet"}
                    </p>
                    <p>
                      <b>Owner</b> {finding.owner || "Unassigned"}
                    </p>
                    <button
                      onClick={() => {
                        setChapter(i);
                        setPage("priorities");
                      }}
                    >
                      Review room findings →
                    </button>
                  </article>
                );
              })}
            </div>
            <ArchitectureOutput
              session={arch}
              compact
              setSession={(action) =>
                setS((prev) => ({
                  ...prev,
                  architecture:
                    typeof action === "function"
                      ? action(architectureSession(prev))
                      : action,
                }))
              }
            />
            <section className="agent-requirements">
              <h2>For Colin · the next-day readout</h2>
              <div className="agent-capture">
                {(
                  [
                    ["ownership", "Agreed ownership boundaries"],
                    ["open", "Open decisions and dependencies"],
                    ["sequence", "Proposed sequence of work"],
                    ["colin", "Decisions or sponsorship needed from Colin"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <textarea
                      value={s.architecture.closing[key]}
                      onChange={(e) =>
                        setS((prev) => ({
                          ...prev,
                          architecture: {
                            ...prev.architecture,
                            closing: {
                              ...prev.architecture.closing,
                              [key]: e.target.value,
                            },
                          },
                        }))
                      }
                    />
                  </label>
                ))}
                <button onClick={save}>Save readout</button>
              </div>
            </section>
            <button className="agent-primary" onClick={() => download()}>
              Download concise readout
            </button>
          </main>
        )}
      </div>
    </SaveContext.Provider>
  );
}
