import type { Capability, Session } from "./workshop";
import { synthesisSource } from "./workshop";
import { currentQuestions, findAnswer, editAnswer } from "./workshop-guide";
export const capabilityNames: Record<string, string[]> = {
  s1: [
    "Identify the buying group",
    "Connect activity across an account",
    "Coordinate marketing and sales outreach",
    "Track account progression",
  ],
  s2: [
    "Bring audience signals together",
    "Understand audience needs",
    "Recommend the next action",
    "Learn from the action taken",
  ],
  s3: [
    "Find approved content",
    "Match audiences to relevant messages",
    "Create and approve content variants",
    "Learn which content works for whom",
  ],
  s4: [
    "Prepare a campaign for launch",
    "Review and approve campaigns",
    "Launch approved campaigns",
    "Find and reduce launch delays",
  ],
  s5: [
    "Capture marketing requests",
    "Identify routine requests and exceptions",
    "Complete repeatable marketing work",
    "Route exceptions to a specialist",
  ],
  s6: [
    "Recognize moments needing judgment",
    "Bring in the right reviewer",
    "Change or stop an action",
    "Record decisions and their context",
  ],
  s7: [
    "Bring marketing outcomes together",
    "Compare journeys across audiences",
    "Turn results into the next action",
    "Share learning in time to act",
  ],
};
export function interpretation(a: Capability, index: number) {
  const text = [a.evidence, a.gap].join(" ");
  // Deliberately conservative cues, not a claim to understand arbitrary prose.
  const cues = [
    ...text.matchAll(
      /\b(manual(?:ly)?|scattered|fragmented|spreadsheet|copy(?:ing)?|wait(?:ing)?|not consistently|three places|separate)\b/gi,
    ),
  ].map((m) => m[0]);
  const reason = cues.length
    ? `The answer mentions “${[...new Set(cues)].join("”, “")}”. Check whether this means extra coordination or a gap.`
    : "The answer alone does not establish coverage or reliability. Ask the room to choose below.";
  const saved = a.synthesis;
  return {
    name: saved?.name || capabilityNames[a.useCase]?.[index] || a.name,
    coverage: saved?.coverage || "Not established",
    change: saved?.change || "",
    nextOwner: saved?.nextOwner || "",
    reason,
    stale: !!saved && saved.source !== synthesisSource(a),
    status: saved?.source === synthesisSource(a) ? saved.status : "Proposed",
    layer: currentQuestions[a.useCase]?.[index]?.layer || "surface",
  };
}
export function saveInterpretation(
  s: Session,
  caseId: string,
  index: number,
  patch: Partial<NonNullable<Capability["synthesis"]>>,
): Session {
  const q = currentQuestions[caseId][index];
  const a = findAnswer(s, caseId, q);
  if (!a?.evidence.trim()) return s;
  const view = interpretation(a, index);
  const next = {
    name: view.name,
    coverage: view.coverage,
    change: view.change,
    nextOwner: view.nextOwner,
    source: synthesisSource(a),
    status: "Proposed" as const,
    ...patch,
  };
  // Cannot approve an empty or unresolved interpretation.
  if (
    next.status === "Confirmed" &&
    (!next.name.trim() ||
      next.coverage === "Not established" ||
      a.status === "Disputed")
  )
    next.status = "Proposed";
  return editAnswer(s, caseId, q, { synthesis: next, status: a.status });
}
