import ArchitectureWalkthrough from "./architecture-walkthrough";
import LiveSynthesis from "./live-synthesis";
import { CurrentReadback, ArchitectureReadback } from "./workshop-mapping";
import {
  currentQuestions,
  architectureQuestions,
  findAnswer,
  primaryLayer,
  primaryHandoff,
  agreementLabel,
} from "../lib/workshop-guide";
import {
  type Session,
  stages,
  activeCases,
  selectionConfirmed,
  layerSeeds,
  draftCurrent,
} from "../lib/workshop";
import { useCases, heard, decisions } from "../lib/workshop-data";
import { composite, rank } from "../lib/assessment";
import { Badge } from "./workshop-fields";
import WorkshopReadout from "./workshop-readout";
export default function RoomView({ session }: { session: Session }) {
  const s = session;
  const u = useCases[s.scene - 2];
  const a = u ? s.assessments[u.id] : null;
  const focus = useCases.find((u) => u.id === s.focus);
  return (
    <div className="room-view">
      <header className="room-top">
        <span className="eyebrow">{s.title}</span>
        <span>
          {s.stage + 1} / 4 · {stages[s.stage].title}
        </span>
      </header>
      {s.stage === 0 && (
        <section className="room-stage">
          {s.scene === 0 ? (
            <>
              <span className="eyebrow">
                Today’s problems · A working hypothesis to correct
              </span>
              <h1>Meet Morgan.</h1>
              <p className="room-lede">
                Growth & ABM lead on OpenAI’s enterprise marketing team. This is
                a working hypothesis of her Tuesday today.
              </p>
              <div className="question-banner">
                <h2>
                  Which problems are real, and which are worth solving first?
                </h2>
              </div>
            </>
          ) : s.scene === 1 ? (
            <>
              <h1>What we heard.</h1>
              <div className="room-heard">
                {heard.map((h) => (
                  <p key={h.q}>“{h.q}”</p>
                ))}
              </div>
              <h2>Four decisions in the background</h2>
              <div className="summary-grid">
                {decisions.map((d) => (
                  <article className="side-card" key={d.num}>
                    <span className="eyebrow">Decision {d.num}</span>
                    <h3>{d.t}</h3>
                  </article>
                ))}
              </div>
              <p>
                We’ll resolve boundaries in step 3. First, establish which
                problems matter.
              </p>
            </>
          ) : s.scene === 9 ? (
            <>
              <h1>Which cases do we carry forward?</h1>
              <p className="room-lede">
                {selectionConfirmed(s)
                  ? `Working set confirmed by ${s.selectionBy}`
                  : "Candidate ranking. The room still needs to confirm the working set."}
              </p>
              {rank(s.assessments).map((c, i) => (
                <article className="room-rank" key={c.id}>
                  <span>{i + 1}</span>
                  <div>
                    <h2>{c.label}</h2>
                    <p>{s.assessments[c.id].proofText}</p>
                  </div>
                  <strong>{composite(s.assessments[c.id]).toFixed(1)}</strong>
                  <Badge
                    value={s.selected.includes(c.id) ? "Selected" : "Candidate"}
                  />
                </article>
              ))}
            </>
          ) : u && a ? (
            <>
              <span className="eyebrow">
                {u.chapter} · {u.time} · {u.label} · Current-state hypothesis
              </span>
              <h1>{u.title}</h1>
              <p className="room-lede">{u.narrative}</p>
              <div className="question-banner">
                <span className="label">Ask the room</span>
                <h2>{u.question}</h2>
              </div>
              <div className="room-evidence">
                <div>
                  <span className="label">The problem we think is real</span>
                  <p>{u.problem}</p>
                </div>
                <div>
                  <span className="label">Why we think this</span>
                  <p>{u.evidence}</p>
                </div>
              </div>
              <div className="room-scores">
                {(
                  ["frequency", "severity", "evidence", "leverage"] as const
                ).map((k) => (
                  <div key={k}>
                    <span>{k}</span>
                    <strong>{a[k]}</strong>
                  </div>
                ))}
                <div>
                  <span>Composite</span>
                  <strong>
                    {a.veto ? "Ruled out" : composite(a).toFixed(1)}
                  </strong>
                </div>
              </div>
              <p>
                Can move now:{" "}
                <b>
                  {a.noRegret === "unsure"
                    ? "Not sure"
                    : a.noRegret === "yes"
                      ? "Yes"
                      : "No"}
                </b>{" "}
                · {a.discussed ? "Discussed" : "Defaults — not discussed"}
              </p>
              <div className="room-return">
                <span className="label">What we’re hearing</span>
                <p className="preserve-lines">
                  {a.note || "Waiting for the room’s response."}
                </p>
                <span className="label">What do we need to prove?</span>
                <p>{a.proofText}</p>
              </div>
            </>
          ) : null}
        </section>
      )}
      {s.stage === 1 && (
        <section className="room-stage">
          <span className="eyebrow">What happens today · {focus?.label}</span>
          {s.guide.current === 4 ? (
            <>
              <h1>Have we captured this correctly?</h1>
              <LiveSynthesis session={s} />
            </>
          ) : (
            <>
              <h1>{currentQuestions[s.focus][s.guide.current].question}</h1>
              <p className="room-lede">
                {currentQuestions[s.focus][s.guide.current].hint}
              </p>
              {(() => {
                const a = findAnswer(
                  s,
                  s.focus,
                  currentQuestions[s.focus][s.guide.current],
                );
                return (
                  <div className="room-return">
                    <Badge value={agreementLabel(a?.status || "Unknown")} />
                    <p className="preserve-lines">
                      {a?.evidence || "Waiting for the room’s answer."}
                    </p>
                    <p className="preserve-lines">{a?.system}</p>
                    <p>{a?.owner}</p>
                    <p>{a?.gap}</p>
                  </div>
                );
              })()}
            </>
          )}
          {s.guide.current < 4 && (
            <LiveSynthesis session={s} index={s.guide.current} />
          )}
        </section>
      )}
      {s.stage === 2 && s.architectureTab === "map" && (
        <section className="room-stage">
          <span className="eyebrow">Proposed workflow · {focus?.label}</span>
          <ArchitectureWalkthrough session={s} room />
        </section>
      )}
      {s.stage === 2 && s.architectureTab === "lab" && (
        <section className="room-stage">
          <span className="eyebrow">
            Live content exercise · {s.lab.sourceStatus}
          </span>
          <h1>One source. Different needs.</h1>
          <p className="room-lede">{s.lab.title}</p>
          <div className="room-drafts">
            {s.lab.audiences.map((a) => {
              const d = s.lab.drafts.find((d) => d.audienceId === a.id);
              return (
                <article className="side-card" key={a.id}>
                  <h2>{a.name || "Audience to define"}</h2>
                  <p>{a.need}</p>
                  <span className="label">Signal</span>
                  <p>{a.signal}</p>
                  {d ? (
                    <>
                      <Badge
                        value={draftCurrent(s.lab, d) ? d.review : "Outdated"}
                      />
                      <span className="eyebrow">{d.mode} draft</span>
                      <h3>{d.subject}</h3>
                      <p className="preserve-lines">{d.body}</p>
                      <span className="label">Landing-page headline</span>
                      <h3>{d.headline}</h3>
                      <p>{d.note}</p>
                    </>
                  ) : (
                    <p className="muted">Draft will appear here.</p>
                  )}
                </article>
              );
            })}
          </div>
          <div className="question-banner">
            <h2>Would you use this? What would you change?</h2>
            <p>
              {s.lab.result ||
                "Record relevance, editing effort and what would prevent approval."}
            </p>
          </div>
        </section>
      )}
      {s.stage === 3 && <WorkshopReadout session={s} room />}
      <footer className="room-footer">
        Live room view · follows the facilitator on this browser profile ·{" "}
        {activeCases(s).length} selected use cases
      </footer>
    </div>
  );
}
