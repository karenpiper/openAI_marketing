# Enterprise marketing working session

A Next.js workshop for OpenAI × Adobe × Code and Theory. Four agenda stages share one record of use cases, capabilities, operating boundaries, decisions and next actions. A content-at-scale workbench sits within the architecture block.

## Run locally

Use Node.js 24 (`nvm use` if available):

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The entire workshop and practice content exercise work without credentials.

## Facilitation

Use **one capture tab** on the facilitator’s computer. Click **Open projector** and move that read-only window to the room screen. Both windows must share the same browser profile and origin. The room view follows the active agenda stage, Morgan scene and guided discussion question, including changes to captured answers. It uses local storage events plus BroadcastChannel; it is not a cross-device collaboration service. **Preview room view** shows the same presentation in the capture tab.

1. **Use cases — 30 min.** Walk Morgan’s current-state day. Correct the hypotheses, record notes and proof, score or veto. In the recap, explicitly select the working set and confirm who agreed. Ranking does not automatically select or confirm anything.
2. **Current state — 30 min.** Choose any of the seven cases from the dropdown. Ask the four prepared questions one at a time. Capture one recent example, the place or tool used for that specific task, people, and what works or is missing. Each of the 28 questions has its own tool prompt. One known tool, a manual process or “not sure” is enough; additional tools are optional. Mark the answer Agreed, Needs checking, Disputed or Still unknown. Read the four answers back together. No capability entry or picker is required. Participants describe a recent example; the tool offers a plain-language capability name immediately, and the room corrects and confirms the interpretation. Exploring a case does not add it to the working set.
3. **Architecture — 45 min.** Walk through our suggested workflow for each use case. Compare it with today’s answers; capture the systems, owner, handoff and controls the room chooses. Choose Keep, Change or Unresolved after editing. No internal reference diagram is presented to participants. Changes to source answers require a recheck. The readout assembles the captured conversation into an architecture view and PDF download.
4. **Readout — 15 min.** Review the selected cases, capability findings, boundaries, decisions and live-build result. Capture next actions, owners, timing, blockers and asks for Colin. Move actions earlier/later to agree the sequence.

The agenda timer is manual and resets when changing stages. Allocate approximately 15 minutes of the architecture block to the optional content exercise; it is not an additional fifth agenda block. Session tools include a parking lot, JSON backup/restore, Markdown readout and print/PDF. Printing always renders the readout, whichever stage is open.

The guided screens label room states **Needs checking / Agreed / Disputed / Still unknown** (stored as Proposed / Confirmed / Disputed / Unknown). Editing a captured answer reopens its confirmation. Changes to a selected case’s scores, proof, notes or veto invalidate working-set confirmation. Vetoed cases cannot be selected. Retained records for deselected cases are labeled outside the current working set in the readout, so earlier work is not silently deleted.

## Content-at-scale exercise

No real approved asset has been supplied yet. A fictional practice brief is provided, with three editable audiences across website/content and event engagement. It makes no OpenAI product claims.

- Choose the associated use case; paste the source; record its status and approver.
- Define fixed claims, exact wording, exclusions, tone and what may change.
- Define up to six audiences with observed signals, needs and calls to action.
- **Practice mode** assembles local, editable templates from the entered text. It is explicitly labeled and does not claim to be AI generation. Fixed wording is copied as a review aid; a writer must apply guidance and polish it.
- **AI mode**, when configured, drafts one email and one landing-page headline per audience. Source and audience text are sent only when the facilitator requests AI drafting and checks the disclosure box. The private workshop code is held only in component memory, not in backups or local storage.
- Change a source or audience and regenerate all or one audience. The immediately previous version remains available for comparison. Source changes mark all existing drafts outdated; audience changes mark that audience’s draft outdated. Outdated drafts cannot be marked usable. Editing draft copy resets its review.
- Review each draft as pending, usable, needs edits or rejected, and capture why. Record baseline production time, observed editing/review time, and the room’s conclusion. This is an exercise judgment, not production approval or evidence of business lift.

## Optional AI connection

Create `.env.local` locally, or configure these environment variables in Vercel:

```text
OPENAI_API_KEY=<server-side API key>
OPENAI_MODEL=<Responses API model with Structured Outputs available to your account>
WORKSHOP_ACCESS_CODE=<private facilitator code>
```

All three are required to enable AI drafting. The code protects the paid endpoint from anonymous use. Keep it private and configure API project usage limits appropriate to the workshop. The endpoint enforces input size, bounded audience counts, a timeout, same-origin requests and response validation. It uses `store: false`; this is not a guarantee of zero data retention. Only use source material authorized for this service. Drafting does not publish or send marketing content.

Implementation reference: [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs). No default model or credentials are bundled. Errors preserve existing drafts and offer practice mode. Live API generation must be rehearsed with your configured credentials before the workshop; automated checks use a mocked API response.

## Source fidelity and scope

`reference/claude-workshop.html` preserves the supplied Claude workshop. The original seven scenes, evidence, KPI labels, questions, dependency notes and four-axis scoring remain intact. The introduction is corrected to describe a working hypothesis of **today**, not a future state. Short illustrative notes connect audience understanding, relevant messaging and learning across the journey; events are one touchpoint, not the organizing story.

Frequency, Severity, Evidence and Leverage each use 1–5 with the original anchors. Composite = `(frequency × severity × evidence × leverage) ** 0.25`. Default scores remain 3 and are labeled undiscussed. Ties retain day order. Veto excludes a case from ranking and selection. No / Not sure / Yes move-now status never changes the score.

`reference/internal/initial-architecture.pdf` and its PNG are internal starting material, retained outside the public web assets. They inform the preparation; they are never shown or exported as the room’s architecture.

## Persistence and export

The full session is browser-local under `oai-full-workshop-v1`. On first use it imports the previous four-axis assessments from `oai-adobe-morgan-workshop-v2`, retaining notes and proof statements. Older three-axis scores are not reinterpreted. Existing storage keys are left intact. Reload preserves inputs; clearing browser site data removes them.

JSON backup includes all assessments, current-state findings, architecture records, decisions, audiences, draft versions/reviews and next actions. Restore validates the format and asks before replacing the current session. Markdown and print readouts include the cross-stage conclusions. A visible notice appears if local saving fails; export before leaving. A malformed saved record is not overwritten automatically.

Use a single capture tab: concurrent facilitator edits in multiple tabs are not merged. No shared database, account system or automatic transcription is included.

## Verify

```sh
npm test
npm run typecheck
npm run build
npm start
```

Tests cover original source fidelity, exact scoring/veto behavior, selection confirmation, session round-tripping, malformed imports, draft freshness, content input/output validation, all stage render paths and generation endpoint authorization/failure handling with a mocked upstream response.

## Deploy to Vercel

Import `karenpiper/openAI_marketing`, choose Next.js, root directory `.`, Node.js 24.x, install `npm ci`, build `npm run build`, and the default framework output directory. No environment variables are required for practice mode. Add the three server variables above to enable AI drafting. The generation route has a 60-second maximum duration and a 45-second upstream timeout; confirm the deployment plan supports that duration. Use deployment access controls appropriate to the workshop materials. A repository push does not itself create a Vercel project.

## Main files

- `app/page.tsx`: agenda, persistence, import/export, timer and projector synchronization.
- `components/priority-workshop.tsx`: Morgan’s day, scoring and selection handoff.
- `components/workshop-mapping.tsx`: capability capture, architecture boundaries, handoffs and decisions.
- `components/content-lab.tsx`: source, audiences, drafting and review.
- `components/workshop-readout.tsx`: consolidated output and sequencing.
- `components/room-view.tsx`: read-only projection view.
- `lib/workshop.ts`: session model, validation, confirmation and export.
- `lib/generation.ts` and `app/api/generate/route.ts`: bounded AI drafting interface.

## Test steps 2–4 with temporary demo data

Click **Try demo data** in the header, or add `?demo=1` to the workshop URL. It starts at step 2 with three selected and confirmed use cases, plus editable current-state examples for all seven cases in the dropdown. Missing examples are added to older demo sessions without replacing existing answers. Sample records include reuse/extend/missing/unknown capabilities, proposed/confirmed/disputed decisions, architecture boundaries, directional handoffs, three editable practice drafts with previous versions, and sequenced next actions. Every example and named owner is fictional.

Demo mode saves to `oai-full-workshop-demo-v1`, separately from the real workshop, and uses a separate projector channel. Demo edits survive refresh. **Reset demo data** restores the sample. **Return to real workshop** reopens the untouched real session. The entry button checkpoints the real session before switching and stays put if it cannot save. Demo exports have a `DEMO-` filename prefix; printed and Markdown readouts identify test data. The demo projector uses `?view=room&demo=1`.

## Use-case labels

Selection, navigation, mapping and readouts use clear functional names: Buying-group engagement, Signal to action, Content at scale, Campaign launch & approvals, Routine marketing operations, Human oversight, and Measurement & learning. The original narrative headlines remain on Morgan’s scenes. Stable case IDs preserve existing notes, selections and demo records.

## Live interpretation in the room

Step 2 now returns a suggested capability alongside each answer and on the readback. Names come from the 28 prepared workshop questions; selected wording cues in the answer flag points to check. This is a transparent, local guided mapping, not an AI or general-purpose language analysis service. It works without credentials and never infers coverage, ownership or agreement as fact.

Read the quoted source back, correct the capability name if needed, choose **Works today / Works with gaps / Not in place / Not established**, then click **Yes, that describes it**, **We disagree**, or **We don’t know yet**. A disputed source answer cannot support an agreed interpretation. Multiple tools and their roles remain together with their evidence.

Architecture places the relevant source answers beside each proposed workflow step. Capture the room’s Keep / Change / Unresolved decision, correction, owner and next action there. Decisions remain distinct from capability agreement. Changed source answers invalidate interpretation agreement; previous edits remain visible for rechecking. The map follows the projector and persists in JSON, Markdown and print readouts. Fresh demo sessions include an agreed example and one awaiting discussion; existing demo answers produce suggestions immediately.


## Step 3 proposal walkthrough

All seven use cases have five prepared workflow steps. Content at scale moves through audience needs → approved source → variants → review → delivery and learning. The workflow is our facilitation proposal. Systems begin with editable proposals from our internal architecture. Responsibilities and final assignments come from the room’s answers. Nothing is pre-agreed in real sessions. Fresh demo sessions illustrate Keep, Change and Unresolved; use Reset demo data to load those new example decisions into an existing demo session.

Workflow decisions persist in the same local session, JSON backup, projected view, printed readout and Markdown export. Existing detailed architecture records remain available and are never replaced by the walkthrough. These choices document workshop direction; they do not provision systems or execute integrations.

## Step 0: workshop opening

Every fresh or reloaded facilitator session opens on **00 · Before we begin**, in real and demo modes. It introduces the agenda, intended outcomes, prior conversation context, open decisions and an editable attendee list. Attendance is not prefilled. **Enter workshop** starts Morgan’s day without clearing saved answers. If there is existing work, **Resume saved progress** returns to its saved stage. The header’s **Workshop overview** button returns here and pauses the timer. Reloading also pauses the timer while retaining elapsed time and all workshop inputs.

The projector follows the overview or active exercise, rather than resetting the facilitator’s current presentation. Attendees persist in JSON and appear in Markdown and printed readouts. The four agenda blocks remain numbered 1–4 and total 120 minutes; the opening does not change scoring, selections or stage data.

Step 0 is the sole home of **What we heard** and the four background decision summaries. It presents five visible story panels with scroll/arrow navigation, original statements, an agenda with outputs, open decisions and the attendee list. Nothing requires expansion. Morgan’s navigation now goes directly from her introduction to the first timed scene. Existing scene IDs and saved assessments are unchanged; the retired context scene (1) displays Morgan’s introduction for backward compatibility.


## Generated architecture and visual workshop

The readout’s **Download architecture PDF** builds a fresh document locally in the browser from current workshop data. No server upload, API key or print dialog is required. It includes selected and discussed workflows (unselected cases are marked), captured systems and roles, handoffs, controls, additional architecture notes and shared decisions. Agreed requires an explicit Keep/Change decision plus captured systems, owner, handoff and controls; incomplete choices remain unresolved, untouched steps remain proposed, and changed source evidence requires rechecking. A Change without a replacement is unresolved. The on-screen view uses the same model. This is the architecture discussed, not a claim of implemented integrations.

The PDF library and embedded Roboto fonts load only when requested. Automated tests generate and inspect a real PDF; the demo output has also been rendered for pagination review. Existing backups retain entered systems; empty system fields show editable proposals. Named owners, controls and handoffs remain for the room to establish.

Step 0 is a scrolling visual story with five chapters, directional navigation and no collapsed content. The current chapter follows to the projector. An original generated collage anchors the opening; local SVG activity drawings and paper-style capture cards extend the visual language across the workshop. Reduced-motion preferences are respected. Generated asset: `public/images/workshop-collage.png`; the pre-existing `workshop-team.jpg` is not used or modified.


## Architecture system prefills

Each of the 35 workflow steps suggests the relevant system boxes from the internal architecture as an editable starting point. These are our proposed assignments, not statements that the PDF specifies a complete integration. Suggestions are labeled and remain proposed until the room reviews them. They also appear as suggested systems in the generated output. Owners, controls and handoffs are not invented from the diagram.

Existing nonempty system entries are preserved. Editing or explicitly clearing a system field overrides its suggestion and survives reload. Suggestions are saved with the workflow when the facilitator captures an answer or decision; merely viewing a case does not create records or change the working set. Works in both real and demo sessions without resetting data.

## Save controls

Each data-entry section has a **Save** button as well as autosave: attendees, use-case notes/scores, working-set selection, current-state answers, live interpretations, workflow decisions, detailed architecture, source/audience/draft content, results, actions and session notes. Save writes the latest complete session to the same real/demo browser-local key and reports success or failure. It never confirms an answer or room decision. Print and projector views do not show capture controls.

A failed storage write reports an error; manual Save can retry storage and resume autosave. An unreadable existing saved session is protected from overwrite until restored or explicitly reset. The unfinished “another decision” input is also persisted. The optional private AI access code remains deliberately ephemeral and is not saved.
