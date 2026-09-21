import BackendIllustration from "./backend-illustration";
import type { AgentState } from "../lib/agent-workspace";
import { workStages, currentWorkStep } from "../lib/workflow-work";
export function WorkflowWork({
  session,
  id,
  onStep,
  onFinish,
}: {
  session: AgentState;
  id: string;
  onStep: (n: number) => void;
  onFinish: () => void;
}) {
  const stages = workStages(session, id),
    index = currentWorkStep(session, id),
    stage = stages[index],
    blocked = id === "s3" && session.source === "Source material missing";
  return (
    <section className="work-artifact">
      <div className="work-track">
        {stages.map((s, i) => (
          <span
            key={s.title}
            className={i === index ? "active" : i < index ? "complete" : ""}
          >
            {i < index ? "✓" : i + 1} {s.title}
          </span>
        ))}
      </div>
      <span className="agent-kicker">
        Work package {index + 1} / {stages.length}
      </span>
      <h3>{stage.title}</h3>
      <p>{stage.summary}</p>
      <div className="work-table">
        {stage.rows.map(([name, status, detail]) => (
          <article key={name}>
            <strong>{name}</strong>
            <span>{status}</span>
            <p>{detail}</p>
          </article>
        ))}
      </div>
      {blocked ? (
        <p role="status" className="work-blocked">
          Source request prepared. Choose an approved source above to resume.
        </p>
      ) : (
        <button
          className="agent-primary"
          onClick={() =>
            index < stages.length - 1 ? onStep(index + 1) : onFinish()
          }
        >
          {stage.action} →
        </button>
      )}
      {index > 0 && (
        <button className="work-back" onClick={() => onStep(index - 1)}>
          Review previous package
        </button>
      )}
    </section>
  );
}
export function WorkflowRequirements({
  session,
  id,
}: {
  session: AgentState;
  id: string;
}) {
  const index = currentWorkStep(session, id),
    stage = workStages(session, id)[index];
  return (
    <section className="work-requirements">
      <span className="agent-kicker">
        Behind the screen · proposed technical requirements · {index + 1}
      </span>
      <h3>{stage.title}: what enables this work</h3>
      <BackendIllustration session={session} id={id} key={`${id}-${index}`} />
      <dl>
        {[
          ["INPUT", stage.input],
          ["CONNECTION", stage.connection],
          ["OUTPUT", stage.output],
          ["ENABLES", stage.enables],
          ["CONTROL", stage.control],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p>
        Proposed connections to validate with the room; no integration is
        represented as already available.
      </p>
    </section>
  );
}
