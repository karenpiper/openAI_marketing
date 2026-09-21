"use client";
import { useEffect, useRef, useState } from "react";
import type { AgentState } from "../lib/agent-workspace";
import { architectureDiagram } from "../lib/architecture-diagram";
import { workStages, currentWorkStep } from "../lib/workflow-work";
const routes: Record<string, string[][]> = {
  s2: [["D", "F"], ["D"], ["A"]],
  s3: [["C"], ["C", "D"], ["B", "C"], ["E", "F"]],
  s5: [
    ["D", "E"],
    ["D", "B"],
    ["B", "E"],
  ],
};
const names: Record<string, string> = {
  A: "OpenAI agent interface",
  B: "Adobe Workfront",
  C: "Adobe CSC / assets",
  D: "OpenAI data lake + CDP ABM",
  E: "Marketing touchpoints",
  F: "Customer Journey Analytics",
};
export default function BackendIllustration({
  session,
  id,
}: {
  session: AgentState;
  id: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const [frame, setFrame] = useState(0),
    [playing, setPlaying] = useState(false),
    [open, setOpen] = useState(false);
  const index = currentWorkStep(session, id),
    stage = workStages(session, id)[index],
    refs = routes[id]?.[index] || ["A"];
  const blocked = id === "s3" && session.source === "Source material missing";
  const frames = [
    {
      title: "The agent prepares a request",
      body: stage.input,
      refs: ["A"],
      label: "Input",
    },
    {
      title: "A scoped connector requests the context",
      body: stage.connection,
      refs,
      label: "Proposed connection",
    },
    {
      title: blocked
        ? "The source lookup returns a gap"
        : "The response returns to the workspace",
      body: blocked
        ? "No approved source was found in this scenario. The agent returns a source request and keeps adaptation on hold."
        : stage.output,
      refs: ["A", ...refs],
      label: blocked ? "Blocked response" : "Output",
    },
    {
      title: blocked
        ? "The workflow pauses safely"
        : "The next piece of work becomes possible",
      body: blocked
        ? "Morgan needs approved source material before this workflow can continue."
        : stage.enables,
      refs: ["A"],
      label: "What this enables",
    },
  ];
  useEffect(() => {
    if (!playing || !open) return;
    const timer = setTimeout(() => {
      if (frame < 3) setFrame(frame + 1);
      else setPlaying(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, [playing, frame, open]);
  function close() {
    dialog.current?.close();
    setOpen(false);
    setPlaying(false);
    trigger.current?.focus();
  }
  return (
    <>
      <button
        ref={trigger}
        className="backend-launch"
        onClick={() => {
          setFrame(0);
          setPlaying(false);
          setOpen(true);
          dialog.current?.showModal();
        }}
      >
        ◇ Behind the scenes · follow the agent
      </button>
      <dialog
        ref={dialog}
        className="backend-dialog"
        aria-labelledby="backend-title"
        onCancel={() => {
          setOpen(false);
          setPlaying(false);
        }}
        onClose={() => {
          setOpen(false);
          setPlaying(false);
          trigger.current?.focus();
        }}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
      >
        <div className="backend-body">
          <header>
            <div>
              <span className="agent-kicker">
                Facilitator illustration · based on our proposed architecture
              </span>
              <h2 id="backend-title">{stage.title}</h2>
            </div>
            <button onClick={close} aria-label="Close backend illustration">
              ✕
            </button>
          </header>
          <p className="backend-note">
            An illustrated request and response—not a live tool call. Gold
            highlights the components involved at this moment.
          </p>
          <div className="backend-layout">
            <div
              className="backend-map"
              role="img"
              aria-label={`Architecture diagram highlighting ${frames[frame].refs.map((r) => names[r]).join(", ")}`}
              dangerouslySetInnerHTML={{
                __html: architectureDiagram(
                  session.architecture,
                  id,
                  -1,
                  frames[frame].refs,
                ),
              }}
            />
            <section className="backend-story" aria-live="polite">
              <span className="agent-kicker">
                {frame + 1} / 4 · {frames[frame].label}
              </span>
              <h3>{frames[frame].title}</h3>
              <div className="backend-route">
                <span>OpenAI agent</span>
                <b aria-hidden="true">⇄</b>
                <span>{refs.map((r) => names[r]).join(" + ")}</span>
              </div>
              <p>{frames[frame].body}</p>
              <aside>
                <b>Control at this boundary</b>
                <p>{stage.control}</p>
              </aside>
              <p className="backend-note">
                Solid lines reproduce connections in the architecture proposal.
                The request / response above is a proposed orchestration path to
                validate. Marketo, where mentioned, is a candidate
                implementation of the diagram’s CRM (Marketing) box; its
                connector is not established by the diagram.
              </p>
            </section>
          </div>
          <footer>
            <div className="backend-dots">
              {frames.map((f, i) => (
                <button
                  key={f.title}
                  aria-label={`Show step ${i + 1}: ${f.title}`}
                  aria-pressed={frame === i}
                  onClick={() => {
                    setFrame(i);
                    setPlaying(false);
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div>
              <button
                disabled={frame === 0}
                onClick={() => {
                  setFrame(frame - 1);
                  setPlaying(false);
                }}
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  if (frame === 3) setFrame(0);
                  setPlaying(!playing);
                }}
              >
                {playing ? "Pause" : "Play illustration"}
              </button>
              <button
                disabled={frame === 3}
                onClick={() => {
                  setFrame(frame + 1);
                  setPlaying(false);
                }}
              >
                Next →
              </button>
            </div>
          </footer>
        </div>
      </dialog>
    </>
  );
}
