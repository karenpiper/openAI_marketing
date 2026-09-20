# Priority use cases and outcomes workshop

A Next.js workshop app for OpenAI × Adobe × Code and Theory, scoped to agenda item 1 (30 minutes): align on the first use cases worth solving, the business outcome for each, and what should be proven first.

## V1 scope

- Seven candidate problems presented as moments in a marketer’s day.
- Confirmed feedback, hypotheses, and open questions clearly labeled.
- Live problem validation, room notes, and editable proof statements.
- Outcome, productivity, and proof value ratings.
- A separate “can this move now?” signal.
- Automatic ranking and a top-three readout, with print / save-to-PDF support.
- Browser-local persistence across refreshes.

Architecture and implementation decisions remain a follow-up discussion. This app is a workshop aid, not a simulation of an implemented marketing system.

## Local development

Use Node.js 24 and npm. If using nvm, run `nvm use` first.

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

## Validate and run a production build

```bash
npm run typecheck
npm run build
npm start
```

The lockfile is committed so `npm ci` installs reproducible dependencies. No API keys, environment variables, database, or external integrations are required. A PostCSS override pins a patched release; revisit it when updating Next.js.

## Deploy to Vercel

1. In Vercel, choose **Add New → Project** and import `karenpiper/openAI_marketing`.
2. Use the **Next.js** framework preset and repository root (`.`) as the root directory.
3. Use Node.js **24.x**, install command `npm ci`, and build command `npm run build`. Leave the output directory at its framework default.
4. Deploy. Subsequent pushes to `main` can deploy through Vercel’s Git integration.

Importing and deploying in Vercel is a separate step; committing this repository does not create a deployment.

## Facilitation and data

Use **Walk the day** to capture discussion, **Prioritize** to inspect ranking, and **Readout** to print or save a PDF. Edit ratings in Walk the day. Scores are discussion aids: the average of three ratings is multiplied by problem validation (yes: 1, partly: 0.82, no: 0.35, not discussed: 0.72). Equal scores retain day order. The readout automatically uses the first three ranked cases, even before discussion, so review it with the room before treating it as agreement.

Inputs are stored only in this browser profile under `oai-adobe-priority-workshop-v1`. They are not shared between participants, devices, browsers, or deployment URLs. Clearing site data or confirming **Reset session** removes those inputs. Save the readout before clearing data. Private browsing or browser storage restrictions may prevent persistence.

## Project structure

- `app/page.tsx`: workshop interactions, local state, ranking, and readout.
- `app/globals.css`: responsive and print styling.
- `app/layout.tsx`: page metadata and root layout.
- `lib/workshop-data.ts`: the original seven use cases and supporting copy.

The source workshop content is preserved from the supplied V1 ZIP. Project reference documents and workshop participant notes are not committed.
