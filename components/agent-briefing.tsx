import type { ReactNode } from "react";
import Image from "next/image";
export const workshopAgenda = [
  {
    title: "Priority use cases and outcomes",
    minutes: 25,
    body: "Align on the first use cases worth solving, the Northstar, the business outcome for each, and what should be validated and proven first.",
  },
  {
    title: "Current-state architecture and capability reuse",
    minutes: 25,
    body: "Map the OpenAI capabilities and architecture patterns already in place across Codex, product/growth infrastructure, S3/data, Marketo, and internal tooling. Pinpoint foundational capabilities still required.",
  },
  {
    title: "Target architecture and operating boundaries",
    minutes: 25,
    body: "Work through how OpenAI intelligence and orchestration connect with Adobe capabilities and Code and Theory’s implementation approach across identity, buying groups, journeys, content operations, activation, governance, and measurement. Clarify system ownership, integration points, state, and controls.",
  },
  {
    title: "Decisions, sequencing, and Colin readout",
    minutes: 15,
    body: "Capture what we agree on, what remains open, the proposed sequence of work, and the decisions or sponsorship we need from Colin.",
  },
];
export default function AgentBriefing({ onEnter }: { onEnter: () => void }) {
  return (
    <main className="workshop-opening">
      <section id="opening-purpose" className="opening-hero">
        <span className="agent-kicker">
          Step 0 · OpenAI × Adobe × Code and Theory · 90 minutes
        </span>
        <h1>
          Imagine the day.
          <br />
          Define what makes it possible.
        </h1>
        <p>
          Start with the experience we want a marketer to have. Use it to align
          on the work worth doing—and the capabilities, connections and
          boundaries that would make it real.
        </p>
        <a href="#opening-heard">What we heard ↓</a>
      </section>
      <section id="opening-heard">
        <span className="agent-kicker">01 / Our starting point</span>
        <h2>Build from what we heard.</h2>
        <div className="opening-cards">
          <article>
            <span>THE EXPERIENCE</span>
            <h3>Work in OpenAI tools.</h3>
            <p>
              Keep the marketer in an OpenAI / ChatGPT Work-style environment,
              with supporting capabilities connected behind the experience.
            </p>
          </article>
          <article>
            <span>THE OPPORTUNITY</span>
            <h3>Content at scale.</h3>
            <p>
              Use audience and journey context to coordinate relevant messaging
              across buying roles and channels. Events are one part of that
              journey.
            </p>
          </article>
          <article>
            <span>THE QUESTION</span>
            <h3>What makes it real?</h3>
            <p>
              Some capabilities may already exist. Others may be feasible
              internally or need additional support. An absent process is not
              automatically a missing capability.
            </p>
          </article>
        </div>
        <p className="opening-footnote">
          These are our working interpretations to confirm with the room. The
          prototype is a proposed near-term solution, not a claim about today’s
          operation.
        </p>
        <a href="#opening-agenda">Our time together ↓</a>
      </section>
      <section id="opening-agenda">
        <span className="agent-kicker">02 / The workshop agenda</span>
        <h2>
          Four conversations.
          <br />
          One connected answer.
        </h2>
        <div className="opening-agenda">
          {workshopAgenda.map((a, i) => (
            <article key={a.title}>
              <span>0{i + 1}</span>
              <div>
                <h3>{a.title}</h3>
                <p>{a.body}</p>
              </div>
              <b>{a.minutes} min</b>
            </article>
          ))}
        </div>
        <a href="#opening-outcomes">What we leave with ↓</a>
      </section>
      <section id="opening-outcomes">
        <span className="agent-kicker">03 / Three concrete outputs</span>
        <h2>
          A Day in the Life prototype
          <br />
          that reflects our decisions.
        </h2>
        <div className="opening-cards">
          <article>
            <span>01</span>
            <h3>An agreed priority use-case set</h3>
            <p>
              With the Northstar, business outcomes and what needs to be proven
              first.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>A working architecture</h3>
            <p>
              With clear ownership boundaries, integration points, state and
              controls.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Decisions and dependencies</h3>
            <p>
              A short list, a proposed sequence and the asks for Colin’s readout
              the next day.
            </p>
          </article>
        </div>
        <button className="agent-primary" onClick={onEnter}>
          Enter the workshop · Meet Morgan →
        </button>
      </section>
    </main>
  );
}
export function MeetMorgan({
  onEnter,
  discussion,
}: {
  onEnter: () => void;
  discussion: ReactNode;
}) {
  return (
    <main className="workshop-opening">
      <section className="opening-hero">
        <span className="agent-kicker">
          Agenda 1 · Priority use cases and outcomes · 25 minutes
        </span>
        <h1>Meet Morgan.</h1>
        <Image
          className="morgan-portrait"
          src="/images/morgan/meet-morgan.png"
          alt="Morgan at her desk, surrounded by the people and work she connects."
          width={1536}
          height={1024}
          sizes="(max-width:700px) 90vw, 480px"
        />
        <p>
          She knows the work is about people: the champion trying to get a pilot
          going, the sponsor who needs a reason to invest, the colleague waiting
          for a clear decision.
        </p>
        <p>
          She leads growth and account-based marketing. Her goal is to turn
          enterprise interest into meaningful adoption—without making every
          audience, content and operational decision by hand.
        </p>
        <div className="morgan-story-note">
          <b>This is the day we’re proposing.</b>
          <p>
            An imagined near-term experience: the agent brings Morgan the
            opportunity, prepares the work and keeps it moving. She sets
            direction, approves consequential choices and handles exceptions.
          </p>
        </div>
        <p className="morgan-human-note">
          She is not looking for more things to approve. She wants time for the
          decisions that deserve her experience—and confidence that the routine
          work is being handled with care.
        </p>
        <div className="morgan-clear">{discussion}</div>
        <h2>One opportunity runs through her day.</h2>
        <div className="opening-day">
          {[
            [
              "08:45",
              "She arrives.",
              "A morning briefing brings an account opportunity to her attention.",
            ],
            [
              "09:15",
              "She chooses a direction.",
              "Product and journey signals suggest the wider buying group needs to engage.",
            ],
            [
              "11:00",
              "She reviews the plan.",
              "The same audience and objective become a coordinated content and activation plan.",
            ],
            [
              "15:00",
              "She handles an exception.",
              "A consent conflict needs judgment while routine checks follow agreed rules.",
            ],
            [
              "17:30",
              "She sees what moved.",
              "The same thread returns her decisions, pending handoffs and unresolved work.",
            ],
          ].map(([time, title, body]) => (
            <article key={time}>
              <span>{time}</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="opening-footnote">
          Inside the monitor: Morgan’s proposed working experience. Outside it:
          our narrative, technical implications and workshop discussion. All
          example data and actions are simulated.
        </p>
        <button className="agent-primary" onClick={onEnter}>
          Begin Morgan’s Tuesday →
        </button>
      </section>
    </main>
  );
}
