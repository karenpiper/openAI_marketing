import { currentWorkflowRows } from "../lib/current-workflow";
import { currentStory } from "../lib/current-story";
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
  return (
    <section className="module-panel guided-panel">
      <div className="module-heading">
        <span className="eyebrow">02 · What happens today · 30 minutes</span>
        <h1>Talk through one recent example.</h1>
        <p>
          For each part of the workflow, name the tools, what they do and how
          work moves to the next person or system. A few phrases are enough.
          Multiple tools and “not sure” are both valid answers.
        </p>
      </div>
      <CaseFocus session={s} setSession={setSession} />
      <CurrentConversation session={s} setSession={setSession} />
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
        Take this into architecture →
      </button>
    </section>
  );
}
export function CurrentConversation({
  session: s,
  setSession,
}: {
  session: Session;
  setSession?: Dispatch<SetStateAction<Session>>;
}) {
  const capture = s.currentWorkflows[s.focus] || { rows: {}, friction: "" };
  const patch = (update: Partial<typeof capture>) =>
    setSession?.((p) => ({
      ...p,
      currentWorkflows: {
        ...p.currentWorkflows,
        [s.focus]: {
          ...(p.currentWorkflows[s.focus] || { rows: {}, friction: "" }),
          ...update,
        },
      },
    }));
  return (
    <section className="current-workflow-capture">
      <p className="muted">
        Examples illustrate the level of detail; they are not assumptions about
        your technology.
      </p>
      <div
        className="current-workflow-table"
        role="table"
        aria-label="Current tools and handoffs"
      >
        <div className="current-workflow-head" role="row">
          <span role="columnheader">Part of today’s workflow</span>
          <span role="columnheader">Tools, roles and handoffs</span>
        </div>
        {currentWorkflowRows[s.focus].map((r, i) => (
          <div className="current-workflow-row" role="row" key={r.label}>
            <div role="cell">
              <h3>
                {i + 1}. {r.label}
              </h3>
              <p>{r.ask}</p>
              <p className="muted">
                <b>Example:</b> {r.example}
              </p>
            </div>
            <div role="cell">
              {setSession ? (
                <Field
                  label={`${r.label} · how it works today`}
                  multiline
                  value={capture.rows[String(i)] || ""}
                  placeholder="Tool → what it does → where the work goes next. ‘Not sure’ is fine."
                  onChange={(value) =>
                    patch({ rows: { ...capture.rows, [String(i)]: value } })
                  }
                />
              ) : (
                <p className="preserve-lines">
                  {capture.rows[String(i)] || "Not captured yet."}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="current-friction">
        {setSession ? (
          <Field
            label="Which handoff causes the most friction?"
            multiline
            value={capture.friction}
            placeholder="Name the delay, rework or manual transfer that matters most."
            onChange={(friction) => patch({ friction })}
          />
        ) : (
          <>
            <h3>Which handoff causes the most friction?</h3>
            <p>{capture.friction || "Not captured yet."}</p>
          </>
        )}
      </div>
      {setSession && <SaveFooter />}
      {s.currentStories[s.focus] && (
        <aside className="capture-card">
          <h3>Earlier discussion notes</h3>
          <p className="muted">
            Kept as reference while you map the tools above.
          </p>
          <p className="preserve-lines">{s.currentStories[s.focus]}</p>
        </aside>
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
export function Architecture({
  session: s,
  setSession,
  agentWorkshop = false,
}: Props & { agentWorkshop?: boolean }) {
  return (
    <section className="module-panel guided-panel">
      <div className="module-heading">
        <span className="eyebrow">
          {agentWorkshop
            ? "Proposed way of working · Adapt with the room"
            : "03 · Proposed way of working · 45 minutes"}
        </span>
        <h1>What should change for this use case?</h1>
      </div>
      <CaseFocus session={s} setSession={setSession} />
      <ArchitectureWalkthrough session={s} setSession={setSession} />
    </section>
  );
}
