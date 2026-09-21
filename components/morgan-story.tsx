import Image from "next/image";
const moments = [
  {
    time: "08:45",
    title: "Before the day gets away from her.",
    image: "meet-morgan",
    body: "Morgan sits down with a coffee and a day that is already filling up. There are campaigns waiting on decisions, an event to follow up on and an audience issue to untangle. She wants to know where her attention will make the biggest difference.",
    thought: "What needs me—and what can keep moving without me?",
  },
  {
    time: "09:15",
    title: "Interest is there. But whose interest?",
    image: "s2",
    body: "The account activity looks promising. Morgan has seen that before: enthusiastic users don’t always mean a buying group is ready. Before she asks anyone to make more content, she wants to know who is missing from the conversation and whether there is a useful next move.",
    thought:
      "Are we helping an account move forward, or just sending another message?",
  },
  {
    time: "11:00",
    title: "One good idea. Several different conversations.",
    image: "s3",
    body: "Morgan has chosen a direction. Now the technical evaluator, the business sponsor and procurement need different things from the same campaign. She wants the agent to do the assembly, but she still cares about the promise they are making—and whether the work feels relevant to the person receiving it.",
    thought: "Make it useful to each person. Don’t just change the greeting.",
  },
  {
    time: "15:00",
    title: "This is the part she needs to see.",
    image: "s6",
    body: "Between meetings, Morgan checks back in. Most of the work should not need her again. But a consent conflict is different: speed is not a reason to make an assumption. She wants the problem contained, an owner assigned and a clear record of what will happen next.",
    thought:
      "Tell me what is uncertain, what you recommend, and what you need me to decide.",
  },
  {
    time: "17:30",
    title: "A day with fewer loose ends.",
    image: "s7",
    body: "Before closing her laptop, Morgan wants a straight answer: what moved, what is still waiting and who owns the next step? She doesn’t need a victory lap or another dashboard. She needs confidence that the decisions made today will still be visible tomorrow.",
    thought: "What can I stop carrying in my head tonight?",
  },
];
export default function MorganStory({ moment }: { moment: number }) {
  const m = moments[Math.max(0, Math.min(4, moment))];
  return (
    <section className="morgan-narrative">
      <Image
        src={`/images/morgan/${m.image}.png`}
        alt={`Illustration of Morgan during her imagined Tuesday: ${m.title}`}
        width={1536}
        height={1024}
        sizes="(max-width:700px) 90vw, 260px"
      />
      <div>
        <span className="agent-kicker">
          {m.time} · Morgan’s imagined Tuesday
        </span>
        <h1>{m.title}</h1>
        <p>{m.body}</p>
        <blockquote>{m.thought}</blockquote>
      </div>
    </section>
  );
}
