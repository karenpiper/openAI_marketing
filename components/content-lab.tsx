import { type Dispatch, type SetStateAction } from "react";
import { type Session } from "../lib/workshop";
import {
  scenarioFlow,
  scenarioOptions,
  scenarioSummary,
  type WorkflowScenario,
} from "../lib/workflow-simulation";
import { Field } from "./workshop-fields";
import SaveFooter from "./save-footer";
const labels = {
  audiences: "Audience scale",
  assets: "Content starting point",
  approval: "Approval needs",
  channels: "Activation channels",
  identity: "Identity context",
};
export default function ContentLab({
  session,
  setSession,
  room = false,
}: {
  session: Session;
  setSession?: Dispatch<SetStateAction<Session>>;
  room?: boolean;
}) {
  const s = session.scenario;
  const flow = scenarioFlow(s);
  const editable = !!setSession && !room;
  function patch(p: Partial<WorkflowScenario>) {
    setSession?.((prev) => ({ ...prev, scenario: { ...prev.scenario, ...p } }));
  }
  return (
    <section className="module-panel simulation">
      <div className="module-heading">
        <span className="eyebrow">
          03 · Explore the architecture · 15 minutes
        </span>
        <h1>Watch the workflow adapt.</h1>
        <p>
          Change the conditions. Follow how audience context, briefs, assets and
          approvals move through our proposed architecture.
        </p>
      </div>
      <div className="question-banner">
        <h2>What happens when we add complexity?</h2>
        <p>
          Start with one audience and approved material. Add segments, an event
          follow-up or legal review. Discuss whether the resulting route would
          work here.
        </p>
        <p>
          This is an illustrative workflow using our architecture components.
          Routing and approval rules are proposals for the room to validate. No
          content is generated or systems connected.
        </p>
      </div>
      <div className="simulation-layout">
        <aside className="simulation-controls">
          <h2>Set the conditions</h2>
          {(
            Object.keys(scenarioOptions) as (keyof typeof scenarioOptions)[]
          ).map((key) => (
            <fieldset key={key}>
              <legend>{labels[key]}</legend>
              {scenarioOptions[key].map((value) =>
                editable ? (
                  <button
                    key={value}
                    aria-pressed={s[key] === value}
                    onClick={() => patch({ [key]: value })}
                  >
                    {value}
                  </button>
                ) : s[key] === value ? (
                  <p key={value}>{value}</p>
                ) : null,
              )}
            </fieldset>
          ))}
          {editable && <SaveFooter />}
        </aside>
        <div>
          <div className="simulation-summary" role="status" aria-live="polite">
            <b>Current scenario</b>
            <p>{scenarioSummary(s)}</p>
          </div>
          <ol className="simulation-map">
            {flow.map((node, i) => (
              <li
                key={node.id}
                className={`simulation-node ${node.changed ? "simulation-changed" : ""}`}
              >
                <span className="eyebrow">
                  {i + 1} ·{" "}
                  {node.changed
                    ? "Adapted for this scenario"
                    : "Shared foundation"}
                </span>
                <h3>{node.title}</h3>
                <div className="proposal-components">
                  {node.components.map((c) => (
                    <span className="proposal-component" key={c}>
                      {c}
                    </span>
                  ))}
                </div>
                <p>{node.detail}</p>
                {node.branches.length > 0 && (
                  <div
                    className="simulation-branches"
                    key={node.branches.join()}
                  >
                    {node.branches.map((b) => (
                      <span key={b}>{b}</span>
                    ))}
                  </div>
                )}
                <p className="simulation-reason">{node.why}</p>
                <div className="simulation-handoff" key={node.passes}>
                  <span aria-hidden="true">
                    {i === flow.length - 1 ? "↩" : "↓"}
                  </span>{" "}
                  {node.passes}
                </div>
              </li>
            ))}
          </ol>
          <p className="muted">
            Segment names illustrate different journey needs. Actual eligibility
            rules, tools and integrations are agreed with the room.
          </p>
        </div>
      </div>
      <article className="capture-card">
        <h2>Would this work here?</h2>
        <p>
          Name a tool to substitute, a missing handoff or a rule we should
          change. Your comments accompany this scenario in the architecture
          readout.
        </p>
        {editable ? (
          <>
            <Field
              label="Room corrections and open questions"
              multiline
              value={s.notes}
              onChange={(notes) => patch({ notes })}
            />
            <SaveFooter />
          </>
        ) : (
          <p className="preserve-lines">
            {s.notes || "No room corrections captured yet."}
          </p>
        )}
      </article>
    </section>
  );
}
