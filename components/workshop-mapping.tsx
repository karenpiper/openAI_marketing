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
export function CaseFocus({ session, setSession }: Props) {
  const cases = activeCases(session);
  return (
    <div className="case-focus">
      <span className="label">Working on</span>
      <div className="case-pills">
        {cases.map((c) => (
          <button
            key={c.id}
            aria-pressed={session.focus === c.id}
            className={session.focus === c.id ? "selected" : ""}
            onClick={() => setSession((s) => ({ ...s, focus: c.id }))}
          >
            {c.title}
          </button>
        ))}
      </div>
      {!cases.length && (
        <p>Select the working set in the use-case recap first.</p>
      )}
    </div>
  );
}
export function CurrentState({ session, setSession }: Props) {
  const [custom, setCustom] = useState("");
  const focus = activeCases(session).find((c) => c.id === session.focus);
  const list = session.capabilities.filter((c) => c.useCase === session.focus);
  function update(id: string, patch: Partial<Capability>) {
    setSession((s) => ({
      ...s,
      capabilities: s.capabilities.map((c) =>
        c.id === id
          ? {
              ...c,
              ...patch,
              ...(!("status" in patch) ? { status: "Proposed" as const } : {}),
            }
          : c,
      ),
    }));
  }
  function add(name: string) {
    if (!focus || !name.trim()) return;
    setSession((s) => ({
      ...s,
      capabilities: [
        ...s.capabilities,
        {
          id: newId(),
          useCase: focus.id,
          name: name.trim(),
          system: "",
          fit: "Unknown",
          owner: "",
          evidence: "",
          gap: "",
          status: "Unknown",
        },
      ],
    }));
    setCustom("");
  }
  return (
    <section className="module-panel">
      <div className="module-heading">
        <span className="eyebrow">
          02 · Current-state capability reuse · 30 minutes
        </span>
        <h1>What can we build on?</h1>
        <p>
          For each selected problem, name the capability, what it does today and
          what still needs work. Unknown is a useful answer.
        </p>
      </div>
      <details className="starting-context">
        <summary>Starting context from the earlier conversations</summary>
        <p>
          Cohort identification and launching were described as working for the
          SMB / single-buyer motion. That does not establish buying-group
          coverage. The supplied diagram also identifies CRM and offer tools as
          already built.
        </p>
        <p>
          Check the current capability and its scope with the operators. Discuss
          Codex / ChatGPT Work, product and growth infrastructure, data, Marketo
          and internal tooling. Record evidence below; these prompts are not new
          confirmations from this room.
        </p>
      </details>
      <CaseFocus session={session} setSession={setSession} />
      {focus && (
        <>
          <div className="question-banner">
            <span className="label">Ask the room</span>
            <h2>What already exists to help us prove this?</h2>
            <p>{session.assessments[focus.id].proofText}</p>
          </div>
          <div className="capture-layout">
            <div>
              <div className="seed-picker">
                <span className="label">Start with a capability</span>
                {layerSeeds.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => add(l.title)}
                    disabled={list.some((c) => c.name === l.title)}
                  >
                    + {l.title}
                  </button>
                ))}
              </div>
              <div className="inline-add">
                <Field
                  label="Another capability"
                  value={custom}
                  onChange={setCustom}
                  placeholder="A capability the room names"
                />
                <button onClick={() => add(custom)} disabled={!custom.trim()}>
                  Add
                </button>
              </div>
              {list.map((c) => (
                <article className="capture-card" key={c.id}>
                  <div className="card-heading">
                    <h3>{c.name}</h3>
                    <Badge value={c.status} />
                  </div>
                  <div className="field-grid">
                    <Field
                      label="System or tool"
                      value={c.system}
                      onChange={(v) => update(c.id, { system: v })}
                      placeholder="Codex, data platform, Marketo, internal tooling…"
                    />
                    <Select
                      label="What do we need to do?"
                      value={c.fit}
                      options={["Unknown", "Reuse", "Extend", "Missing"]}
                      onChange={(v) =>
                        update(c.id, { fit: v as Capability["fit"] })
                      }
                    />
                    <Field
                      label="Who can verify it?"
                      value={c.owner}
                      onChange={(v) => update(c.id, { owner: v })}
                    />
                    <StatusField
                      value={c.status}
                      canConfirm={
                        !!c.owner.trim() &&
                        !!c.evidence.trim() &&
                        (c.fit === "Missing" || !!c.system.trim()) &&
                        c.fit !== "Unknown"
                      }
                      onChange={(v) => update(c.id, { status: v })}
                    />
                  </div>
                  <Field
                    label="What works today? Evidence or correction"
                    multiline
                    value={c.evidence}
                    onChange={(v) => update(c.id, { evidence: v })}
                    placeholder="What has been demonstrated? What does the operator say?"
                  />
                  <Field
                    label="What is missing or needs extending?"
                    multiline
                    value={c.gap}
                    onChange={(v) => update(c.id, { gap: v })}
                  />
                  <button
                    className="quiet danger"
                    onClick={() => {
                      if (confirm("Remove this capability and its notes?"))
                        setSession((s) => ({
                          ...s,
                          capabilities: s.capabilities.filter(
                            (x) => x.id !== c.id,
                          ),
                        }));
                    }}
                  >
                    Remove capability
                  </button>
                </article>
              ))}
              {!list.length && (
                <div className="empty-state">
                  Add a capability above as the room names it. Nothing is
                  assumed to be built.
                </div>
              )}
            </div>
            <aside className="live-summary">
              <span className="eyebrow">Returning to the room</span>
              <h2>Here’s what we have.</h2>
              {["Reuse", "Extend", "Missing", "Unknown"].map((f) => (
                <div key={f}>
                  <h3>
                    {f} <span>{list.filter((c) => c.fit === f).length}</span>
                  </h3>
                  {list
                    .filter((c) => c.fit === f)
                    .map((c) => (
                      <p key={c.id}>
                        {c.name}
                        <Badge value={c.status} />
                      </p>
                    ))}
                </div>
              ))}
              <p className="muted">
                Read this back. Confirm what the room agrees on; keep disputed
                items visible.
              </p>
            </aside>
          </div>
        </>
      )}
    </section>
  );
}

export function Architecture({ session, setSession }: Props) {
  const [layer, setLayer] = useState("surface");
  const [from, setFrom] = useState("surface");
  const [to, setTo] = useState("content");
  const [title, setTitle] = useState("");
  const focus = activeCases(session).find((c) => c.id === session.focus);
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
          Use the supplied architecture as a starting proposal. Assign
          responsibility, state and controls for the selected use case.
        </p>
      </div>
      <CaseFocus session={session} setSession={setSession} />
      {focus && (
        <>
          <div className="question-banner">
            <span className="label">Ask the room</span>
            <h2>Who owns each part, and what passes between them?</h2>
            <p>
              {focus.title} · {session.assessments[focus.id].proofText}
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
              <details className="reference-details">
                <summary>View supplied architecture reference</summary>
                <a
                  href="/workshop-architecture.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open original diagram
                </a>
                <img
                  src="/workshop-architecture.png"
                  alt="Supplied architecture: OpenAI interfaces, data lake and existing tools; Adobe capabilities; events, marketing CRM and website feeding journey measurement."
                />
              </details>
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
                    {u.title}
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
    </section>
  );
}
