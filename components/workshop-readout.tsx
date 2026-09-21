import { useState, type Dispatch, type SetStateAction } from "react";
import { type Session, activeCases, selectionConfirmed } from "../lib/workshop";
import ArchitectureOutput from "./architecture-output";
import WorkshopRecord from "./workshop-record";
import { Badge } from "./workshop-fields";

export default function WorkshopReadout({
  session,
  setSession,
  room = false,
}: {
  session: Session;
  setSession?: Dispatch<SetStateAction<Session>>;
  room?: boolean;
}) {
  const [record, setRecord] = useState(false);
  const cases = activeCases(session);
  if (record && !room)
    return (
      <>
        <button
          onClick={() => {
            setRecord(false);
            window.scrollTo({ top: 0 });
          }}
        >
          ← Back to workshop outcomes
        </button>
        <WorkshopRecord session={session} setSession={setSession} />
      </>
    );
  return (
    <section className="module-panel outcomes-readout">
      <div className="module-heading">
        <span className="eyebrow">04 · Workshop outcomes</span>
        <h1>Here’s where we landed.</h1>
        <p>Our priority use cases and the architecture to support them.</p>
      </div>
      <nav className="outcome-nav" aria-label="Workshop outcomes">
        <a href="#priority-outcomes">01 · Priority use cases</a>
        <a href="#architecture-outcome">02 · Proposed architecture</a>
      </nav>
      <section id="priority-outcomes">
        <div className="card-heading">
          <h2>
            {cases.length === 3
              ? "Three priority use cases"
              : `${cases.length} priority use cases`}
          </h2>
          <Badge
            value={
              selectionConfirmed(session)
                ? "Working set confirmed"
                : "Working set needs confirmation"
            }
          />
        </div>
        {cases.length !== 3 && (
          <p className="muted">
            The workshop aims to land on three.{" "}
            {cases.length === 0
              ? "Choose the working set in step 1 to populate this readout."
              : "Review the working set in step 1 before closing."}
          </p>
        )}
        <div className="outcome-priorities">
          {cases.map((u, i) => (
            <article className="outcome-priority" key={u.id}>
              <span className="eyebrow">Priority {i + 1}</span>
              <h3>{u.label}</h3>
              <Badge
                value={
                  session.assessments[u.id].noRegret === "yes"
                    ? "Can move now"
                    : session.assessments[u.id].noRegret === "no"
                      ? "Cannot move now"
                      : "Readiness not sure"
                }
              />
              <dl>
                <dt>Growth outcome</dt>
                <dd>{u.kpiGrowth}</dd>
                <dt>Productivity outcome</dt>
                <dd>{u.kpiProd}</dd>
                <dt>What we need to prove</dt>
                <dd>{session.assessments[u.id].proofText || "To be agreed"}</dd>
              </dl>
            </article>
          ))}
        </div>
      </section>
      <section id="architecture-outcome">
        <ArchitectureOutput session={session} compact download={!room} />
      </section>
      {!room && (
        <footer className="outcome-record-link">
          <p>
            Supporting evidence, shared decisions and follow-up actions are kept
            in the full workshop record.
          </p>
          <button
            onClick={() => {
              setRecord(true);
              window.scrollTo({ top: 0 });
            }}
          >
            Open full workshop record
          </button>
        </footer>
      )}
    </section>
  );
}
