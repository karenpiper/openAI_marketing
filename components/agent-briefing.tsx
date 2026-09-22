import Image from "next/image";
export const workshopAgenda = [
  {
    title: "Current-state workflow",
    minutes: 10,
    body: "Map how work moves today, including the tools, people, handoffs and constraints that shape the current experience.",
  },
  {
    title: "Priority use cases and outcomes",
    minutes: 20,
    body: "Align on the first use cases worth solving, the Northstar, the business outcome for each, and what should be validated and proven first.",
  },
  {
    title: "Target workflow (prototype)",
    minutes: 20,
    body: "Use Morgan’s day to examine one tangible target workflow, the moments where judgment matters and the proposed near-term experience.",
  },
  {
    title: "Target workflow architecture and operating boundaries",
    minutes: 30,
    body: "Work through how OpenAI intelligence and orchestration connect with Adobe capabilities and Code and Theory’s implementation approach across identity, buying groups, journeys, content operations, activation, governance and measurement.",
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
          Step 0 · OpenAI × Adobe × Code and Theory · 95 minutes
        </span>
        <h1>
          Imagine the day.
          <br />
          Define what delivers enterprise revenue now.
        </h1>
        <p>
          Start with the work that can move enterprise opportunities forward
          now. Use the experience to align on the decisions, capabilities,
          connections and boundaries that make that work repeatable.
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
            <h3>Agent-led, human-augmented marketing.</h3>
            <p>
              Convert the richest enterprise pipeline in history with agents
              that assemble relevant work across buying roles and channels—and
              people who direct the consequential decisions.
            </p>
          </article>
          <article>
            <span>THE QUESTION</span>
            <h3>What delivers enterprise revenue now?</h3>
            <p>
              Start with the actions that help buying groups advance today.
              Then identify what is already usable, what needs connecting and
              which gaps would unlock more value.
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
        <h2>Before naming use cases, agree what moves.</h2>
        <div className="opening-cards outcome-cards">
          <article>
            <span>01</span>
            <h3>Value realization · AAR</h3>
            <p>
              The primary measure: AAR created and realized from enterprise
              pipeline, including expansion opportunities.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Release-ready cadence</h3>
            <p>
              Time from a daily product release to an approved, enterprise-ready
              market action across the relevant buying group.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Pipeline velocity</h3>
            <p>
              Days for qualified enterprise deals to move from engaged buying
              group through the next decision and toward close.
            </p>
          </article>
          <article>
            <span>04</span>
            <h3>Pipeline value</h3>
            <p>
              The size of qualified enterprise opportunities progressing through
              the pipeline, including expansion potential.
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
            <h3>A working workflow architecture</h3>
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
          She leads growth and account-based marketing. Her job today is to turn
          enterprise interest into meaningful adoption while making sound calls
          across that queue.
        </p>
        <p>
          She arrives to a real marketing queue: account signals to interpret,
          requests waiting for operations, campaigns in review, new contacts to
          reach and yesterday’s results to learn from. There may be thirty
          things competing for attention before the first meeting even starts.
        </p>
        <p className="morgan-human-note">
          Follow her Tuesday first. The use cases come afterwards, when we name
          the repeatable needs that surfaced from it.
        </p>
        <div className="current-day-stops">
          {[
            {
              time: "8:15 AM",
              title: "She opens a full queue.",
              image: "s1",
              body: "Morgan starts with twenty-four possible tasks: an account showing new product interest, an event follow-up waiting for a list, a campaign stalled in review, a sales request, an audience question, and yesterday’s performance results. None arrives as a clean brief. Each competes for attention.",
            },
            {
              time: "9:00 AM",
              title: "She decides where to put her attention.",
              image: "s2",
              body: "She pulls together what she can see about the accounts, people, activity and business priorities behind the requests. The difficult part is not finding one more signal; it is judging which signal deserves action and what a good next move would be.",
            },
            {
              time: "10:30 AM",
              title: "She tries to turn a decision into work.",
              image: "s3",
              body: "Once Morgan has chosen a direction, she has to find the right people, source material, message and channel. Some of it exists somewhere. Some needs to be created. The work crosses the team’s tools, operating rhythms and people.",
            },
            {
              time: "12:00 PM",
              title: "She keeps the work moving.",
              image: "s4",
              body: "The afternoon brings routine requests alongside decisions that need real care. Morgan is coordinating marketing operations, reviewers, sales context and delivery—not because every task is complex, but because the handoffs are.",
            },
            {
              time: "3:30 PM",
              title: "She steps in where judgment matters.",
              image: "s6",
              body: "A sensitive account, an unclear consent signal and a message for a senior contact do not belong in the same pathway as a routine follow-up. Morgan needs the important exceptions to be visible, intelligible and easy to resolve.",
            },
            {
              time: "6:00 PM",
              title: "She asks what today changed.",
              image: "s7",
              body: "At the end of the day, Morgan can see activity: sends, event attendance, engagement, replies and work still pending. The value comes when those results improve tomorrow’s choices instead of remaining a report someone reviews later.",
            },
          ].map((moment) => (
            <article className="current-day-stop" key={moment.time}>
              <Image
                src={`/images/morgan/${moment.image}.png`}
                alt=""
                width={640}
                height={420}
              />
              <div className="current-day-copy">
                <span className="agent-kicker">
                  {moment.time} · Morgan’s Tuesday
                </span>
                <h2>{moment.title}</h2>
                <p className="current-day-narrative">{moment.body}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="opening-footnote">
          The day gives us the context. Next, we name and score the use cases
          that emerge across it.
        </p>
        <button className="agent-primary" onClick={onEnter}>
          Turn the day into use-case candidates →
        </button>
      </section>
    </main>
  );
}
