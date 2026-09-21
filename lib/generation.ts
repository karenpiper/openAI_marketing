import { type Lab, type Audience } from "./workshop";
export type GenerationInput = Pick<
  Lab,
  "title" | "source" | "fixed" | "guidance" | "sourceStatus" | "approvedBy"
> & { audiences: Audience[] };
export function validateInput(raw: unknown): GenerationInput {
  if (!raw || typeof raw !== "object")
    throw Error("A source brief is required.");
  const r = raw as Record<string, unknown>;
  const text = (key: string, max: number, required = false) => {
    const v = r[key];
    if (typeof v !== "string" || v.length > max || (required && !v.trim()))
      throw Error(
        `Check ${key}: ${required ? "a value is required, and " : ""}the limit is ${max} characters.`,
      );
    return v;
  };
  const title = text("title", 500, true),
    source = text("source", 20000, true),
    fixed = text("fixed", 4000),
    guidance = text("guidance", 4000),
    approvedBy = text("approvedBy", 300);
  if (
    r.sourceStatus !== "Practice" &&
    r.sourceStatus !== "Approved for exercise"
  )
    throw Error("Choose the source status.");
  if (r.sourceStatus === "Approved for exercise" && !approvedBy.trim())
    throw Error("Name the person who approved this source for the exercise.");
  if (
    !Array.isArray(r.audiences) ||
    r.audiences.length < 1 ||
    r.audiences.length > 6
  )
    throw Error("Choose between 1 and 6 audiences.");
  const audiences = r.audiences.map((a: unknown) => {
    if (!a || typeof a !== "object") throw Error("Invalid audience.");
    const v = a as Record<string, unknown>;
    const out = {} as Audience;
    for (const key of ["id", "name", "signal", "need", "cta"] as const) {
      if (typeof v[key] !== "string" || !v[key].trim() || v[key].length > 1000)
        throw Error(
          "Complete each audience’s name, signal, need and call to action (up to 1,000 characters each).",
        );
      out[key] = v[key];
    }
    return out;
  });
  if (new Set(audiences.map((a) => a.id)).size !== audiences.length)
    throw Error("Each audience must have a unique identifier.");
  return {
    title,
    source,
    fixed,
    guidance,
    approvedBy,
    sourceStatus: r.sourceStatus,
    audiences,
  };
}
export const generatedSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    variants: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          audienceId: { type: "string" },
          subject: { type: "string" },
          body: { type: "string" },
          headline: { type: "string" },
          rationale: { type: "string" },
        },
        required: ["audienceId", "subject", "body", "headline", "rationale"],
      },
    },
  },
  required: ["variants"],
};
export type Variant = {
  audienceId: string;
  subject: string;
  body: string;
  headline: string;
  rationale: string;
};
export function validateVariants(
  raw: unknown,
  audiences: Audience[],
): Variant[] {
  const r = raw as { variants?: unknown };
  if (
    !r ||
    !Array.isArray(r.variants) ||
    r.variants.length !== audiences.length
  )
    throw Error("The generated response did not cover every audience.");
  const variants = r.variants.map((v: unknown) => {
    if (!v || typeof v !== "object") throw Error("Invalid content response.");
    const x = v as Record<string, unknown>;
    for (const k of ["audienceId", "subject", "body", "headline", "rationale"])
      if (typeof x[k] !== "string" || !x[k].trim() || x[k].length > 12000)
        throw Error("The generated content was incomplete.");
    return x as Variant;
  });
  if (
    new Set(variants.map((v) => v.audienceId)).size !== audiences.length ||
    variants.some((v) => !audiences.some((a) => a.id === v.audienceId))
  )
    throw Error("The generated audiences did not match the request.");
  return variants;
}
