"use client";
import { useEffect, useRef, useState } from "react";
import BackendIllustration from "./backend-illustration";
import type { AgentState } from "../lib/agent-workspace";
import {
  workStages,
  currentWorkStep,
  workSignature,
  workflowArtifact,
  artifactKey,
  workflowActivity,
} from "../lib/workflow-work";
export function WorkflowWork({
  session,
  id,
  onStep,
  onFinish,
  onEdit,
}: {
  session: AgentState;
  id: string;
  onStep: (n: number) => void;
  onFinish: () => void;
  onEdit: (
    key: string,
    rows: { name: string; status: string; detail: string }[],
  ) => void;
}) {
  const stages = workStages(session, id),
    index = currentWorkStep(session, id),
    stage = stages[index],
    signature = workSignature(session, id);
  const runKey = `${id}:${index}:${signature}`;
  const [run, setRun] = useState({ key: runKey, phase: 0 });
  const phase = run.key === runKey ? run.phase : 0;
  const [editing, setEditing] = useState(false);
  const [edited, setEdited] = useState(false);
  const [opened, setOpened] = useState<number | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const blocked = id === "s3" && session.source === "Source material missing";
  const actions = workflowActivity(session, id, index);
  useEffect(() => {
    setRun({ key: runKey, phase: 0 });
    setOpened(null);
    setEditing(false);
    setEdited(false);
    const timers = [1, 2, 3].map((n) =>
      setTimeout(
        () =>
          setRun((prev) => ({
            key: runKey,
            phase: prev.key === runKey ? Math.max(prev.phase, n) : n,
          })),
        n * 900,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, [runKey]);
  function showArtifact(n: number) {
    setOpened(n);
    requestAnimationFrame(() => {
      const screen = panel.current?.closest(".monitor-screen");
      if (screen && panel.current)
        screen.scrollTo({
          top:
            panel.current.getBoundingClientRect().top -
            screen.getBoundingClientRect().top +
            screen.scrollTop -
            55,
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
        });
    });
  }
  const output = opened === null ? null : workflowArtifact(session, id, opened);
  function download() {
    if (!output) return;
    const url = URL.createObjectURL(
      new Blob([output.text], { type: "text/markdown" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `DEMO-${output.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="work-artifact execution-work">
      <div className="work-track">
        {stages.map((s, i) => (
          <span
            key={s.title}
            className={i === index ? "active" : i < index ? "complete" : ""}
          >
            {i < index ? "✓" : i + 1} {s.title}
          </span>
        ))}
      </div>
      <div className="agent-execution" role="status" aria-live="polite">
        <span className={phase < 3 ? "execution-pulse" : ""}>✳</span>
        <div>
          <b>
            {phase < 3
              ? [
                  "Gathering the inputs…",
                  "Checking the context…",
                  "Preparing the output…",
                ][phase]
              : blocked
                ? "Source gap found"
                : "Work package ready"}
          </b>
          <small>
            {phase < 3
              ? "Simulated agent activity"
              : "Illustrative output · ready to inspect"}
          </small>
        </div>
        {phase < 3 && (
          <button onClick={() => setRun({ key: runKey, phase: 3 })}>
            Show result now
          </button>
        )}
      </div>
      <ol className="execution-log">
        {actions.slice(0, Math.min(phase + 1, 3)).map((action, i) => (
          <li key={action}>
            <span>{i < phase ? "✓" : "·"}</span>
            {action}
          </li>
        ))}
      </ol>
      {phase === 3 && (
        <>
          <div className="execution-reply">
            <b>Marketing agent</b>
            <p>
              {blocked
                ? "I couldn’t find an approved source for this plan. I’ve prepared a source request with the required review gate. Adaptation stays on hold."
                : `I’ve prepared the ${workflowArtifact(session, id, index).title.toLowerCase()}. ${stage.summary}`}
            </p>
          </div>
          <div className="execution-assets">
            {Array.from({ length: index + 1 }, (_, i) => {
              const artifact = workflowArtifact(session, id, i);
              return (
                <button
                  key={artifact.title}
                  className={opened === i ? "selected" : ""}
                  onClick={() => showArtifact(i)}
                >
                  <span className="asset-file-icon">▤</span>
                  <span>
                    <b>{artifact.title}</b>
                    <small>
                      {i === index
                        ? "Just prepared"
                        : "Earlier in this workflow"}{" "}
                      · Open artifact
                    </small>
                  </span>
                  <span>↗</span>
                </button>
              );
            })}
          </div>
          <div ref={panel}>
            {output && (
              <article className="artifact-preview">
                <header>
                  <div>
                    <span className="agent-kicker">
                      Illustrative document · enterprise adoption
                    </span>
                    <h3>{output.title}</h3>
                  </div>
                  <button
                    aria-label="Close artifact preview"
                    onClick={() => setOpened(null)}
                  >
                    ✕
                  </button>
                </header>
                <div className="artifact-meta">
                  <span>Audience: {session.audience}</span>
                  <span>Channels: {session.channel}</span>
                </div>
                <div className="artifact-edit-toolbar">
                  <button onClick={() => setEditing(!editing)}>
                    {editing ? "Done editing" : "Edit this work package"}
                  </button>
                  <button
                    onClick={() => {
                      onEdit(artifactKey(session, id, opened!), [
                        ...output.sections,
                        {
                          name: "New requirement",
                          status: "Added by Morgan",
                          detail: "Describe the additional work required.",
                        },
                      ]);
                      setEditing(true);
                      setEdited(true);
                    }}
                  >
                    + Add requirement
                  </button>
                </div>
                <p className="artifact-brief-note">
                  <b>Campaign objective:</b>{" "}
                  {session.campaign?.objective ||
                    "Grow enterprise adoption across the buying group"}
                  {session.campaign?.instruction && (
                    <>
                      <br />
                      <b>Morgan’s instruction:</b>{" "}
                      {session.campaign.instruction}
                    </>
                  )}
                </p>
                {edited && (
                  <p role="status" className="artifact-change">
                    Updated by Morgan. The downloaded artifact now includes
                    these changes.
                  </p>
                )}
                {output.sections.map((row, rowIndex) => (
                  <section key={rowIndex}>
                    {editing ? (
                      <div className="artifact-edit-fields">
                        {(["name", "status", "detail"] as const).map(
                          (field) => (
                            <label key={field}>
                              {field === "name"
                                ? "Item"
                                : field === "status"
                                  ? "Status / purpose"
                                  : "Work instruction"}
                              <textarea
                                value={row[field]}
                                onChange={(e) => {
                                  onEdit(
                                    artifactKey(session, id, opened!),
                                    output.sections.map((r, i) =>
                                      i === rowIndex
                                        ? { ...r, [field]: e.target.value }
                                        : r,
                                    ),
                                  );
                                  setEdited(true);
                                }}
                              />
                            </label>
                          ),
                        )}
                        <button
                          onClick={() => {
                            onEdit(
                              artifactKey(session, id, opened!),
                              output.sections.filter((_, i) => i !== rowIndex),
                            );
                            setEdited(true);
                          }}
                        >
                          Remove item
                        </button>
                      </div>
                    ) : (
                      <>
                        <span>{row.status}</span>
                        <h4>{row.name}</h4>
                        <p>{row.detail}</p>
                      </>
                    )}
                    {id === "s3" && opened === 1 && (
                      <p className="artifact-brief-note">
                        <b>Production instruction:</b> Prepare a channel-ready
                        variant from the approved source. Keep factual claims
                        fixed, adapt emphasis to this audience’s decision, and
                        return source references with the draft for review.
                      </p>
                    )}
                  </section>
                ))}
                <div className="assembly-sources">
                  <b>Source references</b>
                  <ul>
                    {output.sources.map((source) => (
                      <li key={source.name}>
                        <strong>{source.name}</strong>
                        <small>{source.purpose}</small>
                        <span className="source-system">{source.system}</span>
                        <small className="source-connection">
                          ↳ {source.connection}
                        </small>
                      </li>
                    ))}
                  </ul>
                </div>
                <footer>
                  <p>
                    No live content was generated or delivered. This is a
                    prepared example of the work product.
                  </p>
                  <button onClick={download}>Download example artifact</button>
                </footer>
              </article>
            )}
          </div>
          {blocked ? (
            <p className="work-blocked">
              Choose an approved source above to resume. The source request
              remains available to inspect.
            </p>
          ) : (
            <button
              className="agent-primary"
              onClick={() =>
                index < stages.length - 1 ? onStep(index + 1) : onFinish()
              }
            >
              {stage.action} →
            </button>
          )}
          {index > 0 && (
            <button className="work-back" onClick={() => onStep(index - 1)}>
              Review previous package
            </button>
          )}
        </>
      )}
    </section>
  );
}
export function WorkflowRequirements({
  session,
  id,
}: {
  session: AgentState;
  id: string;
}) {
  const index = currentWorkStep(session, id),
    stage = workStages(session, id)[index];
  return (
    <section className="work-requirements">
      <span className="agent-kicker">
        Behind the screen · proposed technical requirements · {index + 1}
      </span>
      <h3>{stage.title}: what enables this work</h3>
      <BackendIllustration session={session} id={id} key={`${id}-${index}`} />
      <dl>
        {[
          ["INPUT", stage.input],
          ["CONNECTION", stage.connection],
          ["OUTPUT", stage.output],
          ["ENABLES", stage.enables],
          ["CONTROL", stage.control],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p>
        Proposed connections to validate with the room; no integration is
        represented as already available.
      </p>
    </section>
  );
}
