import { useState } from "react";
const items = [
  {
    title: "Bring the buying group into the conversation",
    tag: "Recommended focus",
    time: "Opportunity · today",
    body: "12 target accounts show technical engagement. Business sponsors and procurement are less engaged. Prepare a coordinated adoption plan.",
    next: "Review the evidence, choose a direction and build the content plan.",
    featured: true,
  },
  {
    title: "A campaign is waiting on your direction",
    tag: "Review needed",
    time: "Approval · today",
    body: "The campaign team has returned an updated audience brief for a separate product-education campaign.",
    next: "Review the audience promise and channel mix before the packet goes to brand and legal.",
    featured: false,
  },
  {
    title: "Event follow-up is ready to review",
    tag: "Prepared for you",
    time: "Event operations · this morning",
    body: "Attendee and non-attendee groups are ready for a follow-up review after yesterday’s customer session.",
    next: "Check audience eligibility and the proposed next action for each group.",
    featured: false,
  },
  {
    title: "An audience sync needs attention",
    tag: "Exception",
    time: "Data quality · overnight",
    body: "A separate audience update contains unresolved account matches. The affected records remain on hold.",
    next: "Ask the data owner to resolve the matches before the audience is activated.",
    featured: false,
  },
];
export default function MorningInbox({ onStart }: { onStart: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <section className="morning-inbox">
      <div className="morning-inbox-heading">
        <h2>Your morning queue</h2>
        <span>4 items · illustrative scenario</span>
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
                  ? onStart()
                  : setSelected(selected === i ? null : i)
              }
            >
              {item.featured ? "Work on this opportunity →" : "Preview item"}
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
