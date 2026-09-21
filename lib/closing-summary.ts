import { workflowState } from "./architecture-workflow";
import { type Session, activeCases, selectionConfirmed } from "./workshop";
export function closingSummary(s: Session) {
  const selected = new Set(activeCases(s).map((u) => u.id));
  const relevant = (id: string) => !id || selected.has(id);
  const shorten = (value: string) =>
    value.length > 180 ? value.slice(0, 177) + "…" : value;
  const first = (items: string[]) =>
    items.filter(Boolean).slice(0, 3).map(shorten).join("\n");
  const actions = s.actions.filter((a) => relevant(a.useCase));
  const decisions = s.decisions.filter(
    (d) => relevant(d.useCase) && d.status !== "Confirmed",
  );
  return {
    ownership:
      s.closing.ownership ||
      first(
        s.boundaries
          .filter((b) => relevant(b.useCase) && b.owner.trim())
          .map(
            (b) =>
              `${b.system || b.layer}: ${b.owner} (${b.status.toLowerCase()})`,
          ),
      ) ||
      "Ownership boundaries still need agreement.",
    sequence:
      s.closing.sequence ||
      first(
        actions
          .filter((a) => a.task.trim())
          .map(
            (a, i) =>
              `${i + 1}. ${a.task}${a.owner ? ` — ${a.owner}` : ""}${a.when ? ` · ${a.when}` : ""}`,
          ),
      ) ||
      "Agree the first action, owner and what follows.",
    open:
      s.closing.open ||
      first([
        ...actions.filter((a) => a.blockedBy.trim()).map((a) => a.blockedBy),
        ...s.workflowReviews
          .filter(
            (r) =>
              relevant(r.useCase) &&
              (r.choice === "Change" ||
                r.choice === "Unresolved" ||
                workflowState(s, r.useCase, r.step).stale),
          )
          .map((r) => r.change || "Workflow review remains open"),
        ...decisions.map((d) => d.title),
      ]) ||
      "No open decisions or dependencies captured.",
    colin:
      s.closing.colin ||
      first(
        actions.filter((a) => a.sponsorship.trim()).map((a) => a.sponsorship),
      ) ||
      "No decision or sponsorship ask captured yet.",
  };
}

export function middayReadout(s: Session) {
  const summary = closingSummary(s);
  return [
    `# Midday readout\n${s.title}`,
    `## 1. Priority use cases (${selectionConfirmed(s) ? "agreed" : "needs agreement"})`,
    ...activeCases(s).map(
      (u, i) =>
        `${i + 1}. ${u.label}\nWhat to prove: ${s.assessments[u.id].proofText}`,
    ),
    "## 2. Proposed architecture",
    "See the annotated architecture PDF for the working diagram and session changes.",
    `Ownership boundaries:\n${summary.ownership}`,
    "## 3. Decisions, dependencies and sequence",
    `Proposed sequence:\n${summary.sequence}`,
    `Open decisions and dependencies:\n${summary.open}`,
    `Ask for Colin:\n${summary.colin}`,
  ].join("\n\n");
}

export function closingItems(s: Session) {
  const cases = activeCases(s),
    selected = new Set(cases.map((u) => u.id));
  const relevant = (id: string) => !id || selected.has(id);
  const scope = (id: string) =>
    cases.find((u) => u.id === id)?.label || "Workshop-wide";
  const items: {
    id: string;
    title: string;
    detail: string;
    owner: string;
    due: string;
    status: string;
    scope: string;
  }[] = [];
  for (const d of s.decisions.filter((d) => relevant(d.useCase)))
    items.push({
      id: `decision-${d.id}`,
      title: d.title,
      detail: d.answer,
      owner: d.owner,
      due: d.due,
      status:
        d.status === "Confirmed" && d.answer.trim()
          ? "Agreed"
          : "Open decision",
      scope: scope(d.useCase),
    });
  for (const r of s.workflowReviews.filter((r) => relevant(r.useCase))) {
    const stale = workflowState(s, r.useCase, r.step).stale;
    if (r.choice !== "Change" && r.choice !== "Unresolved" && !stale) continue;
    items.push({
      id: `review-${r.useCase}-${r.step}`,
      title:
        r.choice === "Change"
          ? "Requested architecture change"
          : "Architecture question",
      detail: r.change || r.next || "Room clarification needed.",
      owner: r.owner,
      due: "",
      status: stale ? "Needs recheck" : "Open",
      scope: scope(r.useCase),
    });
  }
  for (const a of s.actions.filter(
    (a) => relevant(a.useCase) && a.blockedBy.trim(),
  ))
    items.push({
      id: `dependency-${a.id}`,
      title: a.blockedBy,
      detail: a.task ? `Needed for: ${a.task}` : "",
      owner: a.owner,
      due: a.when,
      status: "Dependency",
      scope: scope(a.useCase),
    });
  for (const a of s.architectureAdditions.filter(
    (a) => relevant(a.useCase) && a.note.trim(),
  ))
    items.push({
      id: `addition-${a.id}`,
      title: "Proposed architecture addition",
      detail: a.note,
      owner: a.owner,
      due: "",
      status: "To review",
      scope: scope(a.useCase),
    });
  return items;
}
