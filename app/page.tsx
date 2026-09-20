"use client";

import { useEffect, useMemo, useState } from "react";
import { useCases, type NoRegret, type UseCase } from "../lib/workshop-data";

type Assessment = {
  real: "yes" | "partly" | "no" | "unset";
  outcome: number;
  productivity: number;
  proof: number;
  noRegret: NoRegret;
  proofText: string;
  note: string;
};

type StateMap = Record<string, Assessment>;

const STORAGE_KEY = "oai-adobe-priority-workshop-v1";

const defaultAssessment = (u: UseCase): Assessment => ({
  real: "unset",
  outcome: 3,
  productivity: 3,
  proof: 3,
  noRegret: u.noRegret,
  proofText: u.proofPrompt,
  note: ""
});

function confidenceLabel(c: UseCase["confidence"]) {
  return c === "confirmed" ? "Confirmed" : c === "hypothesis" ? "Hypothesis" : "Open question";
}

function composite(a: Assessment) {
  const reality = a.real === "yes" ? 1 : a.real === "partly" ? 0.82 : a.real === "no" ? 0.35 : 0.72;
  return ((a.outcome + a.productivity + a.proof) / 3) * reality;
}

export default function Home() {
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<"walk" | "prioritize" | "readout">("walk");
  const [state, setState] = useState<StateMap>(() => Object.fromEntries(useCases.map(u => [u.id, defaultAssessment(u)])));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setState(prev => ({ ...prev, ...JSON.parse(saved) }));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state, loaded]);

  const ranked = useMemo(() => [...useCases].sort((a, b) => composite(state[b.id]) - composite(state[a.id])), [state]);
  const current = useCases[active];
  const currentAssessment = state[current.id];

  function update(id: string, patch: Partial<Assessment>) {
    setState(s => ({ ...s, [id]: { ...s[id], ...patch } }));
  }

  function reset() {
    if (!window.confirm("Reset all workshop inputs?")) return;
    setState(Object.fromEntries(useCases.map(u => [u.id, defaultAssessment(u)])));
    setActive(0);
    setMode("walk");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">OpenAI × Adobe × Code and Theory</div>
          <h1>What should we prove first?</h1>
          <p className="lede">Priority use cases and outcomes. 30 minutes.</p>
        </div>
        <div className="mode-tabs" aria-label="Workshop mode">
          <button className={mode === "walk" ? "active" : ""} onClick={() => setMode("walk")}>Walk the day</button>
          <button className={mode === "prioritize" ? "active" : ""} onClick={() => setMode("prioritize")}>Prioritize</button>
          <button className={mode === "readout" ? "active" : ""} onClick={() => setMode("readout")}>Readout</button>
        </div>
      </header>

      {mode === "walk" && (
        <div className="workshop-grid">
          <aside className="rail" aria-label="Candidate use cases">
            <div className="rail-intro">A working hypothesis of the day. Correct it as we go.</div>
            {useCases.map((u, i) => {
              const a = state[u.id];
              return (
                <button key={u.id} className={`rail-item ${i === active ? "active" : ""}`} onClick={() => setActive(i)}>
                  <span className="rail-time">{u.time}</span>
                  <span className="rail-copy"><strong>{u.short}</strong><small>{a.real === "unset" ? "Not discussed" : a.real === "yes" ? "Confirmed problem" : a.real === "partly" ? "Needs correction" : "Not a problem"}</small></span>
                  <span className={`status-dot ${a.real}`} aria-hidden="true" />
                </button>
              );
            })}
          </aside>

          <section className="scene-panel">
            <div className="scene-topline">
              <span>{current.time}</span>
              <span className={`confidence ${current.confidence}`}>{confidenceLabel(current.confidence)}</span>
            </div>
            <h2>{current.title}</h2>
            <p className="moment">{current.dayMoment}</p>

            <div className="fact-grid">
              <article>
                <span className="label">Problem we are testing</span>
                <p>{current.problem}</p>
              </article>
              <article>
                <span className="label">What supports it</span>
                <p>{current.evidence}</p>
              </article>
            </div>

            <div className="room-question">
              <span className="label">Ask the room</span>
              <h3>{current.question}</h3>
              <div className="segmented" aria-label="Is this a real problem?">
                {(["yes", "partly", "no"] as const).map(v => <button key={v} className={currentAssessment.real === v ? "selected" : ""} onClick={() => update(current.id, { real: v })}>{v === "yes" ? "Yes" : v === "partly" ? "Partly" : "No"}</button>)}
              </div>
              <textarea aria-label="Room notes and corrections" value={currentAssessment.note} onChange={e => update(current.id, { note: e.target.value })} placeholder="Capture the correction, nuance, or current workflow in their words…" />
            </div>

            <div className="outcomes">
              <div><span className="label">Growth outcome</span><strong>{current.growthOutcome}</strong></div>
              <div><span className="label">Productivity outcome</span><strong>{current.productivityOutcome}</strong></div>
            </div>

            <div className="proof-block">
              <div className="proof-heading">
                <div><span className="label">What should be proven first?</span><h3>{currentAssessment.proofText}</h3></div>
              </div>
              <textarea className="proof-edit" value={currentAssessment.proofText} onChange={e => update(current.id, { proofText: e.target.value })} aria-label="Edit proof statement" />
            </div>

            <div className="ratings-grid">
              <Rating label="Outcome value" hint="If solved, how much does it matter?" value={currentAssessment.outcome} onChange={v => update(current.id, { outcome: v })} />
              <Rating label="Productivity value" hint="Does it change marketer or seller output?" value={currentAssessment.productivity} onChange={v => update(current.id, { productivity: v })} />
              <Rating label="Proof value" hint="Will proving this teach us something important?" value={currentAssessment.proof} onChange={v => update(current.id, { proof: v })} />
            </div>

            <div className="dependency-row">
              <div><span className="label">Can this move now?</span><div className="noregret-buttons">{(["yes","unsure","no"] as const).map(v => <button key={v} className={currentAssessment.noRegret === v ? `selected ${v}` : ""} onClick={() => update(current.id, { noRegret: v })}>{v === "yes" ? "Yes" : v === "unsure" ? "Not sure" : "No"}</button>)}</div></div>
              <p>{current.dependency}</p>
            </div>

            <div className="scene-nav">
              <button disabled={active === 0} onClick={() => setActive(a => Math.max(0, a - 1))}>Previous</button>
              <span>{active + 1} / {useCases.length}</span>
              {active < useCases.length - 1 ? <button className="primary" onClick={() => setActive(a => Math.min(useCases.length - 1, a + 1))}>Next use case</button> : <button className="primary" onClick={() => setMode("prioritize")}>Prioritize together</button>}
            </div>
          </section>
        </div>
      )}

      {mode === "prioritize" && (
        <section className="priority-view">
          <div className="section-head">
            <div><span className="eyebrow">The shortlist</span><h2>Which problems earn the right to go first?</h2><p>Scores are a conversation aid, not an answer. Drag-free by design: change the three inputs and the order updates.</p></div>
            <button className="primary" onClick={() => setMode("readout")}>Create readout</button>
          </div>
          <div className="priority-list">
            {ranked.map((u, i) => {
              const a = state[u.id];
              return (
                <article className="priority-card" key={u.id}>
                  <div className="rank">{i + 1}</div>
                  <div className="priority-main"><span className="tiny">{u.time} · {confidenceLabel(u.confidence)}</span><h3>{u.title}</h3><p>{u.problem}</p><div className="chip-row"><span>Growth: {u.growthOutcome}</span><span>Productivity: {u.productivityOutcome}</span></div></div>
                  <div className="scorebox"><strong>{composite(a).toFixed(1)}</strong><small>discussion score</small><span className={`move-tag ${a.noRegret}`}>{a.noRegret === "yes" ? "Can move now" : a.noRegret === "no" ? "Needs decision" : "Check dependency"}</span></div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {mode === "readout" && (
        <section className="readout-view">
          <div className="section-head"><div><span className="eyebrow">End of agenda item 1</span><h2>What we agreed to prove first</h2><p>This is the handoff into current-state architecture and capability reuse.</p></div><button onClick={() => window.print()}>Print / save PDF</button></div>
          <div className="readout-grid">
            <div className="readout-main">
              {ranked.slice(0, 3).map((u, i) => {
                const a = state[u.id];
                return <article className="readout-card" key={u.id}><span className="readout-rank">Priority {i + 1}</span><h3>{u.title}</h3><p>{u.problem}</p><dl><div><dt>Growth outcome</dt><dd>{u.growthOutcome}</dd></div><div><dt>Productivity outcome</dt><dd>{u.productivityOutcome}</dd></div><div><dt>Prove first</dt><dd>{a.proofText}</dd></div></dl>{a.note && <blockquote>Room note: {a.note}</blockquote>}</article>;
              })}
            </div>
            <aside className="readout-side">
              <div className="side-card"><span className="label">Can move now</span>{ranked.filter(u => state[u.id].noRegret === "yes").map(u => <p key={u.id}>{u.title}</p>)}</div>
              <div className="side-card"><span className="label">Needs a dependency check</span>{ranked.filter(u => state[u.id].noRegret !== "yes").map(u => <p key={u.id}>{u.title}</p>)}</div>
              <div className="handoff"><span className="label">Next conversation</span><h3>What already exists to support these?</h3><p>Move into current-state architecture and capability reuse using the prioritized use cases as the lens.</p></div>
            </aside>
          </div>
        </section>
      )}

      <footer><span>Working artifact. Assumptions are meant to be corrected in the room.</span><button onClick={reset}>Reset session</button></footer>
    </main>
  );
}

function Rating({ label, hint, value, onChange }: { label: string; hint: string; value: number; onChange: (v: number) => void }) {
  return <div className="rating"><div className="rating-copy"><strong>{label}</strong><small>{hint}</small></div><div className="rating-buttons">{[1,2,3,4,5].map(n => <button key={n} className={value === n ? "selected" : ""} onClick={() => onChange(n)} aria-label={`${label}: ${n} of 5`}>{n}</button>)}</div></div>;
}
