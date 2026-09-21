import SaveFooter from "./save-footer";
import { useState, type Dispatch, type SetStateAction } from "react";
import {
  type Session,
  type Capability,
  type Boundary,
  type Handoff,
  type Decision,
  layerSeeds,
  activeCases,
  newId,
} from "../lib/workshop";
import { decisions as contextDecisions, useCases } from "../lib/workshop-data";
import { Field, Select, StatusField, Badge } from "./workshop-fields";
type Props = {
  session: Session;
  setSession: Dispatch<SetStateAction<Session>>;
};
export default function ArchitectureDetails({ session, setSession }: Props) {
  const [layer, setLayer] = useState("surface");
  const [from, setFrom] = useState("surface");
  const [to, setTo] = useState("content");
  const title = session.draftDecisionTitle;
  const setTitle = (draftDecisionTitle: string) =>
    setSession((s) => ({ ...s, draftDecisionTitle }));
  const focus = useCases.find((c) => c.id === session.focus);
  const boundaries = session.boundaries.filter(
    (b) => b.useCase === session.focus,
  );
  const selected = boundaries.find((b) => b.layer === layer);
  const seed = layerSeeds.find((l) => l.id === layer)!;
  const capabilities = session.capabilities.filter(
    (c) => c.useCase === session.focus,
  );
  function edit(p: Partial<Boundary>) {
    setSession((s) => {
      const found = s.boundaries.find(
        (b) => b.useCase === s.focus && b.layer === layer,
      );
      const base: Boundary = found || {
        id: newId(),
        useCase: s.focus,
        layer,
        system: "",
        owner: "",
        implementer: "",
        truth: "",
        state: "",
        control: "",
        status: "Proposed",
      };
      const next = {
        ...base,
        ...p,
        ...(!("status" in p) ? { status: "Proposed" as const } : {}),
      };
      return {
        ...s,
        boundaries: found
          ? s.boundaries.map((b) => (b.id === found.id ? next : b))
          : [...s.boundaries, next],
      };
    });
  }
  function handoff(id: string, p: Partial<Handoff>) {
    setSession((s) => ({
      ...s,
      handoffs: s.handoffs.map((h) =>
        h.id === id
          ? {
              ...h,
              ...p,
              ...(!("status" in p) ? { status: "Proposed" as const } : {}),
            }
          : h,
      ),
    }));
  }
  function decision(id: string, p: Partial<Decision>) {
    setSession((s) => ({
      ...s,
      decisions: s.decisions.map((d) =>
        d.id === id
          ? {
              ...d,
              ...p,
              ...(!("status" in p) ? { status: "Proposed" as const } : {}),
            }
          : d,
      ),
    }));
  }
  return (
    <section className="module-panel">
      <div className="module-heading">
        <span className="eyebrow">
          03 · Target architecture & operating boundaries
        </span>
        <h1>Connect the work.</h1>
        <p>
          Capture the room’s proposed architecture. Assign responsibility, state
          and controls for the selected use case.
        </p>
      </div>

      {focus && (
        <>
          <div className="question-banner">
            <span className="label">Ask the room</span>
            <h2>Who owns each part, and what passes between them?</h2>
            <p>
              {focus.label} · {session.assessments[focus.id].proofText}
            </p>
          </div>
          <div className="architecture-layout">
            <div>
              <div
                className="architecture-map"
                aria-label="Proposed capability layers"
              >
                {layerSeeds.map((l) => {
                  const b = boundaries.find((b) => b.layer === l.id);
                  return (
                    <button
                      key={l.id}
                      className={`layer-node ${layer === l.id ? "selected" : ""}`}
                      onClick={() => setLayer(l.id)}
                      aria-pressed={layer === l.id}
                    >
                      <span className="label">
                        {b?.owner || `${l.boundary} · proposed`}
                      </span>
                      <strong>{l.title}</strong>
                      <small>{b?.system || l.suggestion}</small>
                      <Badge value={b?.status || "Unknown"} />
                    </button>
                  );
                })}
              </div>
              <p className="muted">
                Layout groups capabilities; it does not assert data flow.
                Explicit handoffs below define direction and payload.
              </p>
            </div>
            <div className="capture-card boundary-editor">
              <span className="eyebrow">Define the boundary</span>
              <h2>{seed.title}</h2>
              <p>{seed.purpose}</p>
              <p className="muted">
                Starting proposal: {seed.suggestion}. Assignments below remain
                blank until the room supplies them.
              </p>
              <div className="field-grid">
                <Field
                  label="System"
                  value={selected?.system || ""}
                  onChange={(v) => edit({ system: v })}
                />
                <Field
                  label="Accountable owner"
                  value={selected?.owner || ""}
                  onChange={(v) => edit({ owner: v })}
                  placeholder="Organization and named person"
                />
                <Field
                  label="Implementation responsibility"
                  value={selected?.implementer || ""}
                  onChange={(v) => edit({ implementer: v })}
                  placeholder="OpenAI / Adobe / C&T / shared"
                />
                <Field
                  label="Source of truth"
                  value={selected?.truth || ""}
                  onChange={(v) => edit({ truth: v })}
                />
              </div>
              <Field
                label="Where does state live?"
                value={selected?.state || ""}
                onChange={(v) => edit({ state: v })}
                placeholder="Audience membership, draft version, approval record…"
              />
              <Field
                label="Controls and approvals"
                multiline
                value={selected?.control || ""}
                onChange={(v) => edit({ control: v })}
              />
              <StatusField
                value={selected?.status || "Unknown"}
                canConfirm={
                  !!selected &&
                  [
                    selected.system,
                    selected.owner,
                    selected.implementer,
                    selected.truth,
                    selected.state,
                    selected.control,
                  ].every((v) => !!v.trim())
                }
                onChange={(v) => edit({ status: v })}
              />
              <details>
                <summary>
                  What step 2 established ({capabilities.length})
                </summary>
                {capabilities.length ? (
                  capabilities.map((c) => (
                    <p key={c.id}>
                      <b>
                        {c.name}: {c.fit}
                      </b>{" "}
                      · {c.system || "System unknown"} · {c.status}
                      <br />
                      {c.evidence}
                      <br />
                      {c.gap}
                    </p>
                  ))
                ) : (
                  <p>
                    No current-state capabilities captured for this use case.
                  </p>
                )}
              </details>
              <SaveFooter />
            </div>
          </div>
          <h2 className="section-title">Make the handoffs explicit</h2>
          <div className="inline-add">
            <Select
              label="From"
              value={from}
              options={layerSeeds.map((l) => l.id)}
              onChange={setFrom}
            />
            <Select
              label="To"
              value={to}
              options={layerSeeds.map((l) => l.id)}
              onChange={setTo}
            />
            <button
              disabled={from === to}
              onClick={() =>
                setSession((s) => ({
                  ...s,
                  handoffs: [
                    ...s.handoffs,
                    {
                      id: newId(),
                      useCase: s.focus,
                      from,
                      to,
                      payload: "",
                      trigger: "",
                      owner: "",
                      control: "",
                      status: "Proposed",
                    },
                  ],
                }))
              }
            >
              Add handoff →
            </button>
          </div>
          {session.handoffs
            .filter((h) => h.useCase === session.focus)
            .map((h) => (
              <article key={h.id} className="capture-card">
                <div className="card-heading">
                  <h3>
                    {layerSeeds.find((l) => l.id === h.from)?.title || h.from} →{" "}
                    {layerSeeds.find((l) => l.id === h.to)?.title || h.to}
                  </h3>
                  <Badge value={h.status} />
                </div>
                <div className="field-grid">
                  <Field
                    label="What passes across?"
                    value={h.payload}
                    onChange={(v) => handoff(h.id, { payload: v })}
                  />
                  <Field
                    label="When / what triggers it?"
                    value={h.trigger}
                    onChange={(v) => handoff(h.id, { trigger: v })}
                  />
                  <Field
                    label="Who owns this handoff?"
                    value={h.owner}
                    onChange={(v) => handoff(h.id, { owner: v })}
                  />
                  <Field
                    label="Control / failure handling"
                    value={h.control}
                    onChange={(v) => handoff(h.id, { control: v })}
                  />
                </div>
                <StatusField
                  value={h.status}
                  canConfirm={[h.payload, h.trigger, h.owner, h.control].every(
                    (v) => !!v.trim(),
                  )}
                  onChange={(v) => handoff(h.id, { status: v })}
                />
                <button
                  className="quiet danger"
                  onClick={() => {
                    if (confirm("Remove this handoff?"))
                      setSession((s) => ({
                        ...s,
                        handoffs: s.handoffs.filter((x) => x.id !== h.id),
                      }));
                  }}
                >
                  Remove handoff
                </button>
                <SaveFooter />
              </article>
            ))}
        </>
      )}
      <h2 className="section-title">Decisions to settle</h2>
      <p>
        The four background decisions now become working questions. Changes
        reopen confirmation.
      </p>
      {session.decisions.map((d) => (
        <article key={d.id} className="capture-card">
          <div className="card-heading">
            <h3>{d.title}</h3>
            <Badge value={d.status} />
          </div>
          {contextDecisions.find((x) => `d${x.num}` === d.id) && (
            <p className="muted">
              {contextDecisions.find((x) => `d${x.num}` === d.id)?.q}
            </p>
          )}
          <Field
            label="Decision, disagreement or unanswered question"
            multiline
            value={d.answer}
            onChange={(v) => decision(d.id, { answer: v })}
          />
          <div className="field-grid">
            <Field
              label="Accountable person"
              value={d.owner}
              onChange={(v) => decision(d.id, { owner: v })}
            />
            <Field
              label="Needed by"
              value={d.due}
              onChange={(v) => decision(d.id, { due: v })}
            />
            <div className="capture-field">
              <label htmlFor={`scope-${d.id}`}>Applies to</label>
              <select
                id={`scope-${d.id}`}
                value={d.useCase}
                onChange={(e) => decision(d.id, { useCase: e.target.value })}
              >
                <option value="">Workshop-wide</option>
                {useCases.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
            <StatusField
              value={d.status}
              canConfirm={!!d.answer.trim() && !!d.owner.trim()}
              onChange={(v) => decision(d.id, { status: v })}
            />
          </div>
          <SaveFooter />
        </article>
      ))}
      <div className="inline-add">
        <Field label="Another decision" value={title} onChange={setTitle} />
        <button
          disabled={!title.trim()}
          onClick={() => {
            setSession((s) => ({
              ...s,
              decisions: [
                ...s.decisions,
                {
                  id: newId(),
                  title: title.trim(),
                  useCase: s.focus,
                  answer: "",
                  owner: "",
                  due: "",
                  status: "Unknown",
                },
              ],
            }));
            setTitle("");
          }}
        >
          Add decision
        </button>
      </div>
      <SaveFooter />
    </section>
  );
}
