import { useState } from "react";
import {
  type CandidateAssessment,
  type Scorecard,
} from "../lib/agent-workspace";
import { useCaseCandidates } from "../lib/use-case-candidates";

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
    "A guess",
    "Heard directly",
  ],
  [
    "leverage",
    "Leverage",
    "How much would fixing it matter?",
    "Nice to have",
    "A major bet",
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
    "What will a useful first version take?",
    "Light",
    "Heavy",
  ],
] as const;

type CandidateId = (typeof useCaseCandidates)[number]["id"];

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
  const [activeId, setActiveId] = useState<CandidateId>(
    useCaseCandidates[0].id,
  );
  const active =
    useCaseCandidates.find((candidate) => candidate.id === activeId) ||
    useCaseCandidates[0];
  const assessment = assessments[active.id];
  const ranked = [...useCaseCandidates].sort(
    (a, b) =>
      prioritySignal(assessments[b.id]) - prioritySignal(assessments[a.id]),
  );
  return (
    <main className="agent-wide scoring-page">
      <span className="agent-kicker">
        Step 2 · What Morgan’s day surfaced · 15 minutes
      </span>
      <h1>Work through one use case at a time.</h1>
      <p className="agent-lede">
        Start by deciding whether the need is real. Then score its importance,
        confidence and effort together. The room can move freely between use
        cases without losing anything.
      </p>
      <div className="scoring-legend">
        <b>Tap the point that best reflects the room’s view.</b>
        <span>
          The composite rewards importance and confidence, while accounting for
          effort.
        </span>
      </div>
      <div className="focus-scoring">
        <aside className="focus-case-nav" aria-label="Candidate use cases">
          {useCaseCandidates.map((candidate, i) => (
            <button
              key={candidate.id}
              onClick={() => setActiveId(candidate.id)}
              className={candidate.id === active.id ? "active" : ""}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <b>{candidate.title}</b>
              <small>
                {assessments[candidate.id].priority === "Priority"
                  ? "Priority"
                  : assessments[candidate.id].priority === "Not needed"
                    ? "Ruled out"
                    : "Review"}
              </small>
            </button>
          ))}
        </aside>
        <section className="focus-scorecard">
          <header>
            <div>
              <span className="agent-kicker">
                {active.time} · {active.source}
              </span>
              <h2>{active.title}</h2>
              <p>{active.short}</p>
            </div>
            <div className="focus-signal">
              <small>Composite score</small>
              <b>{prioritySignal(assessment).toFixed(1)}</b>
              <span>Value, confidence and effort</span>
            </div>
          </header>
          <div className="focus-subcases">
            {active.subUseCases.map((sub) => (
              <span key={sub}>{sub}</span>
            ))}
          </div>
          <section className="focus-decision">
            <div>
              <b>Does the room recognize this need?</b>
              <p>Rule it out if the problem is not real.</p>
            </div>
            <div>
              {[
                ["Priority", "Keep as a priority"],
                ["Later", "Worth revisiting"],
                ["Not needed", "Rule it out"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={
                    assessment.priority === value
                      ? `selected ${value.toLowerCase().replaceAll(" ", "-")}`
                      : ""
                  }
                  onClick={() => onChange(active.id, { priority: value })}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>
          <div className="focus-ratings">
            {axes.map(([key, label, question, low, high]) => (
              <section key={key}>
                <header>
                  <div>
                    <b>{label}</b>
                    <span>{question}</span>
                  </div>
                  <strong>{assessment.scores[key]}</strong>
                </header>
                <div
                  className="focus-scale"
                  role="radiogroup"
                  aria-label={`${active.title}: ${label}`}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      className={assessment.scores[key] === n ? "selected" : ""}
                      aria-checked={assessment.scores[key] === n}
                      onClick={() =>
                        onChange(active.id, {
                          scores: { ...assessment.scores, [key]: n },
                        })
                      }
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <footer>
                  <span>{low}</span>
                  <span>{high}</span>
                </footer>
              </section>
            ))}
          </div>
          <section className="move-now">
            <b>Can this move now?</b>
            <div>
              {["No", "Not sure", "Yes"].map((value) => (
                <button
                  key={value}
                  className={assessment.moveNow === value ? "selected" : ""}
                  onClick={() =>
                    onChange(active.id, {
                      moveNow: value as CandidateAssessment["moveNow"],
                    })
                  }
                >
                  {value}
                </button>
              ))}
            </div>
          </section>
        </section>
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
