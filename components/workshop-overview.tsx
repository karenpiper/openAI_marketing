import SaveFooter from "./save-footer";
import WorkshopGlyph from "./workshop-glyph";
import { useEffect, type Dispatch, type SetStateAction } from "react";
import { type Session, stages } from "../lib/workshop";
import { heard, decisions } from "../lib/workshop-data";
import { Field } from "./workshop-fields";
const chapters = [
  "Why we’re here",
  "The agenda",
  "What we heard",
  "Open decisions",
  "Who’s here",
];
function StoryNav({ index }: { index: number }) {
  return (
    <nav
      className="briefing-story-nav"
      aria-label={`${chapters[index]} navigation`}
    >
      <span>
        {index + 1} / {chapters.length} · {chapters[index]}
      </span>
      <div>
        {index > 0 && (
          <a
            href={`#briefing-${index - 1}`}
            aria-label={`Previous: ${chapters[index - 1]}`}
          >
            ← Previous
          </a>
        )}
        {index < chapters.length - 1 && (
          <a
            href={`#briefing-${index + 1}`}
            aria-label={`Next: ${chapters[index + 1]}`}
          >
            Next →
          </a>
        )}
      </div>
    </nav>
  );
}
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
  useEffect(() => {
    if (!setSession) {
      document
        .getElementById(`briefing-${s.briefingPanel}`)
        ?.scrollIntoView({ behavior: "instant", block: "start" });
      return;
    }
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let panel = 0;
        for (let i = 0; i < chapters.length; i++) {
          const el = document.getElementById(`briefing-${i}`);
          if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4)
            panel = i;
        }
        setSession((p) =>
          p.briefingPanel === panel ? p : { ...p, briefingPanel: panel },
        );
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      cancelAnimationFrame(frame);
    };
  }, [setSession, s.briefingPanel]);
  const hasProgress =
    Object.values(s.assessments).some((a) => a.discussed) ||
    s.capabilities.length > 0 ||
    s.workflowReviews.length > 0;
  const takeaways = [
    "Build on what works",
    "Turn signals into action",
    "Make relevant content available",
    "Measure time as well as growth",
    "Separate priority from readiness",
  ];
  return (
    <section className="briefing-page briefing-story">
      <nav className="briefing-chapters" aria-label="Opening story">
        {chapters.map((name, i) => (
          <a key={name} href={`#briefing-${i}`}>
            0{i + 1} {name}
          </a>
        ))}
      </nav>
      <section id="briefing-0" className="briefing-frame">
        <figure className="briefing-cover">
          <img
            src="/images/workshop-collage.png"
            alt="Illustration of people bringing ideas, content and audience journeys together around a workshop table"
            fetchPriority="high"
          />
          <figcaption>Bring the work into the room.</figcaption>
          <span className="cover-tag">
            A working session / OpenAI × Adobe × Code and Theory
          </span>
        </figure>
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
              First, follow Morgan’s day. Then understand today’s process, shape
              the next workflow and agree the first test.
            </p>
            <strong>Our output: priorities → architecture → action.</strong>
            {onResume && hasProgress && (
              <button className="briefing-resume" onClick={onResume}>
                Resume saved progress · {stages[s.stage].title} →
              </button>
            )}
            <small>
              Use the arrows or scroll to walk through this briefing. Everything
              is already visible.
            </small>
          </aside>
        </header>
        <StoryNav index={0} />
      </section>
      <section id="briefing-1" className="briefing-frame">
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
              <WorkshopGlyph kind={i} />
              <h3>{stage.title}</h3>
              <p>
                {
                  [
                    "Walk Morgan’s day and score the problems.",
                    "Explore a recent example for each priority.",
                    "Keep, change or question a suggested way of working.",
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
                      "Architecture shaped by the room",
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
        <StoryNav index={1} />
      </section>
      <section id="briefing-2" className="briefing-frame">
        <div className="briefing-section-title">
          <span className="eyebrow">Starting context</span>
          <h2>What we’ve heard</h2>
          <p>
            Original statements from earlier conversations. Please correct these
            starting assumptions in the room.
          </p>
        </div>
        <div className="briefing-insights">
          {heard.map((h, i) => (
            <article key={h.q}>
              <span className="briefing-index">0{i + 1}</span>
              <div>
                <h3>{takeaways[i]}</h3>
                <p>“{h.q}”</p>
              </div>
            </article>
          ))}
        </div>
        <StoryNav index={2} />
      </section>
      <section id="briefing-3" className="briefing-frame">
        <div className="briefing-section-title">
          <span className="eyebrow">Questions to carry</span>
          <h2>We don’t need every answer to begin.</h2>
          <p>
            These four decisions help distinguish what can move now from what
            needs agreement.
          </p>
        </div>
        <div className="briefing-decision-grid">
          {decisions.map((d) => (
            <article key={d.num}>
              <span className="briefing-index">0{d.num}</span>
              <h3>{d.t}</h3>
              <p>{d.q}</p>
              <div className="briefing-position">
                <span className="label">Starting position</span>
                <p>{d.known}</p>
                <span className="label">Still open</span>
                <p>{d.open}</p>
              </div>
            </article>
          ))}
        </div>
        <StoryNav index={3} />
      </section>
      <section id="briefing-4" className="briefing-frame">
        <div className="briefing-section-title">
          <span className="eyebrow">Participants</span>
          <h2>Who’s in the room</h2>
          <p>
            Bring your experience of the work. You don’t need an exhaustive view
            of the systems.
          </p>
        </div>
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
        {setSession && <SaveFooter />}
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
        <StoryNav index={4} />
      </section>
    </section>
  );
}
