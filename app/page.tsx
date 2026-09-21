"use client";
import { useEffect, useState } from "react";
import {
  useCases,
  heard,
  decisions,
  axes,
  type NoRegret,
} from "../lib/workshop-data";
import {
  defaults,
  restore,
  composite,
  rank,
  STORAGE_KEY,
  type Assessment,
} from "../lib/assessment";

export default function Home() {
  const [step, setStep] = useState(0),
    [state, setState] = useState(defaults),
    [loaded, setLoaded] = useState(false),
    [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(restore(JSON.parse(raw)));
    } catch {
      setStorageError(true);
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        setStorageError(true);
      }
  }, [state, loaded]);
  function go(n: number) {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function update(id: string, patch: Partial<Assessment>) {
    setState((s) => ({ ...s, [id]: { ...s[id], ...patch, discussed: true } }));
  }
  const current = useCases[step - 2],
    a = current ? state[current.id] : null,
    ranked = rank(state),
    vetoed = useCases.filter((s) => state[s.id].veto);
  const labels = [
    "Meet Morgan",
    "What we heard",
    ...useCases.map((s) => s.title),
    "End-of-day recap",
  ];
  const status = (v: NoRegret) =>
    v === "yes" ? "Yes" : v === "no" ? "No" : "Not sure";
  function download() {
    const blob = new Blob(
      [
        JSON.stringify(
          { exportedAt: new Date().toISOString(), assessments: state },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "morgans-tuesday-workshop.json";
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <main
      className={`app-shell phase-${step < 4 ? "morning" : step < 7 ? "day" : "evening"}`}
    >
      <header className="topbar">
        <div>
          <div className="eyebrow">OpenAI × Adobe × Code and Theory</div>
          <h1>Morgan’s Tuesday</h1>
          <p className="lede">
            Priority use cases and outcomes · Agenda item 1 · 30 minutes
          </p>
        </div>
        <div className="mode-tabs">
          <button onClick={() => go(0)}>Start</button>
          <button onClick={() => go(9)}>Recap</button>
        </div>
      </header>
      {storageError && (
        <p role="alert">
          Browser storage is unavailable or unreadable. Export your notes before
          leaving.
        </p>
      )}
      <div className="workshop-grid">
        <aside className="rail" aria-label="Morgan’s Tuesday">
          <div className="rail-intro">
            Assumptions, not requirements.
            <br />
            {Object.values(state).filter((a) => a.discussed).length} of 7 stops
            discussed
          </div>
          {labels.map((label, i) => (
            <button
              key={label}
              className={`rail-item ${step === i ? "active" : ""}`}
              aria-current={step === i ? "step" : undefined}
              onClick={() => go(i)}
            >
              <span className="rail-time">
                {i < 2
                  ? "Before the day"
                  : i === 9
                    ? "End of day"
                    : useCases[i - 2].time}
              </span>
              <span className="rail-copy">
                <strong>{label}</strong>
                {i > 1 && i < 9 && (
                  <small>
                    {state[useCases[i - 2].id].veto
                      ? "Ruled out"
                      : state[useCases[i - 2].id].discussed
                        ? "Discussed"
                        : "Not discussed"}
                  </small>
                )}
              </span>
            </button>
          ))}
        </aside>
        <section className="scene-panel" aria-label={labels[step]}>
          {step === 0 && (
            <>
              <div className="eyebrow">
                A working session tool — not a finished answer
              </div>
              <h2>Meet Morgan.</h2>
              <p className="moment">
                Growth &amp; ABM lead on OpenAI’s enterprise marketing team.
                This is her Tuesday — as we’re betting it could look, not as it
                looks today.
              </p>
              <p className="intro-copy">
                Every stop names a problem we think is real — not a proposed
                feature. We’re not solutioning yet. Score whether it’s real and
                worth solving, or tell us it isn’t — that answer matters as much
                as a high score.
              </p>
              <blockquote>
                “With assumptions, not requirements. Imagine what the most
                valuable datasets would be, talk about the KPIs we’d move, and
                calibrate it in the room.”
              </blockquote>
              <div className="intro-orbit" aria-hidden="true">
                <span>08:15</span>
                <div />
                <span>18:00</span>
              </div>
              <p>
                Seven moments. One day. Which problems are worth solving first?
              </p>
            </>
          )}
          {step === 1 && (
            <>
              <div className="eyebrow">Before we walk through the day</div>
              <h2>What we heard.</h2>
              <p className="moment">
                This came directly from Matt, Patrick and Jeff last time — not
                from us. Today’s day looks different because of it.
              </p>
              {heard.map((h) => (
                <article className="heard-card" key={h.q}>
                  <h3>“{h.q}”</h3>
                  <p>→ {h.a}</p>
                </article>
              ))}
              <h3 className="section-title">The four decisions still open</h3>
              <p>
                Every stop today asks whether it can move now, or whether it
                depends on one of these four being settled first — named
                specifically, so “regardless of bigger decisions” isn’t left
                abstract.
              </p>
              <div className="decision-grid">
                {decisions.map((d) => (
                  <article className="side-card" key={d.num}>
                    <span className="eyebrow">Decision {d.num}</span>
                    <h3>{d.t}</h3>
                    <p>{d.q}</p>
                    <span className="label">Already said</span>
                    <p>{d.known}</p>
                    <span className="label">Still open</span>
                    <p>{d.open}</p>
                  </article>
                ))}
              </div>
              <blockquote>
                These decisions are context for agenda item 1. We will work
                through architecture later in the workshop. This 30-minute
                section is about which problems are worth solving first.
              </blockquote>
            </>
          )}
          {current && a && (
            <>
              <div className="scene-topline">
                <span>{current.chapter}</span>
                <strong>{current.time}</strong>
              </div>
              <div className="day-progress" aria-hidden="true">
                <span style={{ width: `${current.frac * 100}%` }} />
              </div>
              <h2>{current.title}</h2>
              <p className="moment">{current.narrative}</p>
              <div className="fact-grid">
                <article>
                  <span className="label">The problem we think is real</span>
                  <p>{current.problem}</p>
                </article>
                <article>
                  <span className="label">Why we think this</span>
                  <p>{current.evidence}</p>
                </article>
              </div>
              <div className="outcomes">
                <div>
                  <span className="label">Growth KPI</span>
                  <strong>{current.kpiGrowth}</strong>
                </div>
                <div>
                  <span className="label">Productivity KPI</span>
                  <strong>{current.kpiProd}</strong>
                </div>
              </div>
              <div className="room-question">
                <span className="label">
                  Is this real? Is it worth solving?
                </span>
                <h3>{current.question}</h3>
                <textarea
                  aria-label="What did the room actually say?"
                  placeholder="What did the room actually say?"
                  value={a.note}
                  onChange={(e) => update(current.id, { note: e.target.value })}
                />
              </div>
              <div className="dependency-row">
                <div>
                  <span className="label">Can this move now?</span>
                  <p>Before those four decisions are settled?</p>
                  <div className="noregret-buttons">
                    {(["no", "unsure", "yes"] as const).map((v) => (
                      <button
                        key={v}
                        aria-pressed={a.noRegret === v}
                        className={a.noRegret === v ? `selected ${v}` : ""}
                        onClick={() => update(current.id, { noRegret: v })}
                      >
                        {status(v)}
                      </button>
                    ))}
                  </div>
                </div>
                <p>
                  <b>Depends on:</b> {current.dependsOn}
                </p>
              </div>
              <p className="rubric-note">
                Score each one on what you actually know today — guess low on
                “how sure are we” if you’re not certain, rather than assuming
                the problem is real.
              </p>
              <div className="ratings-grid">
                {axes.map((axis) => (
                  <fieldset className="rating" key={axis.key} disabled={a.veto}>
                    <legend>
                      {axis.key[0].toUpperCase() + axis.key.slice(1)}
                    </legend>
                    <div className="rating-copy">
                      <strong>{axis.label}</strong>
                      <small>{axis.hint}</small>
                    </div>
                    <div className="rating-buttons">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          aria-label={`${axis.key}: ${n} of 5`}
                          aria-pressed={a[axis.key] === n}
                          className={a[axis.key] === n ? "selected" : ""}
                          onClick={() => update(current.id, { [axis.key]: n })}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <div className="anchors">
                      <span>{axis.lo}</span>
                      <span>{axis.hi}</span>
                    </div>
                  </fieldset>
                ))}
              </div>
              <div className="composite">
                <div>
                  <strong>Composite score</strong>
                  <p>Combines all four — a weak one pulls it down</p>
                </div>
                <strong>
                  {a.veto ? "Ruled out" : composite(a).toFixed(1)}
                </strong>
              </div>
              <label className="veto">
                <input
                  type="checkbox"
                  checked={a.veto}
                  onChange={(e) =>
                    update(current.id, { veto: e.target.checked })
                  }
                />{" "}
                We don’t actually have this problem — rule it out
              </label>
              <div className="proof-block">
                <label className="label" htmlFor="proof">
                  What should we prove first?
                </label>
                <textarea
                  id="proof"
                  value={a.proofText}
                  onChange={(e) =>
                    update(current.id, { proofText: e.target.value })
                  }
                />
              </div>
            </>
          )}
          {step === 9 && (
            <div className="recap">
              <div className="eyebrow">End of day</div>
              <h2>Where the room landed.</h2>
              <p>
                Ranked by how often it happens, how much it costs, how sure we
                are, and how much it matters — combined so a weak link pulls the
                score down. This is the candidate priority list for the midday
                readout, not something we asserted going in.
              </p>
              <p className="rubric-note">
                Undiscussed stops retain the original default score of 3 and
                suggested move-now status. Review these with the room before
                treating the list as agreement. Ties retain day order.
              </p>
              <div className="recap-actions">
                <button onClick={() => window.print()}>Print / save PDF</button>
                <button onClick={download}>Export workshop notes</button>
              </div>
              <h3 className="section-title">Priority ranking</h3>
              {!ranked.length && <p>All seven problems have been ruled out.</p>}
              {ranked.map((s, i) => (
                <article className="priority-card" key={s.id}>
                  <div className="rank">{i + 1}</div>
                  <div className="priority-main">
                    <button
                      className="text-button"
                      onClick={() => go(useCases.indexOf(s) + 2)}
                    >
                      {s.title}
                    </button>
                    <p>{s.kpiGrowth}</p>
                    <small>
                      F{state[s.id].frequency} · S{state[s.id].severity} · E
                      {state[s.id].evidence} · L{state[s.id].leverage} ·{" "}
                      {state[s.id].discussed
                        ? "Discussed"
                        : "Not discussed — defaults"}
                    </small>
                  </div>
                  <div className="scorebox">
                    <strong>{composite(state[s.id]).toFixed(1)}</strong>
                    <small>of 5</small>
                  </div>
                </article>
              ))}
              <h3 className="section-title">
                Ruled out — “we don’t actually have this problem”
              </h3>
              {!vetoed.length ? (
                <p>Nothing ruled out yet.</p>
              ) : (
                vetoed.map((s) => (
                  <p key={s.id}>
                    <b>{s.title}</b>
                    {state[s.id].note && ` — “${state[s.id].note}”`}
                  </p>
                ))
              )}
              <h3 className="section-title">
                Can move now, before the four decisions are settled?
              </h3>
              <div className="nr-grid">
                {(["yes", "unsure", "no"] as const).map((v) => (
                  <article className="side-card" key={v}>
                    <h3>{status(v)}</h3>
                    {ranked.filter((s) => state[s.id].noRegret === v).length ===
                      0 && <p>None</p>}
                    {ranked
                      .filter((s) => state[s.id].noRegret === v)
                      .map((s) => (
                        <div key={s.id}>
                          <h4>{s.title}</h4>
                          <p>{s.dependsOn}</p>
                        </div>
                      ))}
                  </article>
                ))}
              </div>
              <h3 className="section-title">
                The productivity story, for the top-ranked stops
              </h3>
              {!ranked.length && <p>No active problems to prioritize.</p>}
              {ranked.slice(0, 3).map((s) => (
                <article className="readout-card" key={s.id}>
                  <h3>{s.title}</h3>
                  <dl>
                    <div>
                      <dt>Growth KPI</dt>
                      <dd>{s.kpiGrowth}</dd>
                    </div>
                    <div>
                      <dt>Productivity KPI</dt>
                      <dd>{s.kpiProd}</dd>
                    </div>
                    <div>
                      <dt>Prove first</dt>
                      <dd>{state[s.id].proofText}</dd>
                    </div>
                  </dl>
                  {state[s.id].note && (
                    <blockquote>{state[s.id].note}</blockquote>
                  )}
                </article>
              ))}
              <div className="handoff">
                <span className="label">Handoff into agenda item 2</span>
                <h3>These are the use cases worth solving first.</h3>
                <p>Now, what already exists to support them?</p>
              </div>
            </div>
          )}
          <nav className="scene-nav" aria-label="Workshop navigation">
            <button disabled={step === 0} onClick={() => go(step - 1)}>
              Previous
            </button>
            <span>{step + 1} / 10</span>
            {step < 9 && (
              <button
                className="primary"
                disabled={!loaded}
                onClick={() => {
                  if (current) update(current.id, {});
                  go(step + 1);
                }}
              >
                {step === 0
                  ? "See what we heard →"
                  : step === 1
                    ? "Start the day →"
                    : step === 8
                      ? "End-of-day recap →"
                      : "Next →"}
              </button>
            )}
          </nav>
        </section>
      </div>
      <footer>
        <span>
          Working artifact ·{" "}
          {storageError
            ? "Export to keep your notes"
            : "Notes saved in this browser"}{" "}
          · Architecture decisions remain context
        </span>
        <button
          onClick={() => {
            if (confirm("Reset all workshop scores and notes?")) {
              setState(defaults());
              go(0);
            }
          }}
        >
          Reset session
        </button>
      </footer>
    </main>
  );
}
