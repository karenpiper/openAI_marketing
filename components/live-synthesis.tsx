import type { Dispatch, SetStateAction } from "react";
import { type Session, type Synthesis } from "../lib/workshop";
import {
  currentQuestions,
  findAnswer,
  agreementLabel,
} from "../lib/workshop-guide";
import { interpretation, saveInterpretation } from "../lib/live-synthesis";
import { Field, Select, Badge } from "./workshop-fields";
type Props = {
  session: Session;
  setSession?: Dispatch<SetStateAction<Session>>;
  index?: number;
  architecture?: boolean;
};
export default function LiveSynthesis({
  session: s,
  setSession,
  index,
  architecture = false,
}: Props) {
  const questions = currentQuestions[s.focus];
  const rows = questions
    .map((q, i) => ({ q, i, a: findAnswer(s, s.focus, q) }))
    .filter(
      (r) => (index === undefined || r.i === index) && r.a?.evidence.trim(),
    );
  return (
    <section className="live-translation" aria-label="Live capability map">
      <span className="eyebrow">
        {architecture
          ? "From the room’s answers → proposed changes"
          : "Live interpretation · check with the room"}
      </span>
      <h2>
        {architecture
          ? "Build from what we just established"
          : "Does this describe what you need to do?"}
      </h2>
      <p>
        {architecture
          ? "Agreed findings stay linked to today’s evidence. Capture the change and who takes it forward here; use the questions below to work through the design."
          : "The capability name is suggested from the question being discussed. Evidence comes from your answer. These are editable suggestions, not confirmed findings or AI analysis."}
      </p>
      {!rows.length && (
        <p>Capture an answer in step 2 to see its suggested capability here.</p>
      )}
      {rows.map(({ q, i, a }) => {
        if (!a) return null;
        const v = interpretation(a, i);
        const save = (patch: Partial<Synthesis>) =>
          setSession?.((p) => saveInterpretation(p, s.focus, i, patch));
        const confirmed = v.status === "Confirmed" && !v.stale;
        return (
          <article className="capture-card" key={q.id}>
            <Badge
              value={
                v.stale ? "Answer changed · recheck" : agreementLabel(v.status)
              }
            />
            {setSession && !architecture ? (
              <Field
                label="We would call this capability…"
                value={v.name}
                onChange={(name) => save({ name })}
              />
            ) : (
              <h3>{v.name}</h3>
            )}
            <blockquote className="preserve-lines">{a.evidence}</blockquote>
            <small>
              Source: {q.question} · {agreementLabel(a.status)}
            </small>
            {a.system && (
              <p className="preserve-lines">
                <b>Tools and their roles</b>
                <br />
                {a.system}
              </p>
            )}
            {a.owner && (
              <p>
                <b>People involved today:</b> {a.owner}
              </p>
            )}
            {a.gap && (
              <p>
                <b>What works / needs work:</b> {a.gap}
              </p>
            )}
            <p className="muted">{v.reason}</p>
            {setSession && !architecture ? (
              <>
                <Select
                  label="How well can you do this today?"
                  value={v.coverage}
                  options={[
                    "Not established",
                    "Works today",
                    "Works with gaps",
                    "Not in place",
                  ]}
                  onChange={(coverage) =>
                    save({ coverage: coverage as Synthesis["coverage"] })
                  }
                />
                <div className="guide-links">
                  <button
                    disabled={
                      v.coverage === "Not established" ||
                      !v.name.trim() ||
                      a.status === "Disputed"
                    }
                    onClick={() => save({ status: "Confirmed" })}
                  >
                    Yes, that describes it
                  </button>
                  <button onClick={() => save({ status: "Disputed" })}>
                    We disagree
                  </button>
                  <button onClick={() => save({ status: "Unknown" })}>
                    We don’t know yet
                  </button>
                </div>
                {a.status === "Disputed" && (
                  <p>
                    Resolve the disputed source answer before agreeing this
                    interpretation.
                  </p>
                )}
              </>
            ) : (
              <p>
                <b>Coverage:</b> {v.coverage}
              </p>
            )}
            {architecture && setSession ? (
              <>
                <Field
                  label="What should change?"
                  multiline
                  disabled={!confirmed}
                  value={v.change}
                  onChange={(change) => save({ change, status: "Confirmed" })}
                />
                <Field
                  label="Who takes this change forward?"
                  disabled={!confirmed}
                  value={v.nextOwner}
                  onChange={(nextOwner) =>
                    save({ nextOwner, status: "Confirmed" })
                  }
                />
                {!confirmed && (
                  <button
                    onClick={() =>
                      setSession((p) => ({
                        ...p,
                        stage: 1,
                        guide: { ...p.guide, current: i },
                        timer: {
                          stage: 1,
                          remaining: 1800,
                          runningSince: null,
                        },
                      }))
                    }
                  >
                    Check this interpretation in step 2 →
                  </button>
                )}
                <small>
                  These are planning notes. Architecture agreement is captured
                  separately below.
                </small>
              </>
            ) : (
              <>
                {v.change && (
                  <p>
                    <b>Change to discuss:</b> {v.change}
                  </p>
                )}
                {v.nextOwner && (
                  <p>
                    <b>Takes it forward:</b> {v.nextOwner}
                  </p>
                )}
              </>
            )}
          </article>
        );
      })}
    </section>
  );
}
