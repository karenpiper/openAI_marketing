import SaveFooter from "./save-footer";
import ArchitectureWalkthrough from "./architecture-walkthrough";
import LiveSynthesis from "./live-synthesis";
import { useState, type Dispatch, type SetStateAction } from "react";
import {
  type Session,
  type Status,
  type Boundary,
  type Decision,
  activeCases,
} from "../lib/workshop";
import { useCases } from "../lib/workshop-data";
import {
  currentQuestions,
  toolPrompts,
  architectureQuestions,
  findAnswer,
  editAnswer,
  editBoundary,
  editHandoff,
  primaryLayer,
  primaryHandoff,
  agreementLabel,
} from "../lib/workshop-guide";
import { Field, Badge } from "./workshop-fields";
import ArchitectureDetails from "./architecture-details";
type Props = {
  session: Session;
  setSession: Dispatch<SetStateAction<Session>>;
};
export function CaseFocus({ session: s, setSession }: Props) {
  return (
    <div className="case-focus">
      <label htmlFor="case-focus">Use case to discuss</label>
      <select
        id="case-focus"
        value={s.focus}
        onChange={(e) =>
          setSession((p) => ({
            ...p,
            focus: e.target.value,
            guide: { current: 0, architecture: 0 },
          }))
        }
      >
        {useCases.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
            {activeCases(s).some((a) => a.id === c.id) ? " · working set" : ""}
          </option>
        ))}
      </select>
      {!activeCases(s).some((c) => c.id === s.focus) && (
        <small>
          Exploring this case does not add it to the agreed working set.
        </small>
      )}
    </div>
  );
}
function Agreement({
  value,
  onChange,
  ready,
}: {
  value: Status;
  onChange: (s: Status) => void;
  ready: boolean;
}) {
  return (
    <fieldset className="guide-agreement">
      <legend>Does the room agree with this answer?</legend>
      {(["Unknown", "Proposed", "Confirmed", "Disputed"] as Status[]).map(
        (v) => (
          <button
            key={v}
            aria-pressed={value === v}
            disabled={v === "Confirmed" && !ready}
            onClick={() => onChange(v)}
          >
            {agreementLabel(v)}
          </button>
        ),
      )}
    </fieldset>
  );
}
function Navigation({
  step,
  total,
  change,
}: {
  step: number;
  total: number;
  change: (n: number) => void;
}) {
  return (
    <nav className="guide-navigation" aria-label="Discussion questions">
      <button disabled={step === 0} onClick={() => change(step - 1)}>
        ← Previous
      </button>
      <span>
        {step === total
          ? "Read back together"
          : `Question ${step + 1} of ${total}`}
      </span>
      <button disabled={step === total} onClick={() => change(step + 1)}>
        {step === total - 1 ? "Read back answers →" : "Next →"}
      </button>
    </nav>
  );
}
export function CurrentReadback({ session: s }: { session: Session }) {
  return (
    <>
      {currentQuestions[s.focus].map((q) => {
        const a = findAnswer(s, s.focus, q);
        return (
          <article className="capture-card" key={q.id}>
            <h3>{q.question}</h3>
            <Badge value={agreementLabel(a?.status || "Unknown")} />
            <p className="preserve-lines">
              {a?.evidence || "Not captured yet."}
            </p>
            {a?.system && (
              <p className="preserve-lines">
                <b>Tools and their roles</b>
                <br />
                {a.system}
              </p>
            )}
            {a?.owner && (
              <p>
                <b>People:</b> {a.owner}
              </p>
            )}
            {a?.gap && (
              <p className="preserve-lines">
                <b>What works / needs work:</b> {a.gap}
              </p>
            )}
          </article>
        );
      })}
    </>
  );
}
export function CurrentState({ session: s, setSession }: Props) {
  const questions = currentQuestions[s.focus];
  const step = s.guide.current;
  const q = questions[step];
  const a = q ? findAnswer(s, s.focus, q) : undefined;
  const change = (current: number) =>
    setSession((p) => ({ ...p, guide: { ...p.guide, current } }));
  const used = questions.map((q) => findAnswer(s, s.focus, q)?.id);
  const earlier = s.capabilities.filter(
    (c) => c.useCase === s.focus && !used.includes(c.id),
  );
  return (
    <section className="module-panel guided-panel">
      <div className="module-heading">
        <span className="eyebrow">02 · What happens today · 30 minutes</span>
        <h1>How do you handle this today?</h1>
        <p>
          Ask one question, capture the answer, then check it with the room. The
          questions are already provided—you do not need to enter capabilities.
        </p>
      </div>
      <p className="muted">
        Describe a recent example in everyday language. You do not need to name
        a capability or design a system. A suggested capability appears as you
        capture the answer. Check it with the room now.
      </p>
      <CaseFocus session={s} setSession={setSession} />
      <Navigation step={step} total={4} change={change} />
      {q ? (
        <>
          <div className="question-banner">
            <span className="label">Ask the room</span>
            <h2>{q.question}</h2>
            <p>{q.hint}</p>
          </div>
          <div className="capture-card">
            <Field
              label="What happens today?"
              multiline
              value={a?.evidence || ""}
              onChange={(evidence) =>
                setSession((p) => editAnswer(p, s.focus, q, { evidence }))
              }
            />
            <p className="muted">
              Think of the last time you did this. You do not need the full
              system list—one familiar example is enough.
            </p>
            <Field
              label={toolPrompts[s.focus][step]}
              multiline
              placeholder={
                "Start with one place you used recently. A document, email, person or manual process counts. ‘Not sure’ is fine. Add other tools only if you know them."
              }
              value={a?.system || ""}
              onChange={(system) =>
                setSession((p) => editAnswer(p, s.focus, q, { system }))
              }
            />
            <Field
              label="Who helped with that example, or could fill in the gap?"
              value={a?.owner || ""}
              onChange={(owner) =>
                setSession((p) => editAnswer(p, s.focus, q, { owner }))
              }
            />
            <Field
              label="What works, and what is missing?"
              multiline
              value={a?.gap || ""}
              onChange={(gap) =>
                setSession((p) => editAnswer(p, s.focus, q, { gap }))
              }
            />
            <Agreement
              value={a?.status || "Unknown"}
              ready={!!a?.evidence.trim()}
              onChange={(status) =>
                setSession((p) => editAnswer(p, s.focus, q, { status }))
              }
            />
          </div>
          <SaveFooter />
          <LiveSynthesis session={s} setSession={setSession} index={step} />
        </>
      ) : (
        <>
          <h2>Have we captured this correctly?</h2>
          <LiveSynthesis session={s} setSession={setSession} />
          <div className="guide-links">
            {questions.map((q, i) => (
              <button key={q.id} onClick={() => change(i)}>
                Edit {q.label.toLowerCase()}
              </button>
            ))}
          </div>
          <button
            onClick={() =>
              setSession((p) => ({
                ...p,
                stage: 2,
                architectureTab: "map",
                guide: { ...p.guide, architecture: 0 },
                timer: { stage: 2, remaining: 2700, runningSince: null },
              }))
            }
          >
            Use these answers in architecture →
          </button>
        </>
      )}
      {earlier.length > 0 && (
        <details className="starting-context">
          <summary>Earlier notes ({earlier.length})</summary>
          {earlier.map((c) => (
            <article key={c.id}>
              <h3>{c.name}</h3>
              <p className="preserve-lines">
                {c.evidence}
                <br />
                {c.system}
                <br />
                {c.gap}
              </p>
            </article>
          ))}
        </details>
      )}
    </section>
  );
}
export function ArchitectureReadback({ session: s }: { session: Session }) {
  return (
    <>
      {s.boundaries
        .filter((b) => b.useCase === s.focus)
        .map((b) => (
          <article className="capture-card" key={b.id}>
            <h3>
              {b.layer === "surface"
                ? "Where work starts"
                : b.layer === "data"
                  ? "Information we trust"
                  : b.layer === primaryLayer(s.focus)
                    ? "Who does the work"
                    : b.layer}
            </h3>
            <Badge value={agreementLabel(b.status)} />
            <p className="preserve-lines">{b.system || "Tools not decided"}</p>
            <p>{b.owner || "Owner not decided"}</p>
            <p>{b.truth}</p>
            <p>{b.control}</p>
          </article>
        ))}
      {s.handoffs
        .filter((h) => h.useCase === s.focus)
        .map((h) => (
          <article className="capture-card" key={h.id}>
            <h3>Check and pass it on</h3>
            <Badge value={agreementLabel(h.status)} />
            <p>{h.payload}</p>
            <p>
              {h.trigger} · {h.owner}
            </p>
            <p>{h.control}</p>
          </article>
        ))}
      {!s.boundaries.some((b) => b.useCase === s.focus) && (
        <p>No proposed design captured for this case yet.</p>
      )}
      {s.decisions
        .filter(
          (d) =>
            (!d.useCase || d.useCase === s.focus) && d.status !== "Confirmed",
        )
        .map((d) => (
          <p key={d.id}>
            <b>Still open: {d.title}</b> · {d.answer || "No answer yet"} ·{" "}
            {d.owner || "Owner needed"}
          </p>
        ))}
    </>
  );
}
export function Architecture({ session: s, setSession }: Props) {
  return (
    <section className="module-panel guided-panel">
      <div className="module-heading">
        <span className="eyebrow">
          03 · Proposed way of working · 45 minutes
        </span>
        <h1>What should change for this use case?</h1>
      </div>
      <CaseFocus session={s} setSession={setSession} />
      <ArchitectureWalkthrough session={s} setSession={setSession} />
    </section>
  );
}
