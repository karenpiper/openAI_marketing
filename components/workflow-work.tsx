"use client";
import { useEffect, useRef, useState } from "react";
import ProcessActions from "./process-actions";
import {
  processReady,
  processState,
  type ProcessState,
} from "../lib/process-state";
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
  onProcess,
}: {
  session: AgentState;
  id: string;
  onStep: (n: number) => void;
  onFinish: () => void;
  onProcess: (p: ProcessState) => void;
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
  useEffect(() => {
    if (phase === 3) showArtifact(index);
  }, [phase, runKey]);
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
  const output =
    opened === null || opened >= stages.length
      ? null
      : workflowArtifact(session, id, opened);
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
                      Illustrative document · fictional Northstar Health
                      scenario
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
                {!(id === "s3" && opened === 3) && (
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
                )}
                <p className="artifact-brief-note">
                  <b>Campaign objective:</b>{" "}
                  {session.campaign?.objective ||
                    "Help Northstar Health move from technical evaluation to an expansion decision"}
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
                {!(id === "s3" && opened === 3) &&
                  output.sections.map((row, rowIndex) => (
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
                                output.sections.filter(
                                  (_, i) => i !== rowIndex,
                                ),
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
                          <p className="artifact-deliverable-text">
                            {row.detail}
                          </p>
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
                {id === "s3" &&
                  (opened === 2 || opened === 3) &&
                  opened === index && (
                    <ProcessActions
                      session={session}
                      id={id}
                      index={index}
                      onChange={onProcess}
                    />
                  )}
                <div className="assembly-sources">
                  <b>Evidence used in this output</b>
                  <span>
                    These references ground the decision or work product. Open
                    “Architecture for this step” to see the systems, connections
                    and controls that make it possible.
                  </span>
                  <ul>
                    {output.sources.map((source) => (
                      <li key={source.name}>
                        <strong>{source.name}</strong>
                        <small>{source.purpose}</small>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="process-receipt">
                  <b>Decisions for this version</b>
                  <p>
                    {processState(session, id, opened!).events.join(" → ") ||
                      "No decisions recorded yet."}
                  </p>
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
          {!(
            id === "s3" &&
            (index === 2 || index === 3) &&
            opened === index
          ) && (
            <ProcessActions
              key={runKey}
              session={session}
              id={id}
              index={index}
              onChange={onProcess}
            />
          )}
          {blocked ? (
            <p className="work-blocked">
              Choose an approved source above to resume. The source request
              remains available to inspect.
            </p>
          ) : (
            <button
              className="agent-primary"
              disabled={!processReady(session, id, index)}
              onClick={() =>
                index < stages.length - 1 ? onStep(index + 1) : onFinish()
              }
            >
              Continue with this completed step →
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
  const components: Record<string, string[]> = {
    s2: ["OpenAI agent", "Data lake + CDP / ABM", "Journey analytics"],
    s3: [
      "OpenAI agent",
      "Content / asset system",
      "Workfront + CRM (Marketing)",
    ],
    s5: ["OpenAI agent", "Workfront", "CRM (Marketing) + journey analytics"],
  };
  return (
    <section className="work-requirements">
      <span className="agent-kicker">
        Behind this step · proposed components · {index + 1}
      </span>
      <h3>What this step needs to work</h3>
      <div
        className="requirement-route"
        aria-label="Components used by this prototype step"
      >
        {components[id].map((component, i) => (
          <div className="requirement-route-step" key={component}>
            {i > 0 && <b aria-hidden="true">→</b>}
            <span>{component}</span>
          </div>
        ))}
      </div>
      <div className="requirement-specs">
        {[
          ["Starts with", stage.input],
          ["Connects", stage.connection],
          ["Produces", stage.output],
          ["Keeps control", stage.control],
        ].map(([label, value]) => (
          <article key={label}>
            <b>{label}</b>
            <p>{value}</p>
          </article>
        ))}
      </div>
      <p>
        This is the relevant data movement for this moment, not the full
        architecture. The proposed connections still need validation.
      </p>
    </section>
  );
}
