import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  type Session,
  type Lab,
  type Audience,
  type Draft,
  activeCases,
  practiceLab,
  practiceDraft,
  signature,
  draftCurrent,
  newId,
} from "../lib/workshop";
import { validateInput, validateVariants } from "../lib/generation";
import { Field, Select, StatusField, Badge } from "./workshop-fields";
export default function ContentLab({
  session,
  setSession,
}: {
  session: Session;
  setSession: Dispatch<SetStateAction<Session>>;
}) {
  const lab = session.lab;
  const [configured, setConfigured] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [consent, setConsent] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    fetch("/api/generate")
      .then((r) => r.json())
      .then((r) => {
        if (mounted.current) setConfigured(r.configured === true);
      })
      .catch(() => {});
    return () => {
      mounted.current = false;
      controller.current?.abort();
    };
  }, []);
  function patch(p: Partial<Lab>) {
    setSession((s) => ({
      ...s,
      lab: {
        ...s.lab,
        ...p,
        ...(!("status" in p) ? { status: "Proposed" as const } : {}),
      },
    }));
  }
  function audience(id: string, p: Partial<Audience>) {
    patch({
      audiences: lab.audiences.map((a) => (a.id === id ? { ...a, ...p } : a)),
    });
  }
  function review(id: string, p: Partial<Draft>) {
    patch({
      drafts: lab.drafts.map((d) =>
        d.id === id
          ? {
              ...d,
              ...p,
              ...("body" in p || "subject" in p || "headline" in p
                ? { review: "Pending" as const }
                : {}),
            }
          : d,
      ),
    });
  }
  async function generate(mode: "Practice" | "AI", only?: string) {
    setError("");
    const chosen = lab.audiences.filter((a) => !only || a.id === only);
    let input;
    try {
      input = validateInput({ ...lab, audiences: chosen });
    } catch (e) {
      setError((e as Error).message);
      return;
    }
    if (mode === "AI" && !consent) {
      setError(
        "Confirm that this source and audience context can be sent for drafting.",
      );
      return;
    }
    const snapshot = structuredClone(lab);
    const start = Date.now();
    setBusy(true);
    setElapsed(0);
    const ticker = setInterval(
      () => setElapsed(Math.floor((Date.now() - start) / 1000)),
      1000,
    );
    try {
      let drafts: Omit<Draft, "id" | "createdAt" | "seconds">[];
      if (mode === "Practice")
        drafts = chosen.map((a) => practiceDraft(snapshot, a));
      else {
        controller.current = new AbortController();
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-workshop-code": code,
          },
          body: JSON.stringify(input),
          signal: controller.current.signal,
        });
        const result = await response.json();
        if (!response.ok) throw Error(result.error || "Drafting failed.");
        drafts = validateVariants(result, chosen).map((v) => {
          const a = chosen.find((a) => a.id === v.audienceId)!;
          return {
            ...v,
            audienceName: a.name,
            signature: signature(snapshot, a),
            mode: "AI",
            review: "Pending",
            note: "",
          };
        });
      }
      if (!mounted.current) return;
      setSession((s) => ({
        ...s,
        lab: {
          ...s.lab,
          status: "Proposed",
          drafts: [
            ...s.lab.drafts.filter(
              (d) => !chosen.some((a) => a.id === d.audienceId),
            ),
            ...drafts.map((d) => {
              const previous = s.lab.drafts.find(
                (x) => x.audienceId === d.audienceId,
              );
              return {
                ...d,
                id: newId(),
                createdAt: new Date().toISOString(),
                seconds: Math.max(0, (Date.now() - start) / 1000),
                ...(previous
                  ? {
                      previous: {
                        subject: previous.subject,
                        body: previous.body,
                        headline: previous.headline,
                      },
                    }
                  : {}),
              };
            }),
          ],
        },
      }));
    } catch (e) {
      if (mounted.current)
        setError(
          (e as Error).name === "AbortError"
            ? "Generation cancelled. Existing drafts are unchanged."
            : (e as Error).message,
        );
    } finally {
      clearInterval(ticker);
      if (mounted.current) setBusy(false);
    }
  }
  const currentDrafts = lab.drafts.filter((d) => draftCurrent(lab, d));
  const usable = currentDrafts.filter((d) => d.review === "Usable");
  return (
    <section className="module-panel">
      <div className="module-heading">
        <span className="eyebrow">
          03 · Optional live build · Suggested timebox: 15 minutes within
          architecture
        </span>
        <h1>One source. Relevant content at scale.</h1>
        <p>
          Define the audiences together, make the constraints explicit, then
          change something and see what happens. Every variant needs a human
          review.
        </p>
      </div>
      <div className="question-banner">
        <span className="label">Proof for the room</span>
        <h2>
          Can one marketer create useful content for several audiences with less
          production effort?
        </h2>
        <p>
          Practice mode assembles editable templates locally. AI drafting uses
          the source and audience context you choose to send.
        </p>
      </div>
      <div className="lab-status">
        <Badge value={lab.sourceStatus} />
        <span>
          {currentDrafts.length} current drafts · {usable.length} marked usable
          in the exercise
        </span>
        <span>
          {configured
            ? "AI connection configured"
            : "Practice mode ready · AI not connected"}
        </span>
      </div>
      <div className="capture-card">
        <div className="card-heading">
          <h2>1. Source & guardrails</h2>
          <button
            className="quiet"
            disabled={busy}
            onClick={() => {
              if (
                confirm(
                  "Replace the exercise and its drafts with the fictional practice brief?",
                )
              )
                patch(practiceLab());
            }}
          >
            Load practice brief
          </button>
        </div>
        <div className="field-grid">
          <div className="capture-field">
            <label htmlFor="lab-use-case">Related priority use case</label>
            <select
              id="lab-use-case"
              value={lab.useCase}
              onChange={(e) => patch({ useCase: e.target.value })}
            >
              <option value="">Choose…</option>
              {!activeCases(session).some((u) => u.id === lab.useCase) &&
                lab.useCase && (
                  <option value={lab.useCase}>
                    Content exercise (not in working set)
                  </option>
                )}
              {activeCases(session).map((u) => (
                <option value={u.id} key={u.id}>
                  {u.title}
                </option>
              ))}
            </select>
          </div>
          <Select
            label="Source status"
            value={lab.sourceStatus}
            options={["Practice", "Approved for exercise"]}
            onChange={(v) => patch({ sourceStatus: v as Lab["sourceStatus"] })}
          />
          <Field
            label="Source title"
            value={lab.title}
            onChange={(v) => patch({ title: v })}
          />
          <Field
            label="Approved for exercise by"
            value={lab.approvedBy}
            onChange={(v) => patch({ approvedBy: v })}
            placeholder="Required for a real approved source"
          />
        </div>
        <Field
          label="Source material"
          multiline
          value={lab.source}
          onChange={(v) => patch({ source: v })}
          placeholder="Paste an approved asset or use the fictional practice brief."
        />
        <div className="field-grid">
          <Field
            label="Fixed claims, exact wording and exclusions"
            multiline
            value={lab.fixed}
            onChange={(v) => patch({ fixed: v })}
          />
          <Field
            label="Tone, length and what can change"
            multiline
            value={lab.guidance}
            onChange={(v) => patch({ guidance: v })}
          />
        </div>
        <p className="muted">
          No approved source has been supplied yet. The starter is fictional and
          makes no product claims. Replacing the brief marks existing drafts
          outdated.
        </p>
      </div>
      <h2 className="section-title">2. Who needs a different message?</h2>
      <div className="audience-grid">
        {lab.audiences.map((a, i) => (
          <article className="capture-card" key={a.id}>
            <div className="card-heading">
              <span className="eyebrow">Audience {i + 1}</span>
              <button
                className="quiet danger"
                disabled={busy || lab.audiences.length <= 1}
                onClick={() => {
                  if (confirm("Remove this audience and its draft?"))
                    patch({
                      audiences: lab.audiences.filter((x) => x.id !== a.id),
                      drafts: lab.drafts.filter((d) => d.audienceId !== a.id),
                    });
                }}
              >
                Remove
              </button>
            </div>
            <Field
              label="Audience name"
              value={a.name}
              onChange={(v) => audience(a.id, { name: v })}
            />
            <Field
              label="Observed signal / inclusion rule"
              multiline
              value={a.signal}
              onChange={(v) => audience(a.id, { signal: v })}
            />
            <Field
              label="What do they need next?"
              multiline
              value={a.need}
              onChange={(v) => audience(a.id, { need: v })}
            />
            <Field
              label="Call to action"
              value={a.cta}
              onChange={(v) => audience(a.id, { cta: v })}
            />
          </article>
        ))}
      </div>
      <button
        disabled={busy || lab.audiences.length >= 6}
        onClick={() =>
          patch({
            audiences: [
              ...lab.audiences,
              { id: newId(), name: "", signal: "", need: "", cta: "" },
            ],
          })
        }
      >
        + Add audience
      </button>
      <div className="generation-bar">
        <div>
          <h2>3. Draft and challenge it</h2>
          <p>
            One email and one landing-page headline per audience. Change a need
            or constraint and regenerate to compare.
          </p>
        </div>
        <div className="generation-controls">
          <button disabled={busy} onClick={() => generate("Practice")}>
            Assemble practice drafts
          </button>
          {configured && (
            <>
              <Field
                label="Facilitator access code"
                type="password"
                value={code}
                onChange={setCode}
              />
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />{" "}
                This brief and audience context may be sent to OpenAI for
                drafting.
              </label>
              <button
                className="primary"
                disabled={busy || !code || !consent}
                onClick={() => generate("AI")}
              >
                Generate AI drafts
              </button>
            </>
          )}
          {busy && (
            <>
              <span role="status">Drafting · {elapsed}s</span>
              <button onClick={() => controller.current?.abort()}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
      {!lab.drafts.length && (
        <div className="empty-state">
          Your audience-specific drafts will appear here. Start with practice
          mode to rehearse the interaction.
        </div>
      )}
      <div className="draft-grid">
        {lab.drafts.map((d) => (
          <article className="capture-card draft-card" key={d.id}>
            <div className="card-heading">
              <h3>{d.audienceName}</h3>
              <Badge value={draftCurrent(lab, d) ? d.review : "Outdated"} />
            </div>
            <span className="eyebrow">
              {d.mode === "Practice"
                ? "Practice template · not AI-generated"
                : "AI-generated · human review required"}
            </span>
            {!draftCurrent(lab, d) && (
              <p className="notice">
                Source or audience changed. Regenerate before marking this
                usable.
              </p>
            )}
            <Field
              label="Email subject"
              value={d.subject}
              onChange={(v) => review(d.id, { subject: v })}
            />
            <Field
              label="Email body"
              multiline
              value={d.body}
              onChange={(v) => review(d.id, { body: v })}
            />
            <Field
              label="Landing-page headline"
              value={d.headline}
              onChange={(v) => review(d.id, { headline: v })}
            />
            <p className="muted">{d.rationale}</p>
            {d.previous && (
              <details>
                <summary>Compare previous version</summary>
                <h4>{d.previous.subject}</h4>
                <p className="preserve-lines">{d.previous.body}</p>
                <p>
                  <b>Headline:</b> {d.previous.headline}
                </p>
              </details>
            )}
            <fieldset
              disabled={!draftCurrent(lab, d)}
              className="review-fieldset"
            >
              <Select
                label="Room review"
                value={d.review}
                options={["Pending", "Usable", "Needs edits", "Rejected"]}
                onChange={(v) => review(d.id, { review: v as Draft["review"] })}
              />
            </fieldset>
            <Field
              label="What needs changing / why is it usable?"
              multiline
              value={d.note}
              onChange={(v) => review(d.id, { note: v })}
            />
            <button
              disabled={busy}
              onClick={() => generate(d.mode, d.audienceId)}
            >
              Regenerate this audience
            </button>
            <small>
              Created {new Date(d.createdAt).toLocaleTimeString()} ·{" "}
              {d.seconds.toFixed(1)}s to assemble this batch
            </small>
          </article>
        ))}
      </div>
      <div className="capture-card">
        <h2>4. What did we actually prove?</h2>
        <div className="field-grid">
          <Field
            label="Usual production time for this batch (minutes)"
            value={lab.baseline}
            onChange={(v) => patch({ baseline: v })}
            type="number"
          />
          <Field
            label="Editing / review time in the exercise (minutes)"
            value={lab.editMinutes}
            onChange={(v) => patch({ editMinutes: v })}
            type="number"
          />
        </div>
        <Field
          label="What worked, what failed, and what blocks production?"
          multiline
          value={lab.result}
          onChange={(v) => patch({ result: v })}
          placeholder="Record the room’s judgment, not a generated conclusion."
        />
        <StatusField
          value={lab.status}
          canConfirm={!!lab.result.trim()}
          onChange={(v) => patch({ status: v })}
        />
        <p className="muted">
          {usable.length} of {lab.audiences.length} audiences have current
          drafts marked usable. This exercise tests content relevance and
          effort; it does not establish business lift or production-scale
          reliability.
        </p>
      </div>
    </section>
  );
}
