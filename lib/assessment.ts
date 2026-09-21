import { useCases, type NoRegret } from "./workshop-data";
export type Assessment = {
  frequency: number;
  severity: number;
  evidence: number;
  leverage: number;
  veto: boolean;
  noRegret: NoRegret;
  note: string;
  proofText: string;
  discussed: boolean;
};
export type StateMap = Record<string, Assessment>;
export const STORAGE_KEY = "oai-adobe-morgan-workshop-v2";
export function defaults(): StateMap {
  return Object.fromEntries(
    useCases.map((s) => [
      s.id,
      {
        frequency: 3,
        severity: 3,
        evidence: 3,
        leverage: 3,
        veto: false,
        noRegret: s.noRegretDefault as NoRegret,
        note: "",
        proofText: s.proofPrompt,
        discussed: false,
      },
    ]),
  );
}
export function composite(a: Assessment) {
  return Math.pow(a.frequency * a.severity * a.evidence * a.leverage, 0.25);
}
export function restore(raw: unknown): StateMap {
  const result = defaults();
  if (!raw || typeof raw !== "object") return result;
  for (const s of useCases) {
    const a = (raw as Record<string, unknown>)[s.id];
    if (!a || typeof a !== "object") continue;
    const v = a as Record<string, unknown>,
      d = result[s.id];
    for (const k of ["frequency", "severity", "evidence", "leverage"] as const)
      if (
        typeof v[k] === "number" &&
        Number.isInteger(v[k]) &&
        v[k] >= 1 &&
        v[k] <= 5
      )
        d[k] = v[k];
    if (["yes", "unsure", "no"].includes(v.noRegret as string))
      d.noRegret = v.noRegret as NoRegret;
    for (const k of ["note", "proofText"] as const)
      if (typeof v[k] === "string") d[k] = v[k];
    for (const k of ["veto", "discussed"] as const)
      if (typeof v[k] === "boolean") d[k] = v[k];
  }
  return result;
}
export function rank(state: StateMap) {
  return useCases
    .filter((s) => !state[s.id].veto)
    .sort((a, b) => composite(state[b.id]) - composite(state[a.id]));
}
