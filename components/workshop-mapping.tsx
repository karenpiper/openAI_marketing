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
        a capability or design a system. The implementation team can translate
        these answers afterward and check its interpretation with you.
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
            <Field
              label="Which tools are involved, and what does each do?"
              multiline
              placeholder={
                "One tool per line is fine. For example:\nCRM — account and contact records\nWarehouse — activity history\nIdentity service — connects people across touchpoints"
              }
              value={a?.system || ""}
              onChange={(system) =>
                setSession((p) => editAnswer(p, s.focus, q, { system }))
              }
            />
            <Field
              label="Who is involved / can verify this?"
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
        </>
      ) : (
        <>
          <h2>Have we captured this correctly?</h2>
          <CurrentReadback session={s} />
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
  const [details, setDetails] = useState(false);
  const step = s.guide.architecture;
  const q = architectureQuestions[step];
  const layer = q?.layer === "primary" ? primaryLayer(s.focus) : q?.layer;
  const b = s.boundaries.find(
    (b) => b.useCase === s.focus && b.layer === layer,
  );
  const h = primaryHandoff(s, s.focus);
  const edit = (patch: Partial<Boundary>) =>
    setSession((p) => editBoundary(p, s.focus, layer!, patch));
  const change = (architecture: number) =>
    setSession((p) => ({ ...p, guide: { ...p.guide, architecture } }));
  const decision = (id: string, patch: Partial<Decision>) =>
    setSession((p) => ({
      ...p,
      decisions: p.decisions.map((d) =>
        d.id === id
          ? {
              ...d,
              ...patch,
              ...(!("status" in patch) ? { status: "Proposed" as const } : {}),
            }
          : d,
      ),
    }));
  return (
    <section className="module-panel guided-panel">
      <div className="module-heading">
        <span className="eyebrow">03 · How it should work · 45 minutes</span>
        <h1>Design the next way of working.</h1>
        <p>
          Step 2 captured today. Now decide what should happen, who is
          responsible, and what needs a decision. Work through one question at a
          time.
        </p>
      </div>
      <CaseFocus session={s} setSession={setSession} />
      <Navigation step={step} total={5} change={change} />
      {q ? (
        <>
          <div className="question-banner">
            <span className="label">Proposed way of working · {q.label}</span>
            <h2>{q.question}</h2>
            <p>{q.hint}</p>
          </div>
          <details className="starting-context">
            <summary>Refer to the answers from step 2</summary>
            <CurrentReadback session={s} />
          </details>
          {step < 3 ? (
            <div className="capture-card">
              <Field
                multiline
                label={
                  step === 0
                    ? "Where should the marketer start?"
                    : step === 1
                      ? "Which tools supply the information, and what does each provide?"
                      : "Which tools should do the work, and what does each do?"
                }
                value={b?.system || ""}
                onChange={(system) => edit({ system })}
              />
              {step === 1 && (
                <Field
                  multiline
                  label="Which source should we trust for each type of information?"
                  value={b?.truth || ""}
                  onChange={(truth) => edit({ truth })}
                />
              )}
              <Field
                label={
                  step === 1
                    ? "Who maintains this information?"
                    : "Who is accountable for this part?"
                }
                value={b?.owner || ""}
                onChange={(owner) => edit({ owner })}
              />
              {step === 2 && (
                <Field
                  label="Who builds or connects it?"
                  value={b?.implementer || ""}
                  onChange={(implementer) => edit({ implementer })}
                />
              )}
              <details>
                <summary>Capture more detail (optional)</summary>
                {step !== 1 && (
                  <Field
                    label="Which source should we trust?"
                    value={b?.truth || ""}
                    onChange={(truth) => edit({ truth })}
                  />
                )}
                <Field
                  label="Where are progress and decisions saved?"
                  multiline
                  value={b?.state || ""}
                  onChange={(state) => edit({ state })}
                />
                <Field
                  label="Who can approve, change or stop the work?"
                  multiline
                  value={b?.control || ""}
                  onChange={(control) => edit({ control })}
                />
              </details>
              <Agreement
                value={b?.status || "Unknown"}
                ready={!!b?.system.trim() && !!b?.owner.trim()}
                onChange={(status) => edit({ status })}
              />
            </div>
          ) : step === 3 ? (
            <div className="capture-card">
              {(
                [
                  ["payload", "What is passed on?"],
                  ["trigger", "When is it ready?"],
                  ["owner", "Who checks it and owns the handoff?"],
                  ["control", "When should a person change or stop it?"],
                ] as const
              ).map(([key, label]) => (
                <Field
                  key={key}
                  label={label}
                  multiline
                  value={h?.[key] || ""}
                  onChange={(value) =>
                    setSession((p) => editHandoff(p, s.focus, { [key]: value }))
                  }
                />
              ))}
              <Agreement
                value={h?.status || "Unknown"}
                ready={
                  !!h &&
                  [h.payload, h.trigger, h.owner, h.control].every(
                    (v) => !!v.trim(),
                  )
                }
                onChange={(status) =>
                  setSession((p) => editHandoff(p, s.focus, { status }))
                }
              />
            </div>
          ) : (
            <>
              <p>
                Open a question to capture the room’s answer. Workshop-wide
                answers apply across use cases.
              </p>
              {s.decisions
                .filter((d) => !d.useCase || d.useCase === s.focus)
                .map((d) => (
                  <details className="capture-card" key={d.id}>
                    <summary>
                      {d.title} · {agreementLabel(d.status)}
                      {!d.useCase ? " · workshop-wide" : ""}
                    </summary>
                    <Field
                      label="What did the room decide, or what is still unknown?"
                      multiline
                      value={d.answer}
                      onChange={(answer) => decision(d.id, { answer })}
                    />
                    <Field
                      label="Who can resolve it?"
                      value={d.owner}
                      onChange={(owner) => decision(d.id, { owner })}
                    />
                    <Field
                      label="Needed by"
                      value={d.due}
                      onChange={(due) => decision(d.id, { due })}
                    />
                    <Agreement
                      value={d.status}
                      ready={!!d.answer.trim() && !!d.owner.trim()}
                      onChange={(status) => decision(d.id, { status })}
                    />
                  </details>
                ))}
            </>
          )}
        </>
      ) : (
        <>
          <h2>Read back the proposed way of working</h2>
          <ArchitectureReadback session={s} />
          <div className="guide-links">
            <button
              onClick={() =>
                setSession((p) => ({ ...p, architectureTab: "lab" }))
              }
            >
              Try the content exercise →
            </button>
            <button
              onClick={() =>
                setSession((p) => ({
                  ...p,
                  stage: 3,
                  timer: { stage: 3, remaining: 900, runningSince: null },
                }))
              }
            >
              Continue to decisions & readout →
            </button>
          </div>
        </>
      )}
      <details className="reference-details">
        <summary>View the proposed architecture diagram (optional)</summary>
        <p>
          This reference is a starting proposal. The answers above capture what
          the room agrees.
        </p>
        <a href="/workshop-architecture.pdf" target="_blank" rel="noreferrer">
          Open original diagram
        </a>
        <img
          src="/workshop-architecture.png"
          alt="Proposed OpenAI and Adobe architecture"
        />
      </details>
      <button
        className="quiet"
        aria-expanded={details}
        onClick={() => setDetails(!details)}
      >
        {details ? "Hide" : "Open"} detailed architecture editor (optional)
      </button>
      {details && <ArchitectureDetails session={s} setSession={setSession} />}
    </section>
  );
}
