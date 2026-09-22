import { currentStory } from "../lib/current-story";
import SaveFooter from "./save-footer";
import { type Dispatch, type SetStateAction } from "react";
import { type Session } from "../lib/workshop";
import {
  workflows,
  workflowState,
  workflowSystems,
  reviewWorkflow,
} from "../lib/architecture-workflow";
import { currentQuestions, findAnswer } from "../lib/workshop-guide";
import { Field, Badge } from "./workshop-fields";

const positions = [
  ["Keep", "Looks right"],
  ["Change", "Needs a change"],
  ["Unresolved", "Open question"],
] as const;
export default function ArchitectureWalkthrough({
  session: s,
  setSession,
  room = false,
}: {
  session: Session;
  setSession?: Dispatch<SetStateAction<Session>>;
  room?: boolean;
}) {
  const editable = !!setSession && !room;
  const steps = workflows[s.focus];
  return (
    <>
      <div className="question-banner">
        <span className="eyebrow">Our architecture proposal · room review</span>
        <h2>What needs to change for this to work here?</h2>
        <p>
          Follow the proposed flow below. The components come from our initial
          architecture thinking; the room can change the approach, name other
          tools or add a missing connection.
        </p>
        <p>
          “Looks right” records agreement on direction. It does not sign off a
          fully specified integration.
        </p>
      </div>
      <p className="muted">
        Arrows between cards show our proposed work sequence. Systems and
        connections remain proposals for discussion.
      </p>
      <ol className="proposal-board">
        {steps.map((step, i) => {
          const { record: r, stale } = workflowState(s, s.focus, i);
          const systems = workflowSystems(s, s.focus, i);
          const update = (patch: Parameters<typeof reviewWorkflow>[3]) =>
            setSession?.((p) => reviewWorkflow(p, s.focus, i, patch));
          return (
            <li key={i} className="proposal-step">
              <div className="card-heading">
                <span className="eyebrow">
                  {i + 1} / {steps.length}
                </span>
                <Badge
                  value={
                    stale
                      ? "Evidence changed · recheck"
                      : positions.find(([v]) => v === r?.choice)?.[1] ||
                        "Proposed"
                  }
                />
              </div>
              <h3>{step.title}</h3>
              <p>{step.proposal}</p>
              <div className="proposal-components">
                <span className="eyebrow">
                  {systems.suggested
                    ? "Proposed components"
                    : "Tools captured by the room"}
                </span>
                {systems.value
                  .split("\n")
                  .filter(Boolean)
                  .map((name, j) => (
                    <span className="proposal-component" key={j}>
                      {name}
                    </span>
                  ))}
              </div>
              <p className="proposal-delivery">
                <b>Passes forward:</b> {step.output}
              </p>
              <div className="proposal-evidence">
                <span className="eyebrow">From today’s workflow</span>
                {s.currentWorkflows[s.focus] ||
                Object.prototype.hasOwnProperty.call(
                  s.currentStories,
                  s.focus,
                ) ? (
                  <p className="preserve-lines">
                    {currentStory(s, s.focus) || "Not captured yet."}
                  </p>
                ) : (
                  step.sources.map((index) => {
                    const q = currentQuestions[s.focus][index];
                    const a = findAnswer(s, s.focus, q);
                    return (
                      <p key={q.id}>
                        <b>{q.label}:</b> {a?.evidence || "Not captured yet."}
                        {a?.system && <span> Tools: {a.system}.</span>}
                      </p>
                    );
                  })
                )}
              </div>
              {editable && (
                <div className="guide-links">
                  {positions.map(([choice, label]) => (
                    <button
                      key={choice}
                      aria-pressed={!stale && r?.choice === choice}
                      onClick={() => update({ choice })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              {(r?.choice === "Change" ||
                r?.choice === "Unresolved" ||
                r?.change) &&
                (editable ? (
                  <div className="proposal-annotation">
                    <Field
                      label={
                        r?.choice === "Unresolved"
                          ? "What do we need to resolve?"
                          : "What should change?"
                      }
                      multiline
                      value={r?.change || ""}
                      placeholder="Name a different tool, adapt the flow or capture the room’s question."
                      onChange={(change) => update({ change })}
                    />
                    <Field
                      label="Who can help? (optional)"
                      value={r?.owner || ""}
                      onChange={(owner) => update({ owner })}
                    />
                  </div>
                ) : (
                  <p className="preserve-lines">
                    <b>Room input:</b> {r?.change || "Note not yet captured."}
                    {r?.owner && ` · Follow-up: ${r.owner}`}
                  </p>
                ))}
              {editable && <SaveFooter />}
              {i < steps.length - 1 && (
                <div
                  className="proposal-arrow"
                  aria-label="Next proposed workflow step"
                >
                  ↓
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <section className="capture-card">
        <span className="eyebrow">Add to the proposal</span>
        <h3>What’s missing from this flow?</h3>
        <p>
          Add a component, connection or responsibility the proposal has missed.
          These additions travel with this use case into the readout and
          architecture PDF.
        </p>
        {s.architectureAdditions
          .filter((a) => a.useCase === s.focus)
          .map((a) => (
            <article className="proposal-annotation" key={a.id}>
              {editable ? (
                <>
                  <Field
                    label="What should we add, and where does it fit?"
                    multiline
                    value={a.note}
                    onChange={(note) =>
                      setSession?.((p) => ({
                        ...p,
                        architectureAdditions: p.architectureAdditions.map(
                          (x) => (x.id === a.id ? { ...x, note } : x),
                        ),
                      }))
                    }
                  />
                  <Field
                    label="Who can help? (optional)"
                    value={a.owner}
                    onChange={(owner) =>
                      setSession?.((p) => ({
                        ...p,
                        architectureAdditions: p.architectureAdditions.map(
                          (x) => (x.id === a.id ? { ...x, owner } : x),
                        ),
                      }))
                    }
                  />
                </>
              ) : (
                <p>
                  {a.note || "Addition not yet described"}
                  {a.owner && ` · Follow-up: ${a.owner}`}
                </p>
              )}
            </article>
          ))}
        {editable && (
          <>
            <button
              onClick={() =>
                setSession?.((p) => ({
                  ...p,
                  architectureAdditions: [
                    ...p.architectureAdditions,
                    {
                      id: crypto.randomUUID(),
                      useCase: s.focus,
                      note: "",
                      owner: "",
                    },
                  ],
                }))
              }
            >
              + Add something missing
            </button>
            <SaveFooter />
          </>
        )}
      </section>
      {editable && (
        <div className="guide-links">
          <button
            onClick={() =>
              setSession?.((p) => ({
                ...p,
                stage: 3,
                timer: { stage: 3, remaining: 900, runningSince: null },
              }))
            }
          >
            Continue to decisions & readout →
          </button>
          <button
            onClick={() =>
              setSession?.((p) => ({ ...p, architectureTab: "lab" }))
            }
          >
            Explore the engagement-at-scale workflow →
          </button>
        </div>
      )}
    </>
  );
}
