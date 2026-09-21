import { type Session, activeCases, selectionConfirmed } from "./workshop";
import { useCases } from "./workshop-data";
import {
  workflows,
  workflowState,
  workflowSystems,
} from "./architecture-workflow";
export type ArchitectureNode = {
  title: string;
  status: "Agreed" | "Proposed" | "Unresolved" | "Needs recheck";
  approach: string;
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
      s.workflowReviews.some((r) => r.useCase === u.id),
  );
  return {
    title: s.title,
    attendees: s.attendees,
    selectionConfirmed: selectionConfirmed(s),
    cases: cases.map((u) => ({
      id: u.id,
      label: u.label,
      selected: selected.includes(u.id),
      proof: s.assessments[u.id].proofText,
      nodes: workflows[u.id].map((step, i): ArchitectureNode => {
        const { record: r, stale } = workflowState(s, u.id, i);
        const systems = workflowSystems(s, u.id, i);
        const missing = [
          ["Systems", systems.unreviewed ? "" : systems.value],
          ["Owner", r?.owner],
          ["Handoff", r?.handoff],
          ["Controls", r?.controls],
        ]
          .filter(
            ([, v]) =>
              !v?.trim() ||
              /^(unknown|not decided|not sure|tbd|to be agreed|not captured|unassigned)[.!]?$/i.test(
                v.trim(),
              ),
          )
          .map(([label]) => label!);
        if (r?.choice === "Change" && !r.change.trim())
          missing.push("Revised approach");
        const status = stale
          ? "Needs recheck"
          : r?.choice === "Unresolved"
            ? "Unresolved"
            : r?.choice === "Keep" || r?.choice === "Change"
              ? missing.length
                ? "Unresolved"
                : "Agreed"
              : "Proposed";
        return {
          title: step.title,
          status,
          approach: r?.change.trim() || step.proposal,
          systems: systems.value || "Not decided",
          systemsSuggested: systems.suggested,
          owner: r?.owner || "Not assigned",
          handoff: r?.handoff || "Not captured",
          controls: r?.controls || "Not captured",
          next: r?.next || "",
          missing,
        };
      }),
      boundaries: s.boundaries.filter((b) => b.useCase === u.id),
      handoffs: s.handoffs.filter((h) => h.useCase === u.id),
    })),
    decisions: s.decisions,
  };
}
