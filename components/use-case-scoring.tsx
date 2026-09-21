import {
  type CandidateAssessment,
  type Scorecard,
} from "../lib/agent-workspace";
import { useCaseCandidates } from "../lib/use-case-candidates";

const axes = [
  ["frequency", "Frequency", "How often does this happen?"],
  ["severity", "Severity", "What does it cost when it happens?"],
  ["evidence", "Evidence", "How sure are we the problem is real?"],
  ["leverage", "Leverage", "How much would fixing it matter?"],
  ["opportunity", "Est. opportunity", "What is the likely upside if proven?"],
  ["effort", "LOE", "What will a useful first version take?"],
] as const;

export function prioritySignal(f: { scores: Scorecard }) {
  const { frequency, severity, evidence, leverage, opportunity, effort } =
    f.scores;
  const value = Math.pow(
    frequency * severity * evidence * leverage * opportunity,
    1 / 5,
  );
  return Math.max(0, value - (effort - 3) * 0.35);
}

export default function UseCaseScoring({
  assessments,
  onChange,
  onContinue,
}: {
  assessments: Record<string, CandidateAssessment>;
  onChange: (id: string, patch: Partial<CandidateAssessment>) => void;
  onContinue: () => void;
}) {
  const ranked = [...useCaseCandidates].sort(
    (a, b) =>
      prioritySignal(assessments[b.id]) - prioritySignal(assessments[a.id]),
  );
  return (
    <main className="agent-wide scoring-page">
      <span className="agent-kicker">
        Step 2 · What Morgan’s day surfaced · 15 minutes
      </span>
      <h1>Name the use cases, then make the trade-offs visible.</h1>
      <p className="agent-lede">
        These are the repeatable needs that emerged from Morgan’s day and the
        conversations around it. Score them as a room. The first five dimensions
        describe value and confidence; level of effort adjusts the signal so a
        promising near-term test can rise above a large, uncertain program.
      </p>
      <div className="scoring-legend">
        <b>1 = low / 5 = high.</b>
        <span>
          Frequency, severity, evidence, leverage and estimated opportunity
          raise the signal. LOE lowers it.
        </span>
        <span>
          The room—not the calculation—chooses the final priority set.
        </span>
        <span>
          Sub-use cases make each parent use case concrete. Score the parent,
          not every prompt individually.
        </span>
      </div>
      <div className="scoring-table-wrap">
        <table className="scoring-table">
          <thead>
            <tr>
              <th>Candidate use case</th>
              {axes.map(([key, label, question]) => (
                <th key={key} title={question}>
                  <abbr title={question}>{label}</abbr>
                </th>
              ))}
              <th>Signal</th>
              <th>Room decision</th>
            </tr>
          </thead>
          <tbody>
            {useCaseCandidates.map((candidate) => {
              const assessment = assessments[candidate.id];
              return (
                <tr key={candidate.id}>
                  <td>
                    <small>
                      {candidate.time} · {candidate.source}
                    </small>
                    <b>{candidate.title}</b>
                    <span>{candidate.short}</span>
                    <ul
                      className="sub-use-case-list"
                      aria-label={`${candidate.title} sub-use cases`}
                    >
                      {candidate.subUseCases.map((subUseCase) => (
                        <li key={subUseCase}>{subUseCase}</li>
                      ))}
                    </ul>
                  </td>
                  {axes.map(([key]) => (
                    <td key={key}>
                      <select
                        aria-label={`${candidate.title}: ${key}`}
                        value={assessment.scores[key]}
                        onChange={(e) =>
                          onChange(candidate.id, {
                            scores: {
                              ...assessment.scores,
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
                    </td>
                  ))}
                  <td>
                    <strong className="table-signal">
                      {prioritySignal(assessment).toFixed(1)}
                    </strong>
                  </td>
                  <td>
                    <select
                      aria-label={`${candidate.title}: room decision`}
                      value={assessment.priority}
                      onChange={(e) =>
                        onChange(candidate.id, { priority: e.target.value })
                      }
                    >
                      <option>To discuss</option>
                      <option>Priority</option>
                      <option>Later</option>
                      <option>Not needed</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <section className="priority-landing">
        <span className="agent-kicker">Working priority set</span>
        <h2>
          {
            ranked.filter((c) => assessments[c.id].priority === "Priority")
              .length
          }{" "}
          selected by the room
        </h2>
        <p>
          {ranked
            .slice(0, 5)
            .map(
              (c, i) =>
                `${i + 1}. ${c.title} · ${prioritySignal(assessments[c.id]).toFixed(1)}`,
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
