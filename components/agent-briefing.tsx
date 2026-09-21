import Image from "next/image";
import { useCases } from "../lib/workshop-data";
import { useCaseCandidates } from "../lib/use-case-candidates";
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
      <section id="opening-outcomes-first">
        <span className="agent-kicker">02 / Start with the outcomes</span>
        <h2>
          Before naming use cases,
          <br />
          agree what better looks like.
        </h2>
        <div className="opening-cards outcome-cards">
          <article>
            <span>01</span>
            <h3>Speed to market</h3>
            <p>
              Move from a real signal and an approved source to a useful market
              action faster.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Do more with less</h3>
            <p>
              Increase the volume and relevance of work without adding a
              separate manual process for every audience.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Efficiency with care</h3>
            <p>
              Keep people focused on consequential decisions while routine work
              follows the right controls.
            </p>
          </article>
          <article>
            <span>04</span>
            <h3>Revenue realization</h3>
            <p>
              Help more enterprise buying groups move from interest to a
              meaningful next conversation.
            </p>
          </article>
        </div>
        <p className="opening-footnote">
          These outcomes are the lens for the use-case conversation that
          follows. The room can amend them before Morgan’s day begins.
        </p>
        <a href="#opening-agenda">How we will use them ↓</a>
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
export function MeetMorgan({ onEnter }: { onEnter: () => void }) {
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
          She arrives to a real marketing queue: account signals to interpret,
          requests waiting for operations, campaigns in review, new contacts to
          reach and yesterday’s results to learn from. There may be thirty
          things competing for attention before the first meeting even starts.
        </p>
        <p>
          She leads growth and account-based marketing. Her job today is to turn
          enterprise interest into meaningful adoption while making sound calls
          across that queue.
        </p>
        <div className="morgan-story-note">
          <b>This is a working hypothesis of Morgan’s day today.</b>
          <p>
            Correct it with the room. We are mapping the current experience
            before proposing a future workflow or deciding which capabilities
            should change it.
          </p>
        </div>
        <p className="morgan-human-note">
          Follow seven moments in that queue. Each reveals a problem worth
          testing; none is a pre-agreed priority.
        </p>
        <div className="current-day-stops">
          {useCases.map((scene) => (
            <article className="current-day-stop" key={scene.id}>
              <Image
                src={`/images/morgan/${scene.id}.png`}
                alt=""
                width={640}
                height={420}
              />
              <div className="current-day-copy">
                <span className="agent-kicker">
                  {scene.time} · {scene.label}
                </span>
                <h2>{scene.title}</h2>
                <p className="current-day-narrative">{scene.narrative}</p>
                <div className="current-day-detail">
                  <div>
                    <b>The problem we think is real</b>
                    <p>{scene.problem}</p>
                  </div>
                  <div>
                    <b>Why we think it is real</b>
                    <p>{scene.evidence}</p>
                  </div>
                  <div>
                    <b>Ask the room</b>
                    <p>{scene.question}</p>
                  </div>
                </div>
                <div className="current-day-outcomes">
                  <span>
                    <b>Growth</b>
                    {scene.kpiGrowth}
                  </span>
                  <span>
                    <b>Productivity</b>
                    {scene.kpiProd}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <section className="emerging-needs">
          <span className="agent-kicker">
            Additional opportunities already surfaced
          </span>
          <h2>Carry these into the scoring conversation too.</h2>
          <div>
            {useCaseCandidates.slice(7).map((candidate) => (
              <article key={candidate.id}>
                <h3>{candidate.title}</h3>
                <p>{candidate.short}</p>
              </article>
            ))}
          </div>
        </section>
        <p className="opening-footnote">
          This is a current-state conversation. The next step turns what the
          room recognizes into a scored, explicit priority set.
        </p>
        <button className="agent-primary" onClick={onEnter}>
          Turn the day into use-case candidates →
        </button>
      </section>
    </main>
  );
}
