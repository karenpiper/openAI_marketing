"use client";
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
import ArchitectureOutput from "./architecture-output";
import { Architecture } from "./workshop-mapping";
import { SaveContext } from "./save-footer";
import "./agent-workspace.css";
function MorganScreen({ children }: { children: ReactNode }) {
  return (
    <div className="monitor-wrap">
      <div className="monitor-label">
        <b>MORGAN’S COMPUTER</b>
        <span>Proposed experience · fictional data · no live actions</span>
      </div>
      <div className="monitor-bezel">
        <div className="monitor-camera" aria-hidden="true" />
        <div className="monitor-screen">
          <div className="monitor-toolbar">
            <span aria-hidden="true">● ● ●</span>
            <span>ChatGPT · Marketing workspace</span>
            <span>Morgan</span>
          </div>
          {children}
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
  const chapter = Math.max(0, Math.min(2, s.day.moment - 1));
  function setChapter(index: number) {
    setS((prev) => ({ ...prev, day: { ...prev.day, moment: index + 1 } }));
  }
  function scrollThread() {
    requestAnimationFrame(() =>
      document
        .getElementById("morgan-day")
        ?.scrollIntoView({ block: "start", behavior: "smooth" }),
    );
  }
  const [capture, setCapture] = useState(false);
  const [demo, setDemo] = useState(false);
  const [draft, setDraft] = useState("");
  const [conversation, setConversation] = useState<
    Record<string, { prompt: string; reply: string }[]>
  >({});
  function ask(prompt: string) {
    if (!prompt.trim()) return;
    const reply = guidedReply(chapters[chapter], prompt);
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
              ["intro", "Briefing"],
              ["workspace", "Morgan’s workspace"],
              ["architecture", "Architecture"],
              ["readout", "Readout"],
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
          <main className="agent-intro">
            <span className="agent-kicker">
              A 90-minute working conversation
            </span>
            <h1>
              What could Morgan
              <br />
              put in motion?
            </h1>
            <p className="agent-lede">
              An agent prepares the work. Morgan brings the judgment.
              <br />
              Together, we explore what it would take to make that real.
            </p>
            <div className="agent-intro-grid">
              <button
                className={s.day.moment === 0 ? "active" : ""}
                onClick={() =>
                  setS((prev) => ({ ...prev, day: { ...prev.day, moment: 0 } }))
                }
              >
                <span>08:45</span>
                <strong>Morning briefing</strong>
              </button>
              {chapters.map((ch, i) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setChapter(i);
                    setPage("workspace");
                  }}
                >
                  <span>
                    0{i + 1} / {ch.time}
                  </span>
                  <h2>{ch.title}</h2>
                  <p>{ch.short} →</p>
                </button>
              ))}
            </div>
            <div className="agent-intro-bottom">
              <div>
                <h3>Start with what we heard.</h3>
                <p>
                  Content at scale is the clearest area of interest. Signal to
                  action and routine operations are connected opportunities to
                  align on—not a predetermined answer.
                </p>
              </div>
              <div>
                <h3>Leave with three concrete outputs.</h3>
                <p>
                  An agreed use-case set. A working architecture with ownership
                  boundaries. Decisions and dependencies for the next readout.
                </p>
              </div>
            </div>
            <button
              className="agent-primary"
              onClick={() => setPage("workspace")}
            >
              Enter Morgan’s workspace →
            </button>
            <p className="agent-disclaimer">
              Imagined near-term experience · Fictional data · No connected
              systems or live actions
            </p>
          </main>
        ) : page === "workspace" ? (
          <main className="agent-main">
            <aside className="agent-sidebar">
              <div className="agent-workspace-name">
                <span className="agent-avatar">M</span>
                <div>
                  <b>Follow Morgan’s day</b>
                  <small>Workshop navigation</small>
                </div>
              </div>
              <span className="agent-kicker">
                Tuesday · one connected workflow
              </span>
              {chapters.map((ch, i) => (
                <button
                  key={ch.id}
                  className={s.day.moment === i + 1 ? "active" : ""}
                  onClick={() => {
                    setChapter(i);
                    setCapture(false);
                  }}
                >
                  <span>{ch.time}</span>
                  <strong>{ch.short}</strong>
                  <small>{s.findings[ch.id].priority}</small>
                </button>
              ))}
              <button
                className={s.day.moment === 4 ? "active" : ""}
                onClick={() =>
                  setS((prev) => ({ ...prev, day: { ...prev.day, moment: 4 } }))
                }
              >
                <span>17:30</span>
                <strong>What moved today</strong>
              </button>
              <div className="agent-sidebar-foot">
                <b>Workshop notes</b>
                <br />
                Explore the agent above. Capture capabilities and decisions
                below the conversation.
              </div>
            </aside>
            <section className="agent-stage" id="morgan-day">
              <div className="day-context">
                <span>✳ Morgan’s Tuesday</span>
                <span>Enterprise adoption / 12 target accounts</span>
              </div>
              {s.day.moment === 0 ? (
                <MorganScreen>
                  <div className="day-arrival">
                    <span className="agent-kicker">08:45 · Morgan arrives</span>
                    <h1>Good morning, Morgan.</h1>
                    <p className="agent-lede">
                      I’ve pulled together what changed overnight. There’s one
                      opportunity I think is worth your attention.
                    </p>
                    <div className="day-brief">
                      <span className="agent-kicker">Recommended focus</span>
                      <h2>
                        Technical interest is growing.
                        <br />
                        Bring the rest of the buying group along.
                      </h2>
                      <p>
                        12 target accounts show growing product engagement.
                        Website visits and recent event activity add context—but
                        business sponsors and procurement are not yet part of
                        the conversation.
                      </p>
                      <div className="day-stats">
                        <div>
                          <b>12</b>
                          <span>target accounts</span>
                        </div>
                        <div>
                          <b>3</b>
                          <span>buying roles to engage</span>
                        </div>
                        <div>
                          <b>1</b>
                          <span>coordinated campaign</span>
                        </div>
                      </div>
                      <button
                        className="agent-primary"
                        onClick={() => {
                          setChapter(0);
                          scrollThread();
                        }}
                      >
                        Show me the opportunity →
                      </button>
                    </div>
                    <div className="day-agenda">
                      <h3>While you focus on this</h3>
                      <p>
                        I’ll prepare a content plan when you choose the
                        direction, bring approvals back to you, and surface only
                        the operational exceptions that need judgment.
                      </p>
                    </div>
                    <p className="agent-disclaimer">
                      Illustrative end state · All signals, counts and actions
                      are fictional.
                    </p>
                  </div>
                </MorganScreen>
              ) : s.day.moment === 4 ? (
                <>
                  <MorganScreen>
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
                      Explore the supporting architecture →
                    </button>
                  </section>
                </>
              ) : (
                <>
                  <div className="agent-story">
                    <span className="agent-kicker">
                      {c.time} / {c.short}
                    </span>
                    <h1>{c.short}</h1>
                    <p>{c.story}</p>
                  </div>
                  <MorganScreen>
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
                                    "Email + sales follow-up",
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
                            <div className="agent-plan">
                              {planRows(s).map((r, i) => (
                                <article key={r.label}>
                                  <span>
                                    0{i + 1} / {r.label}
                                  </span>
                                  <h3>{r.value}</h3>
                                  <p>{r.detail}</p>
                                </article>
                              ))}
                            </div>
                          </>
                        ) : chapter === 0 ? (
                          <div className="agent-signal">
                            <div>
                              <span className="agent-kicker">
                                Illustrative opportunity
                              </span>
                              <h2>
                                Interest is growing.
                                <br />
                                The buying group is incomplete.
                              </h2>
                              <p>
                                Product engagement is present, but the proposed
                                journey view suggests business sponsors have not
                                engaged.
                              </p>
                            </div>
                            <ul>
                              <li>
                                <b>Observed in this scenario</b> Product usage +
                                website interest
                              </li>
                              <li>
                                <b>Needs confirmation</b> Account identity +
                                buying roles
                              </li>
                              <li>
                                <b>Proposed action</b> Share a business-value
                                brief; invite relevant roles to an event
                              </li>
                            </ul>
                          </div>
                        ) : (
                          <div className="agent-queue">
                            {[
                              [
                                "Link validation",
                                "Agent can check against approved destinations",
                                "Routine · proposed",
                              ],
                              [
                                "Campaign setup check",
                                "Agent can compare setup with a published checklist",
                                "Routine · proposed",
                              ],
                              [
                                "Audience consent conflict",
                                "Hold the request and escalate to a person",
                                "Human review required",
                              ],
                            ].map(([title, body, status]) => (
                              <article key={title}>
                                <div>
                                  <h3>{title}</h3>
                                  <p>{body}</p>
                                </div>
                                <span>{status}</span>
                              </article>
                            ))}
                          </div>
                        )}

                        <div className="agent-action">
                          <button
                            className="agent-primary"
                            disabled={
                              chapter === 1 &&
                              s.source === "Source material missing"
                            }
                            onClick={() => {
                              setS((prev) => advanceDay(prev, chapter));
                              setCapture(false);
                              scrollThread();
                            }}
                          >
                            {c.action} →
                          </button>
                          <button
                            onClick={() =>
                              setS((prev) => ({
                                ...prev,
                                outcomes: {
                                  ...prev.outcomes,
                                  [c.id]:
                                    "Revision requested. The agent would pause and return a revised proposal for human review.",
                                },
                              }))
                            }
                          >
                            Request a revision
                          </button>
                        </div>
                        <p role="status" className="agent-result">
                          {s.outcomes[c.id] ||
                            (chapter === 1 &&
                            s.source === "Source material missing"
                              ? "Approval is paused until source material is available."
                              : "Explore safely. The campaign remains in preparation until you approve the next step.")}
                        </p>
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
                            "What happens next?",
                            "What is blocked?",
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
                  <section className="agent-requirements">
                    <div>
                      <div className="agent-boundary">
                        <span>HUMAN + AGENT</span>
                        <p>{c.human}</p>
                      </div>
                      <span className="agent-kicker">
                        Facilitator discussion · outside Morgan’s screen
                      </span>
                      <h2>What would make it possible?</h2>
                      <p>
                        Available now, feasible soon, or a gap? A process does
                        not have to exist for a capability to be available.
                      </p>
                    </div>
                    <div className="agent-inputs">
                      {c.inputs.map(([label, detail]) => (
                        <article key={label}>
                          <h3>{label}</h3>
                          <p>{detail}</p>
                          <label>
                            <span className="sr-only">
                              {label} availability
                            </span>
                            <select
                              value={f.capabilities[label] || "Unknown"}
                              onChange={(e) =>
                                finding({
                                  capabilities: {
                                    ...f.capabilities,
                                    [label]: e.target.value,
                                  },
                                })
                              }
                            >
                              {availability.map((a) => (
                                <option key={a}>{a}</option>
                              ))}
                            </select>
                          </label>
                        </article>
                      ))}
                    </div>
                    <p className="agent-output">
                      <b>Output →</b> {c.output}
                    </p>
                    <button
                      className="agent-capture-toggle"
                      aria-expanded={capture}
                      onClick={() => setCapture(!capture)}
                    >
                      {capture ? "Close room notes" : "Capture the room’s view"}{" "}
                      <span>{f.priority}</span>
                    </button>
                    {capture && (
                      <div className="agent-capture">
                        <label>
                          Does this belong in the priority set?
                          <select
                            value={f.priority}
                            onChange={(e) =>
                              finding({ priority: e.target.value })
                            }
                          >
                            {priorities.map((p) => (
                              <option key={p}>{p}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          How does this happen today?
                          <select
                            value={f.process}
                            onChange={(e) =>
                              finding({ process: e.target.value })
                            }
                          >
                            {[
                              "Unknown",
                              "Established process",
                              "Informal workaround",
                              "Not done today",
                            ].map((p) => (
                              <option key={p}>{p}</option>
                            ))}
                          </select>
                        </label>
                        <label className="wide">
                          What exists or needs to change? Include tools if
                          known.
                          <textarea
                            value={f.note}
                            onChange={(e) => finding({ note: e.target.value })}
                          />
                        </label>
                        <label className="wide">
                          What must we prove first?
                          <textarea
                            value={f.proof}
                            onChange={(e) => finding({ proof: e.target.value })}
                          />
                        </label>
                        <label>
                          Decision or dependency
                          <textarea
                            value={f.decision}
                            onChange={(e) =>
                              finding({ decision: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          Owner, if agreed
                          <input
                            value={f.owner}
                            onChange={(e) => finding({ owner: e.target.value })}
                          />
                        </label>
                        <button onClick={save}>Save room notes</button>
                      </div>
                    )}
                  </section>
                  <div className="agent-next">
                    <button
                      onClick={() => {
                        if (chapter < 2) {
                          setChapter(chapter + 1);
                          setCapture(false);
                        } else setPage("architecture");
                      }}
                    >
                      {chapter < 2
                        ? "Preview next moment without approving"
                        : "Explore the architecture"}{" "}
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
              From possibility to implementation
            </span>
            <h1>How would we make it work?</h1>
            <p className="agent-lede">
              The diagram is our starting proposal. Use the room’s capability
              findings to adapt the flows and ownership.
            </p>
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
            <span className="agent-kicker">The working readout</span>
            <h1>What we’re taking forward.</h1>
            <p className="agent-lede">
              {
                chapters.filter(
                  (ch) => s.findings[ch.id].priority === "Priority",
                ).length
              }{" "}
              of 3 candidate areas marked as priorities. Unknowns remain open.
            </p>
            <div className="agent-readout-cards">
              {chapters.map((ch, i) => {
                const finding = s.findings[ch.id];
                return (
                  <article key={ch.id}>
                    <span className="agent-kicker">{finding.priority}</span>
                    <h2>{ch.title}</h2>
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
                        setCapture(true);
                        setPage("workspace");
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
