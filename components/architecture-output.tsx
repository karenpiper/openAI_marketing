import { workflows } from "../lib/architecture-workflow";
import { architectureDiagram, diagramReferences } from "../lib/architecture-diagram";
import { pdfBoxes } from "../lib/architecture-workflow";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { activeCases, type Session } from "../lib/workshop";
import { architectureOutput } from "../lib/architecture-output";
import { Badge } from "./workshop-fields";
import { useCaseCandidates } from "../lib/use-case-candidates";

const componentProfiles: Record<string, { title: string; role: string; capabilities: string[] }> = {
  H: {
    title: "Orchestration layer · OpenAI Frontier · Adobe CX Coworker",
    role: "The shared decision and coordination layer used by specialist agents: it preserves working context, selects the right capability, retrieves connected evidence and keeps people in control before an external action.",
    capabilities: ["Shared campaign and account memory", "Model and specialist-agent routing", "Retrieval before action", "Guardrails, permissions and review gates"],
  },
  A: { title: "Codex Interfaces + ChatGPT work", role: "Morgan’s working surface for seeing evidence, steering the recommendation and reviewing work without reconstructing context.", capabilities: ["Conversation and artifact workspace", "Recommendation rationale and alternatives", "Human edits and approvals", "Persistent campaign context"] },
  B: { title: "Adobe Workfront", role: "The review and workflow system that assigns the right checks, records decisions and holds release until they are complete.", capabilities: ["Review routing", "Approval records", "Exceptions and rework", "Release gates"] },
  C: { title: "Adobe CSC", role: "The governed content source that supplies approved assets, versions, claims and permitted reuse conditions.", capabilities: ["Approved-content retrieval", "Source versioning", "Claims and usage metadata", "Asset references"] },
  D: { title: "OpenAI Data Lake + Adobe CDP / ABM", role: "The connected account, identity and signal foundation that makes a recommendation specific and defensible.", capabilities: ["Consent-safe identity joins", "Account and buying-group context", "Audience eligibility", "Signal freshness and provenance"] },
  E: { title: "Marketing touchpoints", role: "The systems that receive approved work for delivery across events, marketing CRM and the website. Adobe Marketo / AJO is a marketing tool that supports activation; it is not itself a touchpoint.", capabilities: ["Channel-ready payloads", "Campaign and audience identifiers", "Staged activation", "Response events returned to measurement"] },
  F: { title: "Adobe Customer Journey Analytics", role: "The measurement layer that joins touchpoint response into a view of progression and returns the evidence needed for the next decision.", capabilities: ["Cross-touchpoint journey signals", "Audience progression", "Measurement inputs", "Learning loop to the agent"] },
  G: { title: "Sales experience", role: "The sales systems that contribute relationship context and receive a qualified, coordinated action when marketing and sales need to work together.", capabilities: ["CRM account context", "Relationship ownership", "Offer and next-step tools", "Confirmed progression signals"] },
};
export default function ArchitectureOutput({
  session: s,
  download = true,
  compact = false,
  explorer = false,
  explorerCases,
  workflow,
  setSession,
}: {
  session: Session;
  download?: boolean;
  compact?: boolean;
  explorer?: boolean;
  explorerCases?: { id: string; label: string }[];
  workflow?: string;
  setSession?: Dispatch<SetStateAction<Session>>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [explorerCase, setExplorerCase] = useState("");
  const [explorerStep, setExplorerStep] = useState(-1);
  const [explorerComponent, setExplorerComponent] = useState("");
  const [playing, setPlaying] = useState(false);
  const model = architectureOutput(s);
  const requestedWorkflow =
    workflow && workflows[workflow]
      ? {
          id: workflow,
          label:
            useCaseCandidates.find((candidate) => candidate.id === workflow)
              ?.title || workflow,
        }
      : undefined;
  const cases = explorer
    ? [
        ...(explorerCases ||
          useCaseCandidates.map((candidate) => ({
            id: candidate.id,
            label: candidate.title,
          }))),
        ...((requestedWorkflow &&
          !(explorerCases || []).some(
            (candidate) => candidate.id === requestedWorkflow.id,
          )
          ? [requestedWorkflow]
          : []) as { id: string; label: string }[]),
      ]
    : compact && explorerCases
      ? explorerCases
      : activeCases(s);
  const caseId = cases.some((u) => u.id === s.readoutFlow.caseId)
    ? s.readoutFlow.caseId
    : cases[0]?.id;
  const step = s.readoutFlow.step;
  const flow = caseId ? workflows[caseId] : [];

  useEffect(() => {
    if (!playing || !explorerCase) return;
    const activeFlow = workflows[explorerCase] || [];
    const current = explorerStep < 0 ? 0 : explorerStep;
    const timer = window.setTimeout(() => {
      if (current >= activeFlow.length - 1) {
        setPlaying(false);
        return;
      }
      setExplorerStep(current + 1);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [explorerCase, explorerStep, playing]);

  useEffect(() => {
    if (requestedWorkflow) chooseExplorerCase(requestedWorkflow.id);
  }, [workflow]);

  function chooseExplorerCase(id: string) {
    setExplorerCase(id);
    setExplorerStep(-1);
    setExplorerComponent("");
    setPlaying(false);
  }
  const selectedComponent = componentProfiles[explorerComponent];

  async function exportPdf() {
    setBusy(true);
    setError("");
    try {
      const { architecturePdf } = await import("../lib/architecture-pdf");
      const pdf = await architecturePdf(s);
      await new Promise<void>((resolve, reject) => {
        try {
          pdf.getBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${s.title.startsWith("DEMO") ? "DEMO-" : ""}workshop-architecture-${new Date().toISOString().slice(0, 10)}.pdf`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            resolve();
          });
        } catch (e) {
          reject(e);
        }
      });
    } catch {
      setError(
        "The workflow architecture PDF could not be generated. Your workshop answers are saved; please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="architecture-output">
      <div className="card-heading">
        <div>
          <span className="eyebrow">Generated from this conversation</span>
          <h2>Proposed workflow architecture</h2>
        </div>
        {download && (
          <button disabled={busy} onClick={exportPdf}>
            {busy ? "Preparing PDF…" : "Download annotated workflow architecture PDF"}
          </button>
        )}
      </div>
      {error && <p role="alert">{error}</p>}
      {!compact && (
        <p className="muted">
          Proposed workflow order · room changes and open questions remain
          visible. The PDF recreates our original workflow architecture diagram with
          session annotations.
        </p>
      )}
      {explorer ? (
        <section className="architecture-explorer" aria-live="polite">
          <header className="architecture-explorer-heading">
            <div>
              <span className="eyebrow">Explore the proposed workflow architecture</span>
              <h3>{explorerCase ? cases.find((u) => u.id === explorerCase)?.label : "The complete system"}</h3>
            </div>
          </header>
          <div className="architecture-usecase-tabs" role="tablist" aria-label="Workflow architecture views">
            <button role="tab" aria-selected={!explorerCase} onClick={() => chooseExplorerCase("")}>All workflow architecture</button>
            {cases.map((u) => (
              <button key={u.id} role="tab" aria-selected={explorerCase === u.id} onClick={() => chooseExplorerCase(u.id)}>{u.label}</button>
            ))}
          </div>
          <div className="architecture-story-layout architecture-explorer-layout">
            <div>
              <div
                className="closing-diagram"
                role="img"
                aria-label={explorerCase ? `Workflow architecture highlighting ${cases.find((u) => u.id === explorerCase)?.label || "the selected workflow"}${explorerStep >= 0 ? ` — ${workflows[explorerCase]?.[explorerStep]?.title}` : ""}` : "The full proposed OpenAI, Adobe and Code and Theory workflow architecture"}
                onClick={(event) => {
                  const component = (event.target as HTMLElement).closest<HTMLElement>("[data-architecture-component]")?.dataset.architectureComponent;
                  if (component && componentProfiles[component]) setExplorerComponent(component);
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  const component = (event.target as HTMLElement).closest<HTMLElement>("[data-architecture-component]")?.dataset.architectureComponent;
                  if (component && componentProfiles[component]) { event.preventDefault(); setExplorerComponent(component); }
                }}
                dangerouslySetInnerHTML={{ __html: explorerCase && explorerStep >= 0 ? architectureDiagram(s, explorerCase, explorerStep, explorerComponent ? [explorerComponent] : undefined) : architectureDiagram(s, undefined, -1, explorerComponent ? [explorerComponent] : undefined) }}
              />
              <p className="diagram-legend">
                {explorerComponent ? "This component is highlighted. Select another box to inspect it, or return to the workflow story." : explorerCase && explorerStep >= 0 ? "Gold traces the components and connections involved in this step. Select any box to inspect what it provides." : explorerCase ? "Choose a step to see only the components and connections used at that moment." : "The starting proposal: a complete system view. Select any box to inspect what it provides."}
              </p>
            </div>
            <aside className="architecture-explorer-story">
              {selectedComponent ? (
                <>
                  <span className="eyebrow">Component drill-down</span>
                  <h4>{selectedComponent.title}</h4>
                  <p>{selectedComponent.role}</p>
                  <div className="architecture-component-capabilities">
                    <span className="eyebrow">What it has to provide</span>
                    <ul>{selectedComponent.capabilities.map((capability) => <li key={capability}>{capability}</li>)}</ul>
                  </div>
                  <button className="architecture-component-back" onClick={() => setExplorerComponent("")}>← Back to workflow view</button>
                </>
              ) : !explorerCase ? (
                <>
                  <span className="eyebrow">Start here</span>
                  <h4>One shared foundation</h4>
                  <p>This is the proposed system as a whole: OpenAI intelligence and orchestration connect to Adobe identity, content operations, activation, governance and measurement.</p>
                  <div className="architecture-starting-points"><div><b>OpenAI</b><span>Marketer surface, reasoning, intelligence and attribution.</span></div><div><b>Adobe</b><span>Identity, content operations, activation, governance and measurement.</span></div><div><b>Code and Theory</b><span>Interface design, orchestration implementation and operating model.</span></div></div>
                  <p className="architecture-explorer-note">Choose a priority use case above to see only the relevant components and the story of how work moves between them.</p>
                </>
              ) : explorerStep < 0 ? (
                <>
                  <span className="eyebrow">The proposed flow</span>
                  <h4>One connected sequence</h4>
                  <button
                    className="architecture-play"
                    aria-pressed={playing}
                    onClick={() => {
                      setExplorerStep(0);
                      setPlaying((value) => !value);
                    }}
                  >
                    {playing ? "Pause walkthrough" : `▶ Watch ${cases.find((u) => u.id === explorerCase)?.label || "workflow"}`}
                  </button>
                  <ol>{(workflows[explorerCase] || []).map((item, index) => <li key={item.title}><button onClick={() => setExplorerStep(index)}><b>{index + 1}. {item.title}</b><span>{item.output}</span></button></li>)}</ol>
                </>
              ) : (() => {
                const active = workflows[explorerCase]?.[explorerStep];
                if (!active) return null;
                const lastStep = (workflows[explorerCase] || []).length - 1;
                return <><span className="eyebrow">{explorerStep + 1} / {workflows[explorerCase]?.length}</span><h4>{active.title}</h4><p>{active.proposal}</p><div className="architecture-step-components"><span className="eyebrow">Components involved</span><button onClick={() => setExplorerComponent("H")}>{pdfBoxes.orchestration}</button>{active.boxes.map((box) => <button key={box} onClick={() => setExplorerComponent(diagramReferences[box])}>{pdfBoxes[box]}</button>)}</div><div className="architecture-step-output"><span className="eyebrow">Passes forward</span><p>{active.output}</p></div><div className="architecture-step-navigation"><button onClick={() => setExplorerStep((current) => current === 0 ? -1 : current - 1)}>← {explorerStep === 0 ? "All steps" : "Previous step"}</button>{explorerStep < lastStep && <button className="agent-primary" onClick={() => setExplorerStep((current) => current + 1)}>Next step →</button>}</div></>;
              })()}
            </aside>
          </div>
        </section>
      ) : compact ? (
        <>
          <div
            className="diagram-case-selector"
            aria-label="Highlight a priority use case"
          >
            {cases.map((u) => (
              <button
                key={u.id}
                disabled={!setSession}
                aria-pressed={caseId === u.id}
                onClick={() =>
                  setSession?.((p) => ({
                    ...p,
                    readoutFlow: { caseId: u.id, step: -1 },
                  }))
                }
              >
                {u.label}
              </button>
            ))}
          </div>
          <div className="architecture-story-layout">
            <div>
              <div
                className="closing-diagram"
                role="img"
                aria-label={`Workflow architecture highlighting ${cases.find((u) => u.id === caseId)?.label || "the proposal"}${step >= 0 ? ` — ${flow[step]?.title}` : ""}`}
                dangerouslySetInnerHTML={{
                  __html: architectureDiagram(s, caseId, step),
                }}
              />
              <p className="diagram-legend">
                Gold: relevant components and connections. Solid: original
                diagram connections. Dashed: proposed workflow connections to
                validate.
              </p>
            </div>
            <aside className="architecture-story">
              {!cases.length ? (
                <>
                  <h3>No priority use cases selected</h3>
                  <p className="muted">
                    Select the priority set in Step 2 to see its workflow
                    architecture here.
                  </p>
                </>
              ) : (
                <>
                  <div className="card-heading">
                    <h3>{cases.find((u) => u.id === caseId)?.label}</h3>
                    {setSession && (
                      <button
                        aria-pressed={step === -1}
                        onClick={() =>
                          setSession((p) => ({
                            ...p,
                            readoutFlow: { caseId: caseId || "", step: -1 },
                          }))
                        }
                      >
                        Whole flow
                      </button>
                    )}
                  </div>
                  <p className="muted">
                    Follow the story. Select a moment to highlight where it
                    happens.
                  </p>
                  <ol>
                    {flow.map((f, i) => {
                      const note = model.cases.find((c) => c.id === caseId)?.nodes[
                        i
                      ];
                      return (
                        <li key={i} className={step === i ? "story-active" : ""}>
                          <button
                            disabled={!setSession}
                            aria-pressed={step === i}
                            onClick={() =>
                              setSession?.((p) => ({
                                ...p,
                                readoutFlow: { caseId: caseId || "", step: i },
                              }))
                            }
                          >
                            {i + 1}. {f.title}
                          </button>
                          <p>{f.proposal}</p>
                          <small>
                            <b>Passes forward:</b> {f.output}
                          </small>
                          {note?.annotation && (
                            <p className="story-room-note">
                              <b>Room input:</b> {note.annotation}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </>
              )}
            </aside>
          </div>
        </>
      ) : null}
      {!compact && !explorer && !model.cases.length && (
        <p>
          No selected or discussed workflows yet. Capture answers in step 3 to
          build this view.
        </p>
      )}
      {!compact &&
        !explorer &&
        model.cases
          .filter((c) => !compact || c.selected)
          .map((c) => (
            <section key={c.id}>
              <h3>
                {c.label}
                {!c.selected ? " · outside the working set" : ""}
              </h3>
              <ol className={compact ? "outcome-flow" : "generated-flow"}>
                {c.nodes.map((n, i) => (
                  <li key={i} className="generated-node">
                    <div className="card-heading">
                      <h4>
                        {i + 1}. {n.title}
                      </h4>
                      <Badge value={n.status} />
                    </div>
                    {!compact && <p>{n.approach}</p>}
                    {n.annotation && (
                      <p className="proposal-annotation">
                        <b>Room input:</b> {n.annotation}
                      </p>
                    )}
                    {compact ? (
                      <p className="outcome-systems preserve-lines">
                        {n.systems}
                      </p>
                    ) : (
                      <dl>
                        <dt>
                          {n.systemsSuggested && n.status !== "Direction agreed"
                            ? "Suggested systems"
                            : "Systems and roles"}
                        </dt>
                        <dd className="preserve-lines">{n.systems}</dd>
                        {n.owner !== "Not assigned" && (
                          <>
                            <dt>Follow-up owner</dt>
                            <dd>{n.owner}</dd>
                          </>
                        )}
                        {n.handoff !== "Not captured" && (
                          <>
                            <dt>Captured handoff</dt>
                            <dd>{n.handoff}</dd>
                          </>
                        )}
                        {n.controls !== "Not captured" && (
                          <>
                            <dt>Captured controls</dt>
                            <dd>{n.controls}</dd>
                          </>
                        )}
                      </dl>
                    )}
                    {n.missing.length > 0 && (
                      <p className="muted">
                        Still needed: {n.missing.join(", ")}
                      </p>
                    )}
                    {!compact && n.next && (
                      <p>
                        <b>Next:</b> {n.next}
                      </p>
                    )}
                    {!compact && i < 4 && (
                      <div
                        className="flow-arrow"
                        aria-label="Next workflow step"
                      >
                        ↓
                      </div>
                    )}
                  </li>
                ))}
              </ol>
              {c.additions.map((a) => (
                <p className="proposal-annotation" key={a.id}>
                  <b>Room addition:</b> {a.note || "Not yet described"}
                  {a.owner && ` · Follow-up: ${a.owner}`}
                </p>
              ))}
            </section>
          ))}
    </section>
  );
}
