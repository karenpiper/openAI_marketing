import { chapters, priorities, type Finding } from "../lib/agent-workspace";
const framing: Record<
  string,
  { problem: string; question: string; outcome: string }
> = {
  s2: {
    problem:
      "Interest is visible, but it may be hard to tell which account, buying role or next action deserves attention.",
    question:
      "Where does a promising signal stop becoming action—and what if no process exists today?",
    outcome:
      "More qualified account progression; less time assembling evidence.",
  },
  s3: {
    problem:
      "One campaign can require many relevant messages, source checks, reviews and channel handoffs. More content alone does not solve that.",
    question:
      "Where is the real constraint: audience insight, approved material, adaptation, review or activation?",
    outcome:
      "Relevant messaging across accounts and buying roles; less manual production and coordination.",
  },
  s5: {
    problem:
      "Routine checks and requests may consume specialist time, while exceptions still need human judgment.",
    question:
      "Which work could follow agreed rules, and which decisions must stay with a person?",
    outcome: "Faster, reliable campaign operations; fewer routine escalations.",
  },
};
export default function UseCaseDiscussion({
  id,
  finding,
  onChange,
  onSave,
}: {
  id: string;
  finding: Finding;
  onChange: (patch: Partial<Finding>) => void;
  onSave: () => void;
}) {
  const chapter = chapters.find((c) => c.id === id)!;
  const frame = framing[id];
  return (
    <section className="use-case-discussion">
      <span className="agent-kicker">
        Discuss the use case · {chapter.time}
      </span>
      <h2>{chapter.title}</h2>
      <p>{frame.problem}</p>
      <div className="discussion-question">
        <b>Ask the room</b>
        <p>{frame.question}</p>
      </div>
      <p>
        <b>Outcome to test:</b> {frame.outcome}
      </p>
      <div className="discussion-fields">
        <label>
          Is this worth prioritizing?
          <select
            value={finding.priority}
            onChange={(e) => onChange({ priority: e.target.value })}
          >
            {priorities.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label>
          Does this happen today?
          <select
            value={finding.process}
            onChange={(e) => onChange({ process: e.target.value })}
          >
            {[
              "Unknown",
              "Established process",
              "Informal workaround",
              "Not done today",
            ].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label>
          Business outcome we want
          <input
            placeholder={frame.outcome}
            value={finding.businessOutcome || ""}
            onChange={(e) => onChange({ businessOutcome: e.target.value })}
          />
        </label>
        <label>
          What must we prove first?
          <textarea
            value={finding.proof}
            onChange={(e) => onChange({ proof: e.target.value })}
          />
        </label>
        <label className="discussion-wide">
          What did the room say?
          <textarea
            placeholder="Examples, disagreements, missing work or a different problem to solve…"
            value={finding.note}
            onChange={(e) => onChange({ note: e.target.value })}
          />
        </label>
      </div>
      <footer>
        <button onClick={onSave}>Save discussion</button>
        <small>Autosaves · carries into current state and the readout</small>
      </footer>
    </section>
  );
}
