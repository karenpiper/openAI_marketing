import { useState, type Dispatch, type SetStateAction } from "react";
import { type Session, type WorkflowReview } from "../lib/workshop";
import {
  workflows,
  workflowState,
  workflowSystems,
  reviewWorkflow,
} from "../lib/architecture-workflow";
import {
  currentQuestions,
  findAnswer,
  agreementLabel,
} from "../lib/workshop-guide";
import { Field, Badge } from "./workshop-fields";
import ArchitectureDetails from "./architecture-details";
export function WorkflowSummary({ session: s }: { session: Session }) {
  return (
    <>
      {workflows[s.focus].map((step, i) => {
        const { record: r, stale } = workflowState(s, s.focus, i);
        const systems = workflowSystems(s, s.focus, i);
        return (
          <article className="capture-card" key={i}>
            <h3>
              {i + 1}. {step.title}
            </h3>
            <Badge
              value={
                stale
                  ? "Evidence changed · recheck"
                  : r?.choice || "Not reviewed"
              }
            />
            <p>{step.proposal}</p>
            {r?.change && (
              <p>
                <b>Room correction:</b> {r.change}
              </p>
            )}
            <p>
              <b>Owner:</b> {r?.owner || "Not assigned"}
            </p>
            <p>
              <b>Next decision or action:</b> {r?.next || "Not captured"}
            </p>
            <p>
              <b>Systems:</b> {systems.value || "Not decided"}
            </p>
            <p>
              <b>Handoff:</b> {r?.handoff || "Not captured"}
            </p>
            <p>
              <b>Review / controls:</b> {r?.controls || "Not captured"}
            </p>
          </article>
        );
      })}
    </>
  );
}
export default function ArchitectureWalkthrough({
  session: s,
  setSession,
  room = false,
}: {
  session: Session;
  setSession?: Dispatch<SetStateAction<Session>>;
  room?: boolean;
}) {
  const [details, setDetails] = useState(false);
  const index = s.guide.architecture;
  const steps = workflows[s.focus];
  const step = steps[index];
  const { record: r, stale } =
    index < 5
      ? workflowState(s, s.focus, index)
      : { record: undefined, stale: false };
  const systems =
    index < 5
      ? workflowSystems(s, s.focus, index)
      : { value: "", suggested: false };
  const update = (patch: Partial<WorkflowReview>) =>
    setSession?.((p) => reviewWorkflow(p, s.focus, index, patch));
  const navigate = (architecture: number) =>
    setSession?.((p) => ({ ...p, guide: { ...p.guide, architecture } }));
  return (
    <>
      <p>
        Walk through the proposed process together. At each stop, compare
        today’s evidence with the proposal and choose Keep, Change or
        Unresolved. This is our suggested way of working. The systems,
        responsibilities and handoffs you agree here will shape the architecture
        we generate at the end.
      </p>
      {!room && (
        <nav className="guide-navigation" aria-label="Proposed workflow">
          <button disabled={index === 0} onClick={() => navigate(index - 1)}>
            ← Previous
          </button>
          <span>
            {index === 5 ? "Read back the workflow" : `Step ${index + 1} of 5`}
          </span>
          <button disabled={index === 5} onClick={() => navigate(index + 1)}>
            {index === 4 ? "Read back together →" : "Next →"}
          </button>
        </nav>
      )}
      {step ? (
        <>
          <div className="question-banner">
            <span className="eyebrow">Proposed workflow · {index + 1} / 5</span>
            <h2>{step.title}</h2>
            <p>{step.proposal}</p>
            <h3>{step.ask}</h3>
          </div>
          <div className="workflow-comparison">
            <article className="capture-card">
              <span className="eyebrow">What we learned in step 2</span>
              {step.sources.map((i) => {
                const q = currentQuestions[s.focus][i];
                const a = findAnswer(s, s.focus, q);
                return (
                  <div key={q.id}>
                    <h3>{q.label}</h3>
                    <Badge value={agreementLabel(a?.status || "Unknown")} />
                    <p className="preserve-lines">
                      {a?.evidence ||
                        "Not captured. Ask for a recent example; do not assume this exists."}
                    </p>
                    {a?.system && (
                      <p className="preserve-lines">
                        <b>Tools mentioned:</b> {a.system}
                      </p>
                    )}
                    {a?.gap && (
                      <p>
                        <b>What needs work:</b> {a.gap}
                      </p>
                    )}
                    {a?.synthesis && (
                      <p>
                        <b>Capability discussed:</b> {a.synthesis.name}
                      </p>
                    )}
                  </div>
                );
              })}
            </article>
            <article className="capture-card">
              <span className="eyebrow">What this step needs to deliver</span>
              <h3>{step.output}</h3>
              <p>
                Use your existing tools where they fit. Name what should do the
                work, who is responsible and what needs to pass to the next
                step.
              </p>
              <p>
                We’ve pre-filled a starting system proposal for this step.
                Confirm it, replace it with your existing tools, or leave it
                unresolved.
              </p>
            </article>
          </div>
          <article className="capture-card">
            <h3>Does this proposal fit?</h3>
            <Badge
              value={
                stale
                  ? "Evidence changed · recheck"
                  : r?.choice || "Not reviewed"
              }
            />
            {setSession && !room ? (
              <>
                <div className="guide-links">
                  {(["Keep", "Change", "Unresolved"] as const).map((choice) => (
                    <button
                      key={choice}
                      aria-pressed={!stale && r?.choice === choice}
                      onClick={() => update({ choice })}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
                <p className="muted">
                  Keep = use this proposal. Change = correct the tools or
                  process. Unresolved = name the question and who can answer it.
                </p>
                <Field
                  label={
                    r?.choice === "Change"
                      ? "What should we use or do instead?"
                      : "Correction or qualification (if needed)"
                  }
                  multiline
                  value={r?.change || ""}
                  onChange={(change) =>
                    update({ change, choice: "Not reviewed" })
                  }
                />
                <p className="muted">
                  {systems.suggested
                    ? "Suggested systems · our initial architecture thinking, for the room to review."
                    : "Systems captured by the room."}{" "}
                  Ownership, integration and approvals still need agreement.
                </p>
                <Field
                  label="Which systems or tools should do this work?"
                  multiline
                  value={systems.value}
                  placeholder="Name each tool and its role, or record what is not decided."
                  onChange={(systems) =>
                    update({ systems, choice: "Not reviewed" })
                  }
                />
                <Field
                  label="What passes to the next step, and where does it go?"
                  multiline
                  value={r?.handoff || ""}
                  placeholder={step.output}
                  onChange={(handoff) =>
                    update({ handoff, choice: "Not reviewed" })
                  }
                />
                <Field
                  label="Who reviews it, or can change or stop it?"
                  multiline
                  value={r?.controls || ""}
                  onChange={(controls) =>
                    update({ controls, choice: "Not reviewed" })
                  }
                />
                <Field
                  label="Who owns this step or can resolve the question?"
                  value={r?.owner || ""}
                  onChange={(owner) =>
                    update({ owner, choice: "Not reviewed" })
                  }
                />
                <Field
                  label="What needs deciding or testing next?"
                  multiline
                  value={r?.next || ""}
                  onChange={(next) => update({ next, choice: "Not reviewed" })}
                />
                <small>
                  After editing, choose Keep, Change or Unresolved to record the
                  room’s position.
                </small>
              </>
            ) : (
              <>
                <p>{r?.change}</p>
                <p>Systems: {systems.value || "Not decided"}</p>
                <p>Handoff: {r?.handoff || "Not captured"}</p>
                <p>Controls: {r?.controls || "Not captured"}</p>
                <p>Owner: {r?.owner || "Not assigned"}</p>
                <p>Next: {r?.next || "Not captured"}</p>
              </>
            )}
          </article>
        </>
      ) : (
        <>
          <h2>Here is the proposed way of working</h2>
          <WorkflowSummary session={s} />

          {setSession && !room && (
            <>
              <p>
                The readout assembles this conversation into an architecture
                view and downloadable PDF. Unresolved items remain visible.
                Review workshop-wide decisions in the detailed editor if they
                affect several cases.
              </p>
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
              <button
                onClick={() =>
                  setSession((p) => ({ ...p, architectureTab: "lab" }))
                }
              >
                Try the content exercise →
              </button>
            </>
          )}
        </>
      )}
      {!room && (
        <>
          <button aria-expanded={details} onClick={() => setDetails(!details)}>
            {details ? "Hide" : "Open"} detailed architecture and shared
            decisions (optional)
          </button>
          {details && setSession && (
            <ArchitectureDetails session={s} setSession={setSession} />
          )}
        </>
      )}
    </>
  );
}
