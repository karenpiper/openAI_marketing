import { chapters, type Finding } from "../lib/agent-workspace";

const axes = [
  ["frequency", "Frequency", "How often does this happen?", "Rare", "Constant"],
  [
    "severity",
    "Severity",
    "What does it cost when it happens?",
    "Minor",
    "Deal-breaking",
  ],
  [
    "evidence",
    "Evidence",
    "How sure are we the problem is real?",
    "Guess",
    "Directly heard",
  ],
  [
    "leverage",
    "Leverage",
    "How much would fixing it matter?",
    "Nice to have",
    "One of the biggest bets",
  ],
  [
    "opportunity",
    "Estimated opportunity",
    "What is the likely upside if proven?",
    "Limited",
    "Material",
  ],
  [
    "effort",
    "Level of effort",
    "What will it take to prove a useful first version?",
    "Small test",
    "Major program",
  ],
] as const;

export function prioritySignal(f: Finding) {
  const { frequency, severity, evidence, leverage, opportunity, effort } =
    f.scores;
  const value = Math.pow(
    frequency * severity * evidence * leverage * opportunity,
    1 / 5,
  );
  return Math.max(0, value - (effort - 3) * 0.35);
}

export default function UseCaseScoring({
  findings,
  onChange,
  onContinue,
}: {
  findings: Record<string, Finding>;
  onChange: (id: string, patch: Partial<Finding>) => void;
  onContinue: () => void;
}) {
  const ranked = [...chapters].sort(
    (a, b) => prioritySignal(findings[b.id]) - prioritySignal(findings[a.id]),
  );
  return (
    <main className="agent-wide scoring-page">
      <span className="agent-kicker">
        Step 2 · Score the use cases · 15 minutes
      </span>
      <h1>Make the trade-offs visible.</h1>
      <p className="agent-lede">
        Score the candidate problems as a room. The first five dimensions
        describe value and confidence; level of effort adjusts the signal so a
        promising near-term test can rise above a large, uncertain program.
      </p>
      <div className="scoring-legend">
        <b>Priority signal = value and confidence, adjusted for effort.</b>
        <span>
          It is a decision aid, not an automatic answer. The room chooses the
          final priority set.
        </span>
      </div>
      <div className="scoring-cases">
        {chapters.map((chapter) => {
          const finding = findings[chapter.id];
          const score = prioritySignal(finding);
          return (
            <article key={chapter.id}>
              <header>
                <div>
                  <span className="agent-kicker">
                    {chapter.time} · Candidate use case
                  </span>
                  <h2>{chapter.title}</h2>
                  <p>{chapter.short}</p>
                </div>
                <strong className="priority-signal">
                  {score.toFixed(1)}
                  <small>/ 5</small>
                </strong>
              </header>
              <div className="score-grid">
                {axes.map(([key, label, question, low, high]) => (
                  <label key={key}>
                    <b>{label}</b>
                    <small>{question}</small>
                    <select
                      value={finding.scores[key]}
                      onChange={(e) =>
                        onChange(chapter.id, {
                          scores: {
                            ...finding.scores,
                            [key]: Number(e.target.value),
                          },
                        })
                      }
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <span>
                      {low} <i /> {high}
                    </span>
                  </label>
                ))}
              </div>
              <div className="priority-choice">
                <div>
                  <b>Room decision</b>
                  <p>
                    {finding.priority === "Priority"
                      ? "Carry into the priority set."
                      : "Leave as a candidate, later consideration, or rule out."}
                  </p>
                </div>
                <select
                  value={finding.priority}
                  onChange={(e) =>
                    onChange(chapter.id, { priority: e.target.value })
                  }
                >
                  <option>To discuss</option>
                  <option>Priority</option>
                  <option>Later</option>
                  <option>Not needed</option>
                </select>
              </div>
            </article>
          );
        })}
      </div>
      <section className="priority-landing">
        <span className="agent-kicker">Working priority set</span>
        <h2>
          {ranked.filter((c) => findings[c.id].priority === "Priority").length}{" "}
          selected by the room
        </h2>
        <p>
          {ranked
            .map(
              (c, i) =>
                `${i + 1}. ${c.title} · ${prioritySignal(findings[c.id]).toFixed(1)}`,
            )
            .join("  ·  ")}
        </p>
        <button className="agent-primary" onClick={onContinue}>
          Explore one representative workflow →
        </button>
      </section>
    </main>
  );
}
