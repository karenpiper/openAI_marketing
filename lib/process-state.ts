import type { AgentState } from "./agent-workspace";
import { workSignature } from "./workflow-work";
export type ProcessState = {
  status: string;
  choice: string;
  note: string;
  owner: string;
  version: number;
  reviewers: Record<string, string>;
  events: string[];
};
export function emptyProcess(): ProcessState {
  return {
    status: "Not started",
    choice: "",
    note: "",
    owner: "",
    version: 1,
    reviewers: {},
    events: [],
  };
}
// Bind decisions to the current inputs and the exact edited work products.
export function processKey(s: AgentState, id: string, index: number) {
  return JSON.stringify([
    id,
    index,
    workSignature(s, id),
    s.campaign || null,
    s.audience,
    s.channel,
    s.source,
    Object.fromEntries(
      Object.entries(s.artifactEdits || {})
        .filter(
          ([key]) =>
            key.startsWith(workSignature(s, id) + ":") &&
            (id === "s3" && index >= 2
              ? Number(key.slice(key.lastIndexOf(":") + 1)) <= index
              : key.endsWith(":" + index)),
        )
        .sort(([a], [b]) => a.localeCompare(b)),
    ),
  ]);
}
export function processState(s: AgentState, id: string, index: number) {
  return s.process?.[processKey(s, id, index)] || emptyProcess();
}
export function processReady(s: AgentState, id: string, index: number) {
  const p = processState(s, id, index);
  if (id === "s3" && index === 2)
    return (
      p.status === "Approved" &&
      ["Morgan", "Brand / asset owner", "Legal / privacy"].every(
        (role) => p.reviewers[role] === "Approved",
      )
    );
  return p.status === "Complete";
}
export function processUpdate(
  p: ProcessState,
  patch: Partial<ProcessState>,
  event?: string,
): ProcessState {
  return { ...p, ...patch, events: event ? [...p.events, event] : p.events };
}
export function applyReview(
  p: ProcessState,
  role: string,
  result: string,
): ProcessState {
  if (
    p.status !== "In review" ||
    !["Brand / asset owner", "Legal / privacy"].includes(role)
  )
    return p;
  const reviewers = { ...p.reviewers, [role]: result };
  const status =
    result === "Changes requested"
      ? "Changes requested"
      : ["Morgan", "Brand / asset owner", "Legal / privacy"].every(
            (r) => reviewers[r] === "Approved",
          )
        ? "Approved"
        : "In review";
  return processUpdate(
    p,
    { reviewers, status },
    `${role}: ${result} · packet v${p.version}`,
  );
}
export function processDigest(s: AgentState) {
  return ["s2", "s3", "s5"]
    .flatMap((id) =>
      [0, 1, 2, 3].map((index) => ({
        id,
        index,
        state: processState(s, id, index),
      })),
    )
    .filter((r) => r.state.events.length)
    .map(
      (r) =>
        `${r.id} / step ${r.index + 1}: ${r.state.status}. ${r.state.events.join(" → ")}`,
    )
    .join("\n");
}
