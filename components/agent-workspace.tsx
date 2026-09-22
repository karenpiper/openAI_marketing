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
import { WorkflowWork, WorkflowRequirements } from "./workflow-work";
import { CampaignEditor } from "./campaign-editor";
import { processKey } from "../lib/process-state";
import { currentWorkStep, workSignature } from "../lib/workflow-work";
import MorganStory from "./morgan-story";
import PerformanceLoop from "./performance-loop";
import MorningInbox from "./morning-inbox";
import AgentBriefing, { MeetMorgan } from "./agent-briefing";
import ArchitectureOutput from "./architecture-output";
import BackendIllustration from "./backend-illustration";
import { Architecture } from "./workshop-mapping";
import { useCaseCandidates } from "../lib/use-case-candidates";
import { SaveContext } from "./save-footer";
import "./agent-workspace.css";
function MorganScreen({
  children,
  workflow = false,
  onReset,
}: {
  children: ReactNode;
  workflow?: boolean;
  onReset?: () => void;
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
            <span aria-hidden="true">● ● ●</span>
            <span>ChatGPT Work · Enterprise marketing</span>
            <span>Morgan</span>
            {onReset && (
              <button className="monitor-reset" onClick={onReset}>
                ↺ Restart prototype
              </button>
            )}
          </div>
          <div className="workspace-desktop">
            <aside className="chat-sidebar">
              <b>ChatGPT</b>
              <span className="chat-sidebar-label">Project</span>
              <strong>Enterprise adoption</strong>
              <button
                onClick={(e) =>
                  jump(".agent-product, .day-arrival, .day-evening", e)
                }
              >
                ◌ Morgan’s workspace
              </button>
              {workflow && (
                <>
                  <span className="chat-sidebar-label">
                    In this conversation
                  </span>
                  <button onClick={(e) => jump(".campaign-editor", e)}>
                    ▤ Campaign brief
                  </button>
                  <button
                    onClick={(e) =>
                      jump(".execution-assets, .work-artifact", e)
                    }
                  >
                    ▧ Work products
                  </button>
                  <button onClick={(e) => jump(".agent-composer", e)}>
                    ✎ Ask for a change
                  </button>
                </>
              )}
              <small>One campaign · shared context</small>
            </aside>
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
  const chapter = Math.max(0, Math.min(2, s.day.moment - 1));
  function setChapter(index: number) {
    setS((prev) => ({ ...prev, day: { ...prev.day, moment: index + 1 } }));
  }
  function resetPrototype() {
    const fresh = createAgentState();
    setS((prev) => ({
      ...prev,
      day: fresh.day,
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
    setS((prev) => ({
      ...prev,
      ...p,
      outcomes: { ...prev.outcomes, [c.id]: "" },
    }));
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
              ["architecture", "4 · Architecture"],
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
              Agenda 2 · Current-state architecture and capability reuse · 25
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
              Next · Target architecture →
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
            <MorganScreen>
              <PerformanceLoop
                session={s}
                onSave={(learning) => setS((prev) => ({ ...prev, learning }))}
                onApply={(instruction) => {
                  setS((prev) => ({
                    ...prev,
                    campaign: {
                      objective:
                        prev.campaign?.objective ||
                        "Grow enterprise adoption across the buying group",
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
                <>
                  <MorganStory moment={0} />
                  <MorganScreen onReset={resetPrototype}>
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
                </>
              ) : s.day.moment === 4 ? (
                <>
                  <MorganStory moment={4} />
                  <MorganScreen onReset={resetPrototype}>
                    <div className="day-evening">
                      <span className="agent-kicker">
                        17:30 · Back in the same workspace
                      </span>
                      <h1>Here’s what moved today.</h1>
                      <p>
                        Here is the adoption campaign we worked on today, and
                        the decisions you made along the way.
                      </p>
                      {s.day.history.length ? (
                        s.day.history.map((h) => (
                          <article key={h.id} className="day-history">
                            <span>{h.time}</span>
                            <p>{h.text}</p>
                          </article>
                        ))
                      ) : (
                        <p>
                          No decisions have been made yet. Return to the morning
                          briefing to run through the day.
                        </p>
                      )}
                      <div className="day-brief">
                        <h2>Ready for the next handoff.</h2>
                        <p>
                          {s.day.history.some((h) => h.id === "s3")
                            ? "Your approved plan is queued for required reviews. Release remains gated on approvals and audience eligibility."
                            : "The campaign plan still needs your review before I can prepare the next handoff."}
                        </p>
                        <p>
                          {s.day.history.some((h) => h.id === "s5")
                            ? "The consent exception is held for the data owner. I’ll bring it back when the records agree."
                            : "The consent conflict remains open. I need your direction before moving that contact forward."}
                        </p>
                      </div>
                    </div>
                  </MorganScreen>
                  <section className="performance-transition">
                    <span className="agent-kicker">
                      Close the loop · a few days later
                    </span>
                    <h2>What did the campaign teach us?</h2>
                    <p>
                      Jump to fictional results from a reviewed, released
                      reference campaign. Inspect audience and channel outcomes,
                      identify uncertainty and use the learning in the next
                      plan.
                    </p>
                    <button
                      className="agent-primary"
                      onClick={() => {
                        setPage("performance");
                        window.scrollTo({ top: 0 });
                      }}
                    >
                      Explore results and decide what changes →
                    </button>
                  </section>
                  <section className="agent-requirements">
                    <span className="agent-kicker">
                      Facilitator discussion · outside Morgan’s screen
                    </span>
                    <h2>What would enable this day?</h2>
                    <p>
                      Now examine the inputs, connectors, controls and ownership
                      needed to make the proposed experience real.
                    </p>
                    <button onClick={() => setPage("architecture")}>
                      Next · Full architecture →
                    </button>
                  </section>
                </>
              ) : (
                <>
                  <div className="prototype-screen-layout">
                    <MorganScreen workflow onReset={resetPrototype}>
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
                            <>
                              <div className="agent-conditions">
                                {[
                                  [
                                    "Audience",
                                    s.audience,
                                    [
                                      "Buying roles",
                                      "Lifecycle stages",
                                      "One audience",
                                    ],
                                    "audience",
                                  ],
                                  [
                                    "Channel",
                                    s.channel,
                                    [
                                      "Email + event follow-up",
                                      "Email + website",
                                      "Sales enablement + executive thought leadership",
                                      "Social campaign + website",
                                      "Integrated account activation",
                                    ],
                                    "channel",
                                  ],
                                  [
                                    "Source",
                                    s.source,
                                    [
                                      "Approved source available",
                                      "Source material missing",
                                    ],
                                    "source",
                                  ],
                                ].map(([label, value, options, field]) => (
                                  <label key={label as string}>
                                    {label as string}
                                    <select
                                      value={value as string}
                                      onChange={(e) =>
                                        condition({
                                          [field as string]: e.target.value,
                                        })
                                      }
                                    >
                                      {(options as string[]).map((o) => (
                                        <option key={o}>{o}</option>
                                      ))}
                                    </select>
                                  </label>
                                ))}
                              </div>
                            </>
                          ) : null}
                          <CampaignEditor
                            session={s}
                            onApply={(campaign) =>
                              setS((prev) => ({ ...prev, campaign }))
                            }
                          />
                          <WorkflowWork
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
                          <div className="agent-suggestions">
                            {[
                              "Why these accounts?",
                              "Use website instead",
                              "Focus on lifecycle stages",
                            ].map((prompt) => (
                              <button key={prompt} onClick={() => ask(prompt)}>
                                {prompt}
                              </button>
                            ))}
                          </div>
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
                    <div className="prototype-context-control">
                      <button
                        className="prototype-context-trigger"
                        aria-expanded={showStepContext}
                        onClick={() => setShowStepContext((shown) => !shown)}
                      >
                        {showStepContext
                          ? "Close step context"
                          : "Architecture for this step"}
                        <span aria-hidden="true">
                          {showStepContext ? "×" : "◇"}
                        </span>
                      </button>
                      {showStepContext && (
                        <aside className="prototype-context-popover">
                          <header>
                            <span className="agent-kicker">
                              Proposed architecture context
                            </span>
                            <button
                              aria-label="Close architecture context"
                              onClick={() => setShowStepContext(false)}
                            >
                              ×
                            </button>
                          </header>
                          <WorkflowRequirements session={s} id={c.id} />
                          <BackendIllustration session={s} id={c.id} />
                        </aside>
                      )}
                    </div>
                  </div>
                  <div className="agent-next">
                    <button
                      onClick={() => {
                        if (chapter < 2) {
                          setChapter(chapter + 1);
                        } else setPage("architecture");
                      }}
                    >
                      {chapter < 2
                        ? "Continue through the representative flow"
                        : "View the full architecture"}{" "}
                      →
                    </button>
                  </div>
                </>
              )}
            </section>
          </main>
        ) : page === "architecture" ? (
          <main className="agent-wide">
            <span className="agent-kicker">
              Step 4 · Capabilities, architecture and operating boundaries · 25
              minutes
            </span>
            <h1>How would we make it work?</h1>
            <p className="agent-lede">
              Now bring the relevant capabilities into the full architecture.
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
            <Architecture
              agentWorkshop
              session={arch}
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
              <b>Northstar:</b> {s.northstar || "Not agreed yet"}
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
        <footer className="agent-footer">
          <a href="/original">Original workshop</a>
          <span role="status">
            {ready
              ? error
                ? "Save needs attention"
                : saved
              : "Loading saved session…"}{" "}
            · {demo ? "Demo" : "Workshop"} session
          </span>
          <div>
            <button onClick={() => download(true)}>Export backup</button>
            <label className="agent-import">
              Restore backup
              <input
                type="file"
                accept="application/json"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    if (file.size > 2000000) throw Error();
                    const next = restoreAgentState(
                      JSON.parse(await file.text()),
                    );
                    if (
                      confirm("Replace this adapted session with the backup?")
                    ) {
                      setS(next);
                      setError("");
                    }
                  } catch {
                    setSaved("Could not restore that backup.");
                  }
                  e.target.value = "";
                }}
              />
            </label>
            <a href={demo ? "?" : "?demo=1"}>
              {demo ? "Leave demo" : "Explore in demo mode"}
            </a>
          </div>
        </footer>
      </div>
    </SaveContext.Provider>
  );
}
