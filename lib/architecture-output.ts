import { type Session, activeCases, selectionConfirmed } from "./workshop";
import { useCases } from "./workshop-data";
import {
  workflows,
  workflowState,
  workflowSystems,
} from "./architecture-workflow";
export type ArchitectureNode = {
  title: string;
  status:
    | "Direction agreed"
    | "Proposed"
    | "Change requested"
    | "Open question"
    | "Needs recheck";
  approach: string;
  annotation: string;
  systems: string;
  systemsSuggested: boolean;
  owner: string;
  handoff: string;
  controls: string;
  next: string;
  missing: string[];
};
export function architectureOutput(s: Session) {
  const selected = activeCases(s).map((u) => u.id);
  const cases = useCases.filter(
    (u) =>
      selected.includes(u.id) ||
      s.workflowReviews.some((r) => r.useCase === u.id) ||
      s.architectureAdditions.some((a) => a.useCase === u.id),
  );
  return {
    title: s.title,
    selectionConfirmed: selectionConfirmed(s),
    cases: cases.map((u) => ({
      id: u.id,
      label: u.label,
      selected: selected.includes(u.id),
      proof: s.assessments[u.id].proofText,
      nodes: workflows[u.id].map((step, i): ArchitectureNode => {
        const { record: r, stale } = workflowState(s, u.id, i);
        const systems = workflowSystems(s, u.id, i);
        const missing: string[] = [];
        const status = stale
          ? "Needs recheck"
          : r?.choice === "Keep"
            ? "Direction agreed"
            : r?.choice === "Change"
              ? "Change requested"
              : r?.choice === "Unresolved"
                ? "Open question"
                : "Proposed";
        return {
          title: step.title,
          status,
          approach: step.proposal,
          annotation: r?.change || "",
          systems: systems.value || "Not decided",
          systemsSuggested: systems.suggested,
          owner: r?.owner || "Not assigned",
          handoff: r?.handoff || "Not captured",
          controls: r?.controls || "Not captured",
          next: r?.next || "",
          missing,
        };
      }),
      additions: s.architectureAdditions.filter((a) => a.useCase === u.id),
      boundaries: s.boundaries.filter((b) => b.useCase === u.id),
      handoffs: s.handoffs.filter((h) => h.useCase === u.id),
    })),
    decisions: s.decisions,
  };
}
