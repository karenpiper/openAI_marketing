import { useState } from "react";
const items = [
  {
    title: "Northstar Health expansion is ready for a decision",
    tag: "Recommended focus",
    time: "Opportunity · today",
    body: "Northstar’s technical team completed two workspace projects and attended the Enterprise Adoption Roundtable. The business sponsor and procurement have not yet joined the evaluation.",
    next: "Review the buying-group signals, choose a direction and build the Northstar content plan.",
    featured: true,
  },
  {
    title: "Finserv activation needs a coordinated plan",
    tag: "New campaign",
    time: "October–November · December readout",
    body: "Two connected journeys: tailored outreach for Top 20 buying groups and an inclusive finance campaign. Morgan needs to align the audience, content, approvals and Sales handoffs.",
    next: "Build the Finserv campaign from brief through activation and December follow-through.",
    featured: true,
  },
  {
    title: "Cedar & Finch needs a sponsor-ready point of view",
    tag: "Review needed",
    time: "Approval · today",
    body: "The campaign team has returned an updated business-sponsor brief after the product-education webinar.",
    next: "Review the audience promise and channel mix before the packet goes to brand and legal.",
    featured: false,
  },
  {
    title: "Meridian Logistics roundtable follow-up is ready",
    tag: "Prepared for you",
    time: "Event operations · this morning",
    body: "24 attendees and 37 no-shows have distinct follow-up recommendations after yesterday’s customer session.",
    next: "Check audience eligibility and the proposed next action for each group.",
    featured: false,
  },
  {
    title: "Harborline Bank audience sync needs attention",
    tag: "Exception",
    time: "Data quality · overnight",
    body: "A separate audience update contains unresolved account matches. The affected records remain on hold.",
    next: "Ask the data owner to resolve the matches before the audience is activated.",
    featured: false,
  },
];
export default function MorningInbox({ onStart, onFinserv }: { onStart: () => void; onFinserv: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <section className="morning-inbox">
      <div className="morning-inbox-heading">
        <h2>Your morning queue</h2>
        <span>5 items · illustrative scenarios</span>
      </div>
      <div className="morning-inbox-grid">
        {items.map((item, i) => (
          <article key={item.title} className={item.featured ? "featured" : ""}>
            <span className="inbox-status">{item.tag}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            <small>{item.time}</small>
            <button
              className={item.featured ? "agent-primary" : ""}
              aria-expanded={item.featured ? undefined : selected === i}
              onClick={() =>
                item.featured
                  ? (i === 1 ? onFinserv() : onStart())
                  : setSelected(selected === i ? null : i)
              }
            >
              {item.featured ? (i === 1 ? "Build the Finserv campaign →" : "Work on Northstar →") : "Preview item"}
            </button>
          </article>
        ))}
      </div>
      {selected !== null && (
        <div className="inbox-item-preview">
          <b>{items[selected].title}</b>
          <p>{items[selected].next}</p>
          <small>
            Context preview only. Today’s connected walkthrough follows the
            recommended adoption opportunity.
          </small>
          <button onClick={() => setSelected(null)}>Close preview</button>
        </div>
      )}
    </section>
  );
}
