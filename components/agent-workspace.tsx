"use client";
import { useEffect, useState } from "react";
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
} from "../lib/agent-workspace";
import ArchitectureOutput from "./architecture-output";
import { Architecture } from "./workshop-mapping";
import { SaveContext } from "./save-footer";
import "./agent-workspace.css";
export default function AgentWorkspace() {
  const [s, setS] = useState(createAgentState);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [page, setPage] = useState("intro");
  const [chapter, setChapter] = useState(1);
  const [capture, setCapture] = useState(false);
  const [demo, setDemo] = useState(false);
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
              <span className="agent-kicker">Morgan’s Tuesday</span>
              <h2>
                One day.
                <br />
                Three possibilities.
              </h2>
              <p>
                A proposed experience for a growth & ABM lead. Use it to test
                what matters and what is possible.
              </p>
              {chapters.map((ch, i) => (
                <button
                  key={ch.id}
                  className={chapter === i ? "active" : ""}
                  onClick={() => {
                    setChapter(i);
                    setCapture(false);
                  }}
                >
                  <span>{ch.time}</span>
                  <strong>{ch.title}</strong>
                  <small>{s.findings[ch.id].priority}</small>
                </button>
              ))}
              <div className="agent-sidebar-foot">
                The story is illustrative.
                <br />
                The room’s findings are captured separately.
              </div>
            </aside>
            <section className="agent-stage">
              <div className="agent-story">
                <span className="agent-kicker">
                  {c.time} / {c.short}
                </span>
                <h1>{c.title}</h1>
                <p>{c.story}</p>
              </div>
              <div className="agent-product">
                <header>
                  <span className="agent-orb">✳</span>
                  <b>Morgan’s workspace</b>
                  <span>Simulated agent</span>
                </header>
                <div className="agent-conversation">
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
                                condition({ [field as string]: e.target.value })
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
                          <b>Needs confirmation</b> Account identity + buying
                          roles
                        </li>
                        <li>
                          <b>Proposed action</b> Share a business-value brief;
                          invite relevant roles to an event
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
                  <div className="agent-boundary">
                    <span>HUMAN + AGENT</span>
                    <p>{c.human}</p>
                  </div>
                  <div className="agent-action">
                    <button
                      className="agent-primary"
                      disabled={
                        chapter === 1 && s.source === "Source material missing"
                      }
                      onClick={() =>
                        setS((prev) => ({
                          ...prev,
                          outcomes: {
                            ...prev.outcomes,
                            [c.id]:
                              chapter === 0
                                ? "Recommendation reviewed. Next: prepare an audience-specific plan."
                                : "Simulation approved. The proposed handoff is ready; nothing was sent or executed.",
                          },
                        }))
                      }
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
                      (chapter === 1 && s.source === "Source material missing"
                        ? "Approval is paused until source material is available."
                        : "Explore safely. These controls only change the demonstration.")}
                  </p>
                </div>
              </div>
              <section className="agent-requirements">
                <div>
                  <span className="agent-kicker">Behind this interaction</span>
                  <h2>What would make it possible?</h2>
                  <p>
                    Available now, feasible soon, or a gap? A process does not
                    have to exist for a capability to be available.
                  </p>
                </div>
                <div className="agent-inputs">
                  {c.inputs.map(([label, detail]) => (
                    <article key={label}>
                      <h3>{label}</h3>
                      <p>{detail}</p>
                      <label>
                        <span className="sr-only">{label} availability</span>
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
                        onChange={(e) => finding({ priority: e.target.value })}
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
                        onChange={(e) => finding({ process: e.target.value })}
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
                      What exists or needs to change? Include tools if known.
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
                        onChange={(e) => finding({ decision: e.target.value })}
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
                  {chapter < 2 ? "Next moment" : "Explore the architecture"} →
                </button>
              </div>
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
