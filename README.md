# Morgan’s Tuesday — priority workshop

A Next.js workshop for OpenAI × Adobe × Code and Theory, scoped to **agenda item 1: priority use cases and outcomes (30 minutes)**.

## Source of truth

`reference/claude-workshop.html` is the original Claude workshop, extracted from the supplied `day_in_the_life.html.rtf`. The source scenes, feedback, four background decisions, rubric wording, KPI labels, questions and dependency notes are preserved verbatim in `lib/workshop-data.ts`. Automated tests compare every original field against this reference. The four architecture decisions are context only; resolving them belongs to later agenda items. The scope note clarifies that distinction within the same workshop.

Flow: Meet Morgan → What we heard and four background decisions → seven timed scenes (8:15 AM through 6:00 PM) → end-of-day recap. Editable proof statements supplement the original content to capture what should be proven first.

## Scoring and facilitation

Frequency, Severity, Evidence and Leverage each use 1–5 ratings with the original anchors. Composite = `(frequency × severity × evidence × leverage) ** 0.25`. All four default to 3, as in the original. Equal scores retain day order. Undiscussed defaults are explicitly labeled in the recap.

“We don’t actually have this problem” excludes a scene from ranking, move-now buckets and the top-three productivity story. It remains visible under Ruled out and can be restored by unchecking the veto. The separate No / Not sure / Yes move-now status never affects the composite. Original suggested statuses are retained until changed by the room.

The recap includes every active priority, ruled-out problems, all three move-now buckets, dependencies, and the productivity story and proof statements for the top three. Print/save PDF and JSON export are available there.

## Local development and validation

Use Node.js 24 (`nvm use` if available):

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run build
npm start
```

No API keys, environment variables, database or external services are required. The lockfile makes installs reproducible.

## Vercel

Import `karenpiper/openAI_marketing`, choose Next.js, root directory `.`, Node.js 24.x, install command `npm ci`, build command `npm run build`, and the default framework output directory. A repository update does not itself create a Vercel project.

## Persistence

Validated inputs persist locally under `oai-adobe-morgan-workshop-v2`. The former three-score model is deliberately not mapped onto the four original dimensions; its old storage key is left untouched. Notes are not shared across browsers, devices or URLs. Storage errors show a visible notice; export before leaving if persistence is unavailable. Reset requires confirmation. JSON export preserves all seven assessments and notes, including ruled-out scenes.

## Structure

- `app/page.tsx`: narrative flow, scoring controls and recap.
- `app/globals.css`: responsive day-to-evening visual treatment and print layout.
- `lib/workshop-data.ts`: original workshop copy plus proof prompts.
- `lib/assessment.ts`: score calculation, ranking and validated storage restoration.
- `tests/workshop.test.cjs`: content fidelity and behavioral checks.
