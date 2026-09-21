"use client";
import { type Dispatch, type SetStateAction, type ReactNode } from "react";
import { useCases, axes, type NoRegret } from "../lib/workshop-data";
import {
  composite,
  rank,
  type Assessment,
  type StateMap,
} from "../lib/assessment";

export default function PriorityWorkshop({
  state,
  setState,
  step: storedStep,
  setStep,
  selection,
}: {
  state: StateMap;
  setState: Dispatch<SetStateAction<StateMap>>;
  step: number;
  setStep: (n: number) => void;
  selection: ReactNode;
}) {
  const loaded = true;
  const step = storedStep === 1 ? 0 : storedStep;
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
    "",
    ...useCases.map((s) => s.label),
    "End-of-day recap",
  ];
  const status = (v: NoRegret) =>
    v === "yes" ? "Yes" : v === "no" ? "No" : "Not sure";
  return (
    <main
      className={`priority-module phase-${step < 4 ? "morning" : step < 7 ? "day" : "evening"}`}
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
      <div className="workshop-grid">
        <aside className="rail" aria-label="Morgan’s Tuesday">
          <div className="rail-intro">
            Assumptions, not requirements.
            <br />
            {Object.values(state).filter((a) => a.discussed).length} of 7 stops
            discussed
          </div>
          {labels.map(
            (label, i) =>
              i !== 1 && (
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
              ),
          )}
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
                This is a working hypothesis of Morgan’s Tuesday today. We’ll
                ask you to correct it as we go.
              </p>
              <p className="intro-copy">
                Each stop describes a problem we think the team faces today. The
                scenarios and evidence need your confirmation. We’re not
                solutioning yet. Score whether it’s real and worth solving, or
                tell us it isn’t — that answer matters as much as a high score.
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
          {current && a && (
            <>
              <div className="scene-topline">
                <span>
                  {current.chapter} · {current.label}
                </span>
                <strong>{current.time}</strong>
              </div>
              <div className="day-progress" aria-hidden="true">
                <span style={{ width: `${current.frac * 100}%` }} />
              </div>
              <h2>{current.title}</h2>
              <p className="moment">{current.narrative}</p>
              {current.id === "s2" && (
                <aside className="journey-note">
                  <span className="label">
                    An example to test with the room
                  </span>
                  <p>
                    Morgan can see a cohort worth reaching. Can she connect
                    website visits, content engagement, event participation and
                    sales conversations well enough to understand what different
                    people need next? Someone exploring security may need a
                    different message from someone just discovering a use case.
                  </p>
                </aside>
              )}
              {current.id === "s3" && (
                <aside className="journey-note">
                  <span className="label">Personalized messaging at scale</span>
                  <p>
                    If those audiences need different messages, can Morgan find
                    approved content for each and reuse it across campaigns? The
                    value to test is more relevant outreach to more people,
                    without a separate brief and manual build for every
                    audience.
                  </p>
                </aside>
              )}
              {current.id === "s7" && (
                <aside className="journey-note">
                  <span className="label">Learning across the journey</span>
                  <p>
                    Can Morgan see which audiences move from a first visit or
                    event into deeper engagement and a sales conversation, and
                    where they drop off? Comparing those paths could help her
                    change the next audience or message. The proof is better
                    progression and less time piecing reports together.
                  </p>
                </aside>
              )}
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
                  What do we need to prove?
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
                      {s.label}
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
                    <b>{s.label}</b>
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
                          <h4>{s.label}</h4>
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
                  <h3>{s.label}</h3>
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
              {selection}
              <div className="handoff">
                <span className="label">Handoff into agenda item 2</span>
                <h3>Choose the cases to carry forward.</h3>
                <p>Now, what already exists to support them?</p>
              </div>
            </div>
          )}
          <nav className="scene-nav" aria-label="Workshop navigation">
            <button
              disabled={step === 0}
              onClick={() => go(step === 2 ? 0 : step - 1)}
            >
              Previous
            </button>
            <span>{step === 0 ? 1 : step} / 9</span>
            {step < 9 && (
              <button
                className="primary"
                disabled={!loaded}
                onClick={() => {
                  if (current) update(current.id, {});
                  go(step === 0 ? 2 : step + 1);
                }}
              >
                {step === 0
                  ? "Start the day →"
                  : step === 8
                    ? "End-of-day recap →"
                    : "Next →"}
              </button>
            )}
          </nav>
        </section>
      </div>
    </main>
  );
}
