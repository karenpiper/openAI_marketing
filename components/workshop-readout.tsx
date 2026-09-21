import { useState, type Dispatch, type SetStateAction } from "react";
import { type Session, activeCases, selectionConfirmed } from "../lib/workshop";
import { closingSummary } from "../lib/closing-summary";
import ArchitectureOutput from "./architecture-output";
import WorkshopRecord from "./workshop-record";
import { Badge, Field } from "./workshop-fields";
import SaveFooter from "./save-footer";
const labels = {
  ownership: "Ownership boundaries",
  sequence: "Proposed sequence of work",
  open: "Open decisions & dependencies",
  colin: "Decisions or sponsorship needed from Colin",
};
export default function WorkshopReadout({
  session,
  setSession,
  room = false,
}: {
  session: Session;
  setSession?: Dispatch<SetStateAction<Session>>;
  room?: boolean;
}) {
  const [view, setView] = useState<"outcomes" | "record" | "edit">("outcomes");
  const cases = activeCases(session),
    summary = closingSummary(session);
  const navigate = (next: typeof view) => {
    setView(next);
    window.scrollTo({ top: 0 });
  };
  if (view !== "outcomes" && !room)
    return (
      <>
        <button onClick={() => navigate("outcomes")}>
          ← Back to workshop outcomes
        </button>
        {view === "record" ? (
          <WorkshopRecord session={session} setSession={setSession} />
        ) : (
          <section className="capture-card">
            <h1>Prepare the midday readout</h1>
            <p>
              Keep each answer to three short points. This is the room’s closing
              summary; the detailed notes stay in the workshop record.
            </p>
            {(Object.keys(labels) as (keyof typeof labels)[]).map((key) => (
              <Field
                key={key}
                label={labels[key]}
                multiline
                value={session.closing[key] || summary[key]}
                onChange={(value) =>
                  setSession?.((s) => ({
                    ...s,
                    closing: { ...s.closing, [key]: value },
                  }))
                }
              />
            ))}
            <SaveFooter />
            <button onClick={() => navigate("outcomes")}>
              Return to the readout →
            </button>
          </section>
        )}
      </>
    );
  return (
    <section className="module-panel outcomes-readout closing-readout">
      <div className="module-heading">
        <span className="eyebrow">
          04 · Decisions, sequencing & Colin readout · 15 min
        </span>
        <h1>Three outputs for the midday readout.</h1>
      </div>
      <section className="closing-section">
        <div className="card-heading">
          <h2>
            01 ·{" "}
            {cases.length === 3
              ? "Three priority use cases"
              : `${cases.length} priority use cases`}
          </h2>
          <Badge
            value={
              selectionConfirmed(session)
                ? "Agreed working set"
                : "Working set needs agreement"
            }
          />
        </div>
        {cases.length !== 3 && (
          <p>Agree three use cases in step 1 before closing.</p>
        )}
        <div className="outcome-priorities">
          {cases.map((u, i) => (
            <article className="outcome-priority" key={u.id}>
              <span className="eyebrow">{i + 1}</span>
              <h3>{u.label}</h3>
              <dl>
                <div>
                  <dt>What we need to prove</dt>
                  <dd>
                    {session.assessments[u.id].proofText || "Still to agree."}
                  </dd>
                </div>
              </dl>
              <Badge
                value={
                  session.assessments[u.id].noRegret === "yes"
                    ? "Can move now"
                    : session.assessments[u.id].noRegret === "no"
                      ? "Cannot move now"
                      : "Readiness to confirm"
                }
              />
            </article>
          ))}
        </div>
      </section>
      <section className="closing-section closing-architecture">
        <div>
          <span className="eyebrow">02 · Working architecture</span>
          <ArchitectureOutput session={session} compact download={!room} />
        </div>
        <aside>
          <h3>Ownership boundaries</h3>
          <p className="preserve-lines">{summary.ownership}</p>
          <p className="muted">
            Baseline proposal with session annotations. Detailed changes and
            unresolved boundaries are in the architecture PDF.
          </p>
        </aside>
      </section>
      <section className="closing-section">
        <div className="card-heading">
          <h2>03 · What we take to Colin</h2>
          {!room && setSession && (
            <button onClick={() => navigate("edit")}>
              Edit closing summary
            </button>
          )}
        </div>
        <div className="closing-asks">
          {(["sequence", "open", "colin"] as const).map((key) => (
            <article key={key}>
              <h3>{key === "colin" ? "Ask for Colin" : labels[key]}</h3>
              <p className="preserve-lines">{summary[key]}</p>
            </article>
          ))}
        </div>
      </section>
      {!room && (
        <footer className="outcome-record-link">
          <button onClick={() => navigate("record")}>
            Open full workshop record
          </button>
        </footer>
      )}
    </section>
  );
}
