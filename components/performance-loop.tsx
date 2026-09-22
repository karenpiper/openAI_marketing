import { useState } from "react";
import type { AgentState } from "../lib/agent-workspace";
export default function PerformanceLoop({
  session,
  onSave,
  onApply,
}: {
  session: AgentState;
  onSave: (p: NonNullable<AgentState["learning"]>) => void;
  onApply: (instruction: string) => void;
}) {
  const [evidence, setEvidence] = useState("roles");
  const saved = session.learning;
  const [choice, setChoice] = useState(saved?.choice || "");
  const [reason, setReason] = useState(saved?.reason || "");
  const choices = [
    [
      "message",
      "Test a clearer business-sponsor message",
      "Most delivery succeeded, but sponsor engagement lagged. Test the message before increasing volume.",
    ],
    [
      "data",
      "Improve campaign measurement before widening activation",
      "Strengthen the evidence for account progression before making an expansion decision.",
    ],
    [
      "scale",
      "Expand the technical-evaluator audience",
      "Promising engagement, but a small sample and incomplete matching make this a higher-risk choice.",
    ],
  ];
  const instruction =
    choice === "message"
      ? "Next iteration: test a clearer business-sponsor value proposition using approved evidence. Keep volume fixed and compare qualified follow-up, not opens."
      : choice === "data"
        ? "Next iteration: strengthen campaign measurement before widening activation. Retain the current audience and route the measurement task to the data team."
        : "Next iteration: run a limited technical-evaluator expansion test. Do not treat engagement as revenue impact; review qualified outcomes before scaling further.";
  return (
    <section className="performance-loop">
      <span className="agent-kicker">
        A few days later · fictional reference campaign
      </span>
      <h1>What happened—and what should we change?</h1>
      <p>
        This fictional readout follows Northstar Health and its expansion cohort
        after a reviewed email and roundtable-follow-up program. It is fixed
        reference data, not results from a live deployment or from your current
        edits.
      </p>
      <div className="performance-metrics">
        <article>
          <b>178 / 180</b>
          <span>Delivered contacts</span>
        </article>
        <article>
          <b>36</b>
          <span>Meaningful engagements</span>
        </article>
        <article>
          <b>8</b>
          <span>Qualified next actions</span>
        </article>
        <article>
          <b>12 / 12</b>
          <span>Accounts in the reference cohort</span>
        </article>
      </div>
      <div className="learning-agent">
        <b>✳ My read</b>
        <p>
          Northstar’s technical audience engaged, but the business-sponsor
          segment generated only one qualified next step. I’d test the sponsor
          message before adding volume—and measure the next iteration before
          claiming account-level impact.
        </p>
      </div>
      <nav>
        {[
          ["roles", "Audience results"],
          ["channels", "Channel results"],
          ["quality", "Data quality"],
        ].map(([id, label]) => (
          <button
            key={id}
            aria-pressed={evidence === id}
            onClick={() => setEvidence(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      {evidence === "roles" ? (
        <div className="performance-table">
          <div className="perf-row">
            <b>Audience</b>
            <b>Delivered</b>
            <b>Engaged</b>
            <b>Next action</b>
          </div>
          {[
            ["Technical evaluators", 79, 25, 6],
            ["Business sponsors", 59, 6, 1],
            ["Procurement / governance", 40, 5, 1],
          ].map(([role, delivered, engaged, next]) => (
            <div className="perf-row" key={role}>
              <span>{role}</span>
              <span>{delivered}</span>
              <span>{engaged}</span>
              <strong>{next}</strong>
            </div>
          ))}
          <p>
            Engaged = at least one tracked resource or event interaction. Next
            action = an illustrative qualified follow-up request. Contact-level
            counts are deduplicated.
          </p>
        </div>
      ) : evidence === "channels" ? (
        <div className="performance-table">
          <div className="perf-row">
            <b>Channel</b>
            <b>Engagements</b>
            <b>Next actions</b>
            <b>Readout</b>
          </div>
          <div className="perf-row">
            <span>Email</span>
            <span>28</span>
            <span>5</span>
            <span>Reach is working</span>
          </div>
          <div className="perf-row">
            <span>Event follow-up</span>
            <span>14</span>
            <span>4</span>
            <span>Useful depth</span>
          </div>
          <p>
            6 contacts engaged across both channels; 1 next action overlaps.
            Channel counts are not additive. No revenue attribution is claimed.
          </p>
        </div>
      ) : (
        <div className="performance-table">
          <h3>Measurement is incomplete for the next expansion decision.</h3>
          <p>
            Activity is present, but the current reference program does not yet
            connect channel response to a confirmed account progression signal.
            A consent hold also remains separate from performance analysis.
          </p>
          <p>
            <b>Data needed:</b> campaign identifiers, channel events,
            consent-safe identity joins and confirmed CRM progression.
          </p>
        </div>
      )}
      <aside className="decision-helper">
        <b>Watchout · engagement is not business impact</b>
        <p>
          The sponsor sample is small. We cannot tell whether the gap is the
          message, timing or missing context. No control group or revenue
          outcome is available. Use this to choose a test, not declare a winner.
        </p>
      </aside>
      <h3>What should I do next?</h3>
      <div className="learning-options">
        {choices.map(([id, title, detail]) => (
          <label key={id}>
            <input
              type="radio"
              name="learning-decision"
              checked={choice === id}
              onChange={() => {
                setChoice(id);
                onSave({ choice: id, reason, applied: false });
              }}
            />
            <span>
              <b>{title}</b>
              <small>{detail}</small>
            </span>
          </label>
        ))}
      </div>
      <label>
        Your rationale{" "}
        {choice === "scale" ? "(required for expansion)" : "(optional)"}
        <textarea
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            onSave({ choice, reason: e.target.value, applied: false });
          }}
        />
      </label>
      <button
        className="agent-primary"
        disabled={!choice || (choice === "scale" && !reason.trim())}
        onClick={() => {
          onSave({ choice, reason, applied: true });
          onApply(instruction);
        }}
      >
        Use this learning in the next plan →
      </button>
      <p className="learning-source">
        <b>Proposed data loop:</b> marketing CRM / Marketo + Events → Customer
        Journey Analytics → OpenAI data lake and agent. CRM progression and
        identity context are required to validate the business outcome.
      </p>
    </section>
  );
}
