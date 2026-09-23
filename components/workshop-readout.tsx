import { useState, type Dispatch, type SetStateAction } from "react";
import { type Session } from "../lib/workshop";
import { closingSummary, closingItems } from "../lib/closing-summary";
import ArchitectureOutput from "./architecture-output";
import { architectureComponentProfiles } from "./architecture-output";
import WorkshopRecord from "./workshop-record";
import { Badge, Field } from "./workshop-fields";
import SaveFooter from "./save-footer";
import { useCaseCandidates } from "../lib/use-case-candidates";
const clientPriorityCaseIds = ["s10", "s2", "s1", "s3", "s4"];
const architectureComponentOrder = ["H", "A", "K", "D", "L", "J", "B", "C", "I", "E", "F", "G"];
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
  const cases = useCaseCandidates.filter((candidate) =>
      clientPriorityCaseIds.includes(candidate.id),
    ),
    summary = closingSummary(session);
  const items = closingItems(session);
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
        <h1>Architecture first. Five priorities to carry forward.</h1>
        {!room && (
          <button className="readout-pdf-button" onClick={() => window.print()}>
            Download readout PDF
          </button>
        )}
      </div>
      <section className="closing-section">
        <div className="card-heading">
          <h2>01 · Proposed workflow architecture</h2>
        </div>
        <ArchitectureOutput
          session={session}
          compact
          explorerCases={cases.map((useCase) => ({
            id: useCase.id,
            label: useCase.title,
          }))}
          download={!room}
          setSession={room ? undefined : setSession}
        />
      </section>
      <section className="closing-section architecture-component-reference">
        <div className="card-heading">
          <h2>02 · Architecture component reference</h2>
          <Badge value="Proposed roles" />
        </div>
        <div className="architecture-component-summary">
          {architectureComponentOrder.map((id) => {
            const component = architectureComponentProfiles[id];
            return <article key={id}>
              <h3>{component.title}</h3>
              <p>{component.role}</p>
              <ul>{component.capabilities.map((capability) => <li key={capability}>{capability}</li>)}</ul>
            </article>;
          })}
        </div>
      </section>
      <section className="closing-section">
        <div className="card-heading">
          <h2>03 · Five priority use cases</h2>
          <Badge value="Agreed priority set" />
        </div>
        <div className="outcome-priorities">
          {cases.map((u, i) => (
            <article className="outcome-priority" key={u.id}>
              <span className="eyebrow">{i + 1}</span>
              <h3>{u.title}</h3>
              <p>{u.short}</p>
              <div className="priority-usecase-details">
                <span className="eyebrow">Key uses</span>
                <ul>{u.subUseCases.map((useCase) => <li key={useCase}>{useCase}</li>)}</ul>
              </div>
              <dl>
                <div>
                  <dt>What we need to prove</dt>
                  <dd>{session.assessments[u.id]?.proofText || "Still to agree."}</dd>
                </div>
              </dl>
              <Badge
                value={
                  session.assessments[u.id]?.noRegret === "yes"
                    ? "Can move now"
                    : session.assessments[u.id]?.noRegret === "no"
                      ? "Cannot move now"
                      : "Readiness to confirm"
                }
              />
            </article>
          ))}
        </div>
      </section>
      <section className="closing-section">
        <div className="card-heading">
          <h2>04 · Decisions & dependencies</h2>
          {!room && setSession && (
            <button onClick={() => navigate("edit")}>
              Edit closing summary
            </button>
          )}
        </div>
        <div className="closing-decision-list">
          {items.length ? (
            items.map((item) => (
              <article key={item.id}>
                <div>
                  <Badge value={item.status} />
                  <span className="muted">{item.scope}</span>
                </div>
                <h3>{item.title}</h3>
                {item.detail && <p className="preserve-lines">{item.detail}</p>}
                <p className="muted">
                  {item.owner ? `Owner: ${item.owner}` : "Owner to agree"}
                  {item.due ? ` · ${item.due}` : ""}
                </p>
              </article>
            ))
          ) : (
            <p>
              No decisions captured yet. Capture the decisions and dependencies
              before closing.
            </p>
          )}
        </div>
        <h3>What we take to Colin</h3>
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
