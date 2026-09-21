import type { Dispatch, SetStateAction } from "react";
import { type Session, stages } from "../lib/workshop";
import { heard, decisions } from "../lib/workshop-data";
import { Field } from "./workshop-fields";
export default function WorkshopOverview({
  session: s,
  setSession,
  onEnter,
  onResume,
}: {
  session: Session;
  setSession?: Dispatch<SetStateAction<Session>>;
  onEnter?: () => void;
  onResume?: () => void;
}) {
  const hasProgress =
    Object.values(s.assessments).some((a) => a.discussed) ||
    s.capabilities.length > 0 ||
    s.workflowReviews.length > 0;
  return (
    <section className="module-panel workshop-overview">
      <div className="module-heading">
        <span className="eyebrow">
          00 · Before we begin · OpenAI × Adobe × Code and Theory
        </span>
        <h1>From marketing priorities to a plan we can act on.</h1>
        <p>
          A two-hour working session to agree which problems matter, understand
          how the work happens today, and test a proposed way forward.
        </p>
      </div>
      <div className="overview-entry">
        {onEnter && (
          <button className="overview-enter" onClick={onEnter}>
            Enter workshop →
          </button>
        )}
        {onResume && hasProgress && (
          <button onClick={onResume}>
            Resume saved progress · {stages[s.stage].title} →
          </button>
        )}
        <p>
          We’ll capture answers together, read them back and keep uncertainty
          visible.
        </p>
      </div>
      <div className="workflow-comparison">
        <article className="capture-card">
          <h2>Who’s in the room</h2>
          <p>OpenAI · Adobe · Code and Theory</p>
          {setSession ? (
            <Field
              label="Attendees and roles"
              multiline
              value={s.attendees}
              placeholder="Add names and roles as people join. Attendance is not assumed."
              onChange={(attendees) => setSession((p) => ({ ...p, attendees }))}
            />
          ) : (
            <p className="preserve-lines">
              {s.attendees || "Attendees to be confirmed at the start."}
            </p>
          )}
        </article>
        <article className="capture-card">
          <h2>What we want to leave with</h2>
          <ul>
            <li>
              A small agreed set of priority use cases, with growth and
              productivity outcomes.
            </li>
            <li>What already exists and what needs to change.</li>
            <li>
              A proposed workflow for each priority, with owners and open
              decisions.
            </li>
            <li>The first tests, next actions and asks for Colin.</li>
          </ul>
        </article>
      </div>
      <h2>The agenda · 120 minutes</h2>
      <div className="overview-agenda">
        {stages.map((stage, i) => (
          <article className="capture-card" key={stage.title}>
            <span className="eyebrow">
              0{i + 1} · {stage.minutes} minutes
            </span>
            <h3>{stage.title}</h3>
            <p>
              {
                [
                  "Walk Morgan’s day, correct the hypotheses and prioritize the problems worth solving.",
                  "Use recent examples to understand today’s process, tools and gaps.",
                  "Review proposed workflows against today’s evidence and the supplied architecture. Keep, change or flag what remains unresolved.",
                  "Agree what happens next, who owns it and what needs sponsorship.",
                ][i]
              }
            </p>
          </article>
        ))}
      </div>
      <p>
        The optional content-at-scale exercise sits within the architecture
        block. We currently have a fictional practice brief; an approved source
        asset still needs to be chosen.
      </p>
      <h2>What we’ve heard so far</h2>
      <p>
        Starting context from earlier conversations—not conclusions agreed by
        this room. Please correct it as we go.
      </p>
      <div className="summary-grid">
        {heard.map((h) => (
          <article className="side-card" key={h.q}>
            <p>“{h.q}”</p>
          </article>
        ))}
      </div>
      <h2>What we know—and what we need to check</h2>
      <p>
        The existing single-buyer motion is our starting point. Buying-group
        coverage and today’s operational details need validation. Content at
        scale is a priority for the live exercise, with audience-specific
        messaging informed by activity across content, the website, events and
        sales.
      </p>
      <p>
        The supplied architecture is a proposal to test against what we learn,
        not a confirmed inventory of today’s systems.
      </p>
      <details className="starting-context">
        <summary>Four decisions in the background</summary>
        {decisions.map((d) => (
          <article key={d.num}>
            <h3>{d.t}</h3>
            <p>{d.q}</p>
          </article>
        ))}
      </details>
      <div className="overview-entry">
        {onEnter && (
          <button className="overview-enter" onClick={onEnter}>
            Enter workshop →
          </button>
        )}
        <p>
          Begin with Morgan’s day. Nothing is prioritized or agreed
          automatically.
        </p>
      </div>
    </section>
  );
}
