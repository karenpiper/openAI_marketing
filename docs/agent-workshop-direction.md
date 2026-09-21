# OpenAI workshop adaptation — September 21

## Preserve the original

The discovery workshop is preserved at commit `8a1785b` on `archive/workshop-discovery-2026-09-21`. Main remains unchanged. Adaptation work belongs on `feature/agent-led-workshop` in the separate `openai-agent-workshop` checkout. The adapted interface now includes three simulated agent chapters, condition-driven content planning, capability capture, architecture annotations and readout.

## Purpose

Adapt the experience for a 90-minute OpenAI workshop. Show a tangible, imagined near-term marketer experience so the room can align on priorities and identify the capabilities needed to make it real. Do not imply the simulated interface is connected to real systems or represents today's operation.

The original seven-problem discovery exercise remains useful for other clients. This version starts from what we heard, with three candidate focus areas the room can correct or reject:

- Signal to action: turn richer journey, account and product signals into defensible recommendations.
- Content at scale: coordinate audience-specific content and activation across channels. This deserves the most demonstration depth.
- Routine marketing operations: resolve routine work, exceptions and learning without routing everything through specialists.

Buying groups, approvals, human oversight, activation and measurement become parts of these workflows rather than seven separate scoring stops. Events remain one activation option among several.

## Experience

1. **Brief opening:** what we heard, the three candidate focus areas, and the intended outputs. Minimize setup.
2. **Morgan's agent workspace:** one coherent product simulation with three story chapters. Replace decorative scene illustrations with the imagined interface. Show an agent's recommendation, its evidence, the proposed action, and Morgan's approval or intervention. Keep narrative short and clearly label the experience as a proposal.
3. **Capability discussion within each chapter:** visible inputs and outputs explain what each interaction requires. Capture the distinction between available now, feasible internally soon, needs additional capability, and unknown. An absent process is a valid finding, not a blank form to repair. Do not equate 'we could build it' with 'it is running today.'
4. **Architecture:** use the existing architecture proposal and highlighted flows to discuss how the agreed capabilities could work, including ownership boundaries and alternative implementations. Keep proposed components distinct from room-confirmed systems.
5. **Readout:** three agreed use cases, working architecture with ownership boundaries, and a short list of decisions, dependencies and sequencing needs.

Combine priority and capability discussion instead of repeating it in a separate current-state questionnaire. Keep existing scoring available only where it helps; it should not gate the demonstration. Importance and ability to move now remain separate judgments.

## What each simulated moment must expose

- What Morgan is trying to accomplish.
- What the agent observes, recommends or prepares.
- Inputs and connectors required, clearly marked as illustrative until confirmed.
- Output or handoff produced.
- What the agent may do and what requires a person.
- What exists, what is plausible internally, what is missing, and what remains unknown.
- What must be proven first.

Example: show a recommendation informed by product telemetry plus journey and account context. If the room already has telemetry-based targeting, ask whether the richer version is available. Identify the specific missing input or capability instead of dismissing the whole use case as already solved.

## Interaction and facilitation

Use simple agent conversation and action cards rather than a large marketing dashboard. Buttons should demonstrate meaningful state changes with fictional data, including reviewing rationale, changing an audience or channel, and approving or revising a proposed action. Simulated approval must never send or launch anything.

The shared screen should lead with the product experience. Keep facilitator capture compact and secondary; avoid another set of per-step forms. Preserve local autosave, demo mode, architecture export and concise readout. Give the adapted prototype separate storage keys so testing cannot overwrite original workshop sessions.

Do not generate real marketing content. Show how audience context, approved material, orchestration, review and activation connect. Do not pre-assert which vendor or internal team must fill an unconfirmed capability gap.

## Implementation sequence

1. Build the unified workspace and content-at-scale chapter as the representative experience.
2. Add signal-to-action and routine-operations chapters using the same interaction pattern.
3. Add compact capability capture and connect it to architecture annotations and readout.
4. Update the opening, demo fixtures, persistence and exports for the adapted flow.
5. Validate the full facilitator journey and responsive presentation before promoting the adaptation to main.

No production replacement or deployment change is part of preserving and branching this version.
