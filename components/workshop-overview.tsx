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
  const takeaways = [
    [
      "Build on what works",
      "Finding and reaching a single buyer already works. Test what changes for a buying group.",
    ],
    [
      "Turn signals into action",
      "Knowing whom to target is only the start. The next action needs a defensible rationale.",
    ],
    [
      "Make relevant content available",
      "First-touch content is a gap. Finding approved material and creating variants both matter.",
    ],
    [
      "Measure time as well as growth",
      "Track production effort and time to market alongside business outcomes.",
    ],
    [
      "Separate priority from readiness",
      "Agree what matters, then distinguish what can start now from what depends on decisions.",
    ],
  ];
  return (
    <section className="briefing-page">
      <header className="briefing-hero">
        <div>
          <span className="eyebrow">00 / Workshop briefing</span>
          <h1>
            One working session.
            <br />
            <em>A shared plan.</em>
          </h1>
          <p>
            Agree the marketing problems worth solving—and the first steps to
            solve them.
          </p>
          <div className="briefing-meta">
            <span>120 minutes</span>
            <span>4 working blocks</span>
            <span>One shared readout</span>
          </div>
        </div>
        <aside className="briefing-start">
          <span className="eyebrow">OpenAI × Adobe × Code and Theory</span>
          <h2>Start with the work.</h2>
          <p>
            We’ll follow Morgan’s day, examine today’s process, then test a
            proposed way forward.
          </p>
          {onEnter && (
            <button className="overview-enter" onClick={onEnter}>
              Enter workshop →
            </button>
          )}
          {onResume && hasProgress && (
            <button className="briefing-resume" onClick={onResume}>
              Resume saved progress · {stages[s.stage].title} →
            </button>
          )}
          <small>Capture → read back → agree</small>
        </aside>
      </header>
      <section className="briefing-section">
        <div className="briefing-section-title">
          <span className="eyebrow">The route</span>
          <h2>Four conversations. Four outputs.</h2>
        </div>
        <div className="briefing-agenda">
          {stages.map((stage, i) => (
            <article key={stage.title}>
              <div className="briefing-agenda-top">
                <span>0{i + 1}</span>
                <b>{stage.minutes} min</b>
              </div>
              <h3>{stage.title}</h3>
              <p>
                {
                  [
                    "Walk Morgan’s day and score the problems.",
                    "Explore a recent example for each priority.",
                    "Keep, change or question the proposed workflow.",
                    "Agree the first tests, owners and next actions.",
                  ][i]
                }
              </p>
              <div className="briefing-output">
                <span>Leave with</span>
                <strong>
                  {
                    [
                      "Priority use cases + outcomes",
                      "Existing tools + gaps",
                      "Proposed workflows + decisions",
                      "Action plan + asks for Colin",
                    ][i]
                  }
                </strong>
              </div>
            </article>
          ))}
        </div>
        <div className="briefing-note">
          <b>Live exercise · Content at scale</b>
          <span>
            Optional, within the architecture block. Fictional practice brief
            ready; approved source asset still to choose.
          </span>
        </div>
      </section>
      <section className="briefing-section">
        <div className="briefing-section-title">
          <span className="eyebrow">Starting context</span>
          <h2>What we’ve heard</h2>
          <p>
            From earlier conversations. Please correct these starting
            assumptions in the room.
          </p>
        </div>
        <div className="briefing-insights">
          {takeaways.map(([title, body], i) => (
            <article key={title}>
              <span className="briefing-index">0{i + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
        <details className="briefing-source">
          <summary>Read the original statements</summary>
          {heard.map((h) => (
            <blockquote key={h.q}>{h.q}</blockquote>
          ))}
        </details>
      </section>
      <div className="briefing-bottom">
        <section className="briefing-section">
          <span className="eyebrow">Participants</span>
          <h2>Who’s in the room</h2>
          <div className="briefing-orgs">
            <span>OpenAI</span>
            <span>Adobe</span>
            <span>Code and Theory</span>
          </div>
          {setSession ? (
            <Field
              label="Attendees and roles"
              multiline
              value={s.attendees}
              placeholder="Name · team · role in this discussion"
              onChange={(attendees) => setSession((p) => ({ ...p, attendees }))}
            />
          ) : (
            <p className="preserve-lines">
              {s.attendees || "Attendees to be confirmed."}
            </p>
          )}
        </section>
        <section className="briefing-section">
          <span className="eyebrow">Questions to carry</span>
          <h2>Four open decisions</h2>
          <p>
            The architecture is a proposal. These questions stay visible as we
            assess what can move now.
          </p>
          {decisions.map((d) => (
            <details className="briefing-decision" key={d.num}>
              <summary>{d.t}</summary>
              <p>{d.q}</p>
              <span className="label">Starting position</span>
              <p>{d.known}</p>
              <span className="label">Still open</span>
              <p>{d.open}</p>
            </details>
          ))}
        </section>
      </div>
      <footer className="briefing-footer">
        <div>
          <h2>Ready to meet Morgan?</h2>
          <p>
            Seven moments in her day. Which problems deserve attention first?
          </p>
        </div>
        {onEnter && (
          <button className="overview-enter" onClick={onEnter}>
            Enter workshop →
          </button>
        )}
      </footer>
    </section>
  );
}
