import { WorkflowSummary } from "./architecture-walkthrough";
import LiveSynthesis from "./live-synthesis";
import { type Dispatch, type SetStateAction } from "react";
import {
  type Session,
  type Action,
  activeCases,
  selectionConfirmed,
  draftCurrent,
  newId,
  layerSeeds,
} from "../lib/workshop";
import { useCases } from "../lib/workshop-data";
import { Field, StatusField, Badge } from "./workshop-fields";
export default function WorkshopReadout({
  session,
  setSession,
  room = false,
}: {
  session: Session;
  setSession?: Dispatch<SetStateAction<Session>>;
  room?: boolean;
}) {
  const cases = activeCases(session);
  const caseName = (id: string) =>
    (useCases.find((u) => u.id === id)?.label || "Workshop-wide") +
    (id && !cases.some((u) => u.id === id)
      ? " (outside current working set)"
      : "");
  function update(id: string, p: Partial<Action>) {
    setSession?.((s) => ({
      ...s,
      actions: s.actions.map((a) =>
        a.id === id
          ? {
              ...a,
              ...p,
              ...(!("status" in p) ? { status: "Proposed" as const } : {}),
            }
          : a,
      ),
    }));
  }
  const unresolved = session.decisions.filter(
    (d) => d.status !== "Confirmed" || !d.answer.trim(),
  );
  return (
    <section className="module-panel readout-module">
      <div className="module-heading">
        <span className="eyebrow">
          04 · Decisions, sequencing & Colin readout · 15 minutes
        </span>
        <h1>Here’s where we landed.</h1>
        <p>
          A live record of the room’s work. Confirm the choices and name the
          next action before closing.
        </p>
      </div>
      <div className="readout-metrics">
        <div>
          <strong>{cases.length}</strong>
          <span>selected use cases</span>
        </div>
        <div>
          <strong>
            {
              session.capabilities.filter((c) => c.status === "Confirmed")
                .length
            }
          </strong>
          <span>agreed current-state answers</span>
        </div>
        <div>
          <strong>{unresolved.length}</strong>
          <span>open / disputed decisions</span>
        </div>
        <div>
          <strong>
            {session.actions.filter((a) => !a.owner.trim()).length}
          </strong>
          <span>actions without owners</span>
        </div>
      </div>
      <p className={`notice ${selectionConfirmed(session) ? "success" : ""}`}>
        Working set:{" "}
        {selectionConfirmed(session)
          ? `confirmed by ${session.selectionBy}`
          : "needs confirmation in the use-case recap"}
        .
      </p>
      <h2 className="section-title">The priorities and their proof</h2>
      {!cases.length && (
        <p className="empty-state">No working set selected yet.</p>
      )}
      {cases.map((u) => (
        <article className="readout-card" key={u.id}>
          <div className="card-heading">
            <h3>{u.label}</h3>
            <Badge
              value={
                session.assessments[u.id].noRegret === "yes"
                  ? "Can move now"
                  : session.assessments[u.id].noRegret === "no"
                    ? "Needs a decision"
                    : "Not sure"
              }
            />
          </div>
          <dl>
            <div>
              <dt>Growth outcome</dt>
              <dd>{u.kpiGrowth}</dd>
            </div>
            <div>
              <dt>Productivity outcome</dt>
              <dd>{u.kpiProd}</dd>
            </div>
            <div>
              <dt>What do we need to prove?</dt>
              <dd>{session.assessments[u.id].proofText}</dd>
            </div>
          </dl>
          <p>
            <b>Dependency:</b> {u.dependsOn}
          </p>
          {session.assessments[u.id].note && (
            <blockquote>{session.assessments[u.id].note}</blockquote>
          )}
          <p className="muted">
            {session.capabilities.filter((c) => c.useCase === u.id).length}{" "}
            current-state answers ·{" "}
            {session.boundaries.filter((b) => b.useCase === u.id).length}{" "}
            boundaries discussed
          </p>
        </article>
      ))}
      <p className="preserve-lines">
        <b>Attendees:</b> {session.attendees || "Not recorded"}
      </p>
      <h2 className="section-title">Current-state findings</h2>
      {!session.capabilities.length && (
        <p>No current-state answers captured.</p>
      )}
      <div className="summary-grid">
        {useCases
          .filter((u) => session.capabilities.some((c) => c.useCase === u.id))
          .map((u) => (
            <article className="side-card" key={u.id}>
              <h3>{caseName(u.id)}</h3>
              {session.capabilities
                .filter((c) => c.useCase === u.id)
                .map((c) => (
                  <div className="summary-entry" key={c.id}>
                    <b>{c.name}</b>
                    <Badge value={c.status} />
                    <p className="preserve-lines">
                      {c.evidence || "Answer not captured"}
                    </p>
                    <p className="preserve-lines">
                      <b>Tools and roles:</b> {c.system || "Not captured"}
                    </p>
                    <p>
                      <b>People:</b> {c.owner || "Not captured"}
                    </p>
                    {c.gap && <p>What works / needs work: {c.gap}</p>}
                  </div>
                ))}
            </article>
          ))}
      </div>
      {useCases
        .filter((u) =>
          session.capabilities.some((c) => c.useCase === u.id && c.synthesis),
        )
        .map((u) => (
          <section key={u.id}>
            <h2>{caseName(u.id)}</h2>
            <LiveSynthesis session={{ ...session, focus: u.id }} architecture />
          </section>
        ))}
      <h2 className="section-title">Workflow decisions from step 3</h2>
      {useCases
        .filter((u) => session.workflowReviews.some((r) => r.useCase === u.id))
        .map((u) => (
          <section key={u.id}>
            <h3>{caseName(u.id)}</h3>
            <WorkflowSummary session={{ ...session, focus: u.id }} />
          </section>
        ))}
      <h2 className="section-title">Architecture & operating boundaries</h2>
      {!session.boundaries.length && <p>No boundaries captured.</p>}
      <div className="readout-table-wrap">
        <table className="readout-table">
          <thead>
            <tr>
              <th>Use case / capability</th>
              <th>Owner / system</th>
              <th>Truth, state & controls</th>
              <th>Agreement</th>
            </tr>
          </thead>
          <tbody>
            {session.boundaries.map((b) => (
              <tr key={b.id}>
                <td>
                  {caseName(b.useCase)}
                  <br />
                  <b>
                    {layerSeeds.find((l) => l.id === b.layer)?.title || b.layer}
                  </b>
                </td>
                <td>
                  {b.owner || "Unassigned"}
                  <br />
                  {b.system || "System unknown"}
                  <br />
                  Implementation: {b.implementer || "Unassigned"}
                </td>
                <td>
                  Truth: {b.truth || "Unknown"}
                  <br />
                  State: {b.state || "Unknown"}
                  <br />
                  Controls: {b.control || "Unknown"}
                </td>
                <td>
                  <Badge value={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {session.handoffs.map((h) => (
        <p className="handoff-summary" key={h.id}>
          <b>
            {h.from} → {h.to}
          </b>{" "}
          · {caseName(h.useCase)} · {h.status}
          <br />
          {h.payload || "Payload unknown"} · Trigger: {h.trigger || "Unknown"} ·
          Owner: {h.owner || "Unassigned"} · Control: {h.control || "Unknown"}
        </p>
      ))}
      <h2 className="section-title">Decisions made and still open</h2>
      <div className="decision-grid">
        {session.decisions.map((d) => (
          <article key={d.id} className="side-card">
            <Badge value={d.status} />
            <h3>{d.title}</h3>
            <p>{d.answer || "No answer captured"}</p>
            <p className="muted">
              {d.owner || "Owner unassigned"} · {d.due || "Timing not set"} ·{" "}
              {caseName(d.useCase)}
            </p>
          </article>
        ))}
      </div>
      <h2 className="section-title">Content-at-scale exercise</h2>
      <article className="readout-card">
        <div className="card-heading">
          <h3>{session.lab.title}</h3>
          <Badge value={session.lab.status} />
        </div>
        <p>
          {session.lab.sourceStatus} · {caseName(session.lab.useCase)} ·{" "}
          {
            session.lab.drafts.filter(
              (d) => draftCurrent(session.lab, d) && d.review === "Usable",
            ).length
          }{" "}
          of {session.lab.audiences.length} audiences with current drafts marked
          usable
        </p>
        <p>
          {session.lab.result || "The room has not recorded a conclusion yet."}
        </p>
        <p>
          Baseline: {session.lab.baseline || "not captured"} minutes ·
          Editing/review: {session.lab.editMinutes || "not captured"} minutes
        </p>
        <p className="muted">
          Practice drafts are templates. “Usable” is an exercise judgment, not
          production approval. No business lift has been established.
        </p>
      </article>
      <h2 className="section-title">
        What starts, what waits, and what Colin needs to decide
      </h2>
      {!session.actions.length && (
        <p className="empty-state">
          No next actions yet. Capture the sequence, owners and sponsorship
          before closing.
        </p>
      )}
      {session.actions.map((a, i) => (
        <article className="capture-card" key={a.id}>
          <div className="card-heading">
            <span className="readout-rank">
              {i + 1} · {caseName(a.useCase)}
            </span>
            <Badge value={a.status} />
          </div>
          {room ? (
            <>
              <h3>{a.task || "Untitled action"}</h3>
              <p>
                {a.owner || "Owner unassigned"} · {a.when || "Timing not set"}
              </p>
              <p>Blocked by: {a.blockedBy || "None captured"}</p>
              <p>Ask for Colin: {a.sponsorship || "None captured"}</p>
            </>
          ) : (
            <>
              <Field
                label="Next action / decision needed"
                multiline
                value={a.task}
                onChange={(v) => update(a.id, { task: v })}
              />
              <div className="field-grid">
                <div className="capture-field">
                  <label htmlFor={`action-case-${a.id}`}>Use case</label>
                  <select
                    id={`action-case-${a.id}`}
                    value={a.useCase}
                    onChange={(e) => update(a.id, { useCase: e.target.value })}
                  >
                    <option value="">Workshop-wide</option>
                    {useCases.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Field
                  label="Accountable person"
                  value={a.owner}
                  onChange={(v) => update(a.id, { owner: v })}
                />
                <Field
                  label="When / sequence"
                  value={a.when}
                  onChange={(v) => update(a.id, { when: v })}
                />
                <Field
                  label="Blocked by"
                  value={a.blockedBy}
                  onChange={(v) => update(a.id, { blockedBy: v })}
                />
              </div>
              <Field
                label="Decision or sponsorship needed from Colin"
                multiline
                value={a.sponsorship}
                onChange={(v) => update(a.id, { sponsorship: v })}
              />
              <StatusField
                value={a.status}
                canConfirm={[a.task, a.owner, a.when].every((v) => !!v.trim())}
                onChange={(v) => update(a.id, { status: v })}
              />
              <div className="action-reorder">
                <button
                  disabled={i === 0}
                  onClick={() =>
                    setSession?.((s) => {
                      const list = [...s.actions];
                      [list[i - 1], list[i]] = [list[i], list[i - 1]];
                      return { ...s, actions: list };
                    })
                  }
                >
                  Move earlier
                </button>
                <button
                  disabled={i === session.actions.length - 1}
                  onClick={() =>
                    setSession?.((s) => {
                      const list = [...s.actions];
                      [list[i], list[i + 1]] = [list[i + 1], list[i]];
                      return { ...s, actions: list };
                    })
                  }
                >
                  Move later
                </button>
                <button
                  className="quiet danger"
                  onClick={() => {
                    if (confirm("Remove this action?"))
                      setSession?.((s) => ({
                        ...s,
                        actions: s.actions.filter((x) => x.id !== a.id),
                      }));
                  }}
                >
                  Remove
                </button>
              </div>
            </>
          )}
        </article>
      ))}
      {!room && (
        <button
          onClick={() =>
            setSession?.((s) => ({
              ...s,
              actions: [
                ...s.actions,
                {
                  id: newId(),
                  useCase: s.focus,
                  task: "",
                  owner: "",
                  when: "",
                  blockedBy: "",
                  sponsorship: "",
                  status: "Proposed",
                },
              ],
            }))
          }
        >
          + Capture next action
        </button>
      )}
      <h2 className="section-title">Ruled out</h2>
      {useCases
        .filter((u) => session.assessments[u.id].veto)
        .map((u) => (
          <p key={u.id}>
            <b>{u.label}</b> ·{" "}
            {session.assessments[u.id].note || "No note captured"}
          </p>
        ))}
      {!useCases.some((u) => session.assessments[u.id].veto) && (
        <p>Nothing ruled out.</p>
      )}
      <h2 className="section-title">Parked for follow-up</h2>
      <p className="preserve-lines">{session.parking || "Nothing parked."}</p>
    </section>
  );
}
