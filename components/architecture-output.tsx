import { useState } from "react";
import type { Session } from "../lib/workshop";
import { architectureOutput } from "../lib/architecture-output";
import { Badge } from "./workshop-fields";
export default function ArchitectureOutput({
  session: s,
  download = true,
  compact = false,
}: {
  session: Session;
  download?: boolean;
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const model = architectureOutput(s);
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
        "The architecture PDF could not be generated. Your workshop answers are saved; please try again.",
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
          <h2>Proposed architecture</h2>
        </div>
        {download && (
          <button disabled={busy} onClick={exportPdf}>
            {busy ? "Preparing PDF…" : "Download annotated architecture PDF"}
          </button>
        )}
      </div>
      {error && <p role="alert">{error}</p>}
      <p className="muted">
        Proposed workflow order · room changes and open questions remain
        visible. The PDF recreates our original architecture diagram with
        session annotations.
      </p>
      {!model.cases.length && (
        <p>
          No selected or discussed workflows yet. Capture answers in step 3 to
          build this view.
        </p>
      )}
      {model.cases
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
                    <div className="flow-arrow" aria-label="Next workflow step">
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
