import { useState } from "react";
import { contentVariants } from "../lib/content-variants";
import type { AgentState } from "../lib/agent-workspace";
import {
  processReady,
  processState,
  processUpdate,
  type ProcessState,
} from "../lib/process-state";

function activationChannels(plan: string) {
  const explicit = plan.split(" + ");
  if (explicit.every((channel) => channel !== "")) {
    const custom = explicit.filter((channel) =>
      [
        "Email",
        "Event follow-up",
        "Website",
        "Sales enablement",
        "Executive thought leadership",
        "Social campaign",
      ].includes(channel),
    );
    if (custom.length === explicit.length) return custom;
  }
  if (plan.includes("Integrated"))
    return [
      "Sales enablement",
      "Executive thought leadership",
      "Social campaign",
      "Event follow-up",
      "Website",
    ];
  if (plan.includes("thought leadership"))
    return ["Sales enablement", "Executive thought leadership"];
  if (plan.includes("Social")) return ["Social campaign", "Website"];
  if (plan.includes("event")) return ["Email", "Event follow-up"];
  return ["Email", "Website"];
}
export default function ChannelHandoff({
  session,
  onChange,
  onCampaignChange,
}: {
  session: AgentState;
  onChange: (p: ProcessState) => void;
  onCampaignChange?: (patch: Partial<AgentState>) => void;
}) {
  const [tab, setTab] = useState("Email");
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [adjustingChannels, setAdjustingChannels] = useState(false);
  const variants = contentVariants(session);
  const accountVariants = variants.filter((v) => v.accountId === "ACCT-01");
  const variant = accountVariants[segmentIndex] || accountVariants[0];
  const p = processState(session, "s3", 3);
  const channels = activationChannels(session.channel);
  const activeTab = channels.includes(tab) ? tab : channels[0];
  const approved = processReady(session, "s3", 2);
  const campaignPrepared = channels.every((channel) => p.reviewers[channel] === "Staged");
  function stage() {
    const reviewers = {
      ...p.reviewers,
      ...Object.fromEntries(channels.map((channel) => [channel, "Staged"])),
    };
    onChange(
      processUpdate(
        p,
        {
          reviewers,
          status: "Complete",
        },
        `${activeTab} output for Northstar Health accepted by the simulated connector. Routed to the configured team. Not sent.`,
      ),
    );
  }
  return (
    <section className="handoff-console">
      <header>
        <span className="agent-kicker">
          Activation workspace · simulated destination
        </span>
        <h3>Campaign outputs for Northstar Health</h3>
        <p>
          Review the actual channel-ready work for this campaign. Each output
          uses the selected audience, content theme and approved direction.
        </p>
      </header>
      <button
        className="handoff-adjust-trigger"
        aria-expanded={adjustingChannels}
        onClick={() => setAdjustingChannels((open) => !open)}
      >
        {adjustingChannels ? "Close channel settings" : "Adjust channel mix"}
      </button>
      {adjustingChannels && (
        <section className="handoff-channel-editor">
          <div>
            <span className="agent-kicker">Channel mix</span>
            <b>Choose the campaign outputs to prepare.</b>
            <p>
              Changes rebuild this handoff and require the revised mix to be
              reviewed before release.
            </p>
          </div>
          <div>
          {[
            "Email",
            "Event follow-up",
            "Website",
            "Sales enablement",
            "Executive thought leadership",
            "Social campaign",
          ].map((channel) => {
            const selected = channels.includes(channel);
            return (
              <button
                key={channel}
                aria-pressed={selected}
                onClick={() => {
                  const next = selected
                    ? channels.filter((item) => item !== channel)
                    : [...channels, channel];
                  if (next.length)
                    onCampaignChange?.({ channel: next.join(" + ") });
                }}
              >
                {selected ? "✓ " : "+ "}
                {channel}
              </button>
            );
          })}
          </div>
        </section>
      )}
      <section className="handoff-output-picker" aria-label="Campaign outputs">
        <span className="agent-kicker">Choose an output to inspect</span>
        {channels.map((c) => (
          <button
            key={c}
            aria-pressed={activeTab === c}
            onClick={() => setTab(c)}
          >
            <span className="output-card-icon" aria-hidden="true">
              {c === "Email" ? "✉" : c === "Website" ? "◧" : c === "Social campaign" ? "◌" : c === "Sales enablement" ? "▤" : c === "Executive thought leadership" ? "✦" : "◎"}
            </span>
            <span>
                <b>{c}</b>
              <small>{campaignPrepared ? "Prepared" : "Open preview"}</small>
            </span>
          </button>
        ))}
      </section>
      <section
        className="variant-browser"
        aria-label="Audience versions"
      >
        <div>
          <b>Northstar Health · {session.audience}</b>
          <p>
            This shows one audience-specific version of the selected output.
            Switch versions to see how the same campaign adapts its message and
            next action for a different audience.
          </p>
        </div>
        <div className="variant-controls">
          <span className="agent-kicker">Audience version</span>
          <div className="variant-choice-row">
            {accountVariants.map((item, index) => (
              <button
                key={item.id}
                aria-pressed={segmentIndex === index}
                onClick={() => setSegmentIndex(index)}
              >
                {item.segment}
              </button>
            ))}
          </div>
        </div>
        <p><b>Why this version:</b> {variant.context}</p>
      </section>
      <div className="handoff-canvas">
        <div className="handoff-preview">
          <span className="agent-kicker">
            {activeTab} · illustrative preview
          </span>
          {activeTab === "Email" ? (
            <div className="email-preview">
              <div>
                <b>To</b> {variant.account} · {variant.segment}
              </div>
              <div>
                <b>Subject</b> {variant.subject}
              </div>
              <article>
                <small>OPENAI FOR ENTERPRISE</small>
                <h2>{variant.headline}</h2>
                <p>{variant.body}</p>
                <p className="email-proof">{variant.proof}</p>
                <span className="preview-cta">{variant.cta} →</span>
              </article>
              <footer>
                {variant.id} · fictional copy · not generated or sent by a live
                service
              </footer>
            </div>
          ) : activeTab === "Event follow-up" ? (
            <div className="event-preview">
              <small>OPENAI FOR ENTERPRISE · EVENT FOLLOW-UP</small>
              <h2>{variant.headline}</h2>
              <article>
                <b>For attendees</b>
                <p>
                  Thank you for joining the enterprise adoption roundtable.{" "}
                  {variant.body}
                </p>
                <span>{variant.cta} →</span>
              </article>
              <article>
                <b>For registrants who missed it</b>
                <p>
                  We saved the key decision framework from the session: connect
                  active technical use to a clear operating and governance path.
                </p>
                <span>Review the session guide →</span>
              </article>
              <footer>
                One approved event pattern; attendee status changes the opening
                and CTA at assembly.
              </footer>
            </div>
          ) : activeTab === "Website" ? (
            <div className="website-preview">
              <nav><b>OpenAI</b><span>Enterprise</span><span>Resources</span><button>Talk to sales</button></nav>
              <div className="website-hero">
                <small>FOR NORTHSTAR HEALTH · {variant.segment.toUpperCase()}</small>
                <h2>{variant.headline}</h2>
                <p>{variant.body}</p>
                <button>{variant.cta} →</button>
              </div>
              <div className="website-proof-grid"><span>Practical adoption path</span><span>Decision-ready guidance</span><span>Governed expansion</span></div>
            </div>
          ) : activeTab === "Sales enablement" ? (
            <div className="seller-preview">
              <header><span>OPENAI FOR ENTERPRISE</span><b>Account brief</b><em>Northstar Health</em></header>
              <div className="seller-score"><span>Opportunity signal</span><b>Active evaluation · sponsor gap</b></div>
              <section><small>WHY NOW</small><p>{variant.context}</p></section>
              <section><small>CONVERSATION OPENING</small><h2>{variant.headline}</h2><p>{variant.body}</p></section>
              <footer><b>Suggested next move</b><span>{variant.cta} →</span></footer>
            </div>
          ) : activeTab === "Executive thought leadership" ? (
            <div className="pov-preview">
              <header><b>OpenAI</b><span>Ideas</span><span>Enterprise</span></header>
              <article><small>POINT OF VIEW</small><h2>{variant.headline}</h2><p>{variant.body}</p><blockquote>“The question is no longer whether teams can begin. It is how leaders create the conditions for useful, governed adoption.”</blockquote><div><span>5 min read</span><b>Read the perspective →</b></div></article>
            </div>
          ) : (
            <div className="social-preview">
              <header><span className="social-avatar">O</span><div><b>OpenAI</b><small>Sponsored · for {variant.segment}</small></div><span>•••</span></header>
              <p>{variant.body}</p>
              <div className="social-card"><small>OPENAI FOR ENTERPRISE</small><h2>{variant.headline}</h2><span>{variant.cta} →</span></div>
              <footer><span>♡ 128</span><span>◌ 24 comments</span><span>↗ Share</span></footer>
            </div>
          )}
        </div>
        <div className="handoff-settings">
          <div>
            <b>Account package</b>
            <p>
              {variant.account} · {variant.segment} · {variant.id}
            </p>
          </div>
          <div>
            <b>Exclusions</b>
            <p>Consent holds and pre-applied eligibility rules.</p>
          </div>
          <div>
            <b>Asset binding</b>
            <p>
              {variant.source}. This preview shows the approved Northstar
              audience version for the selected channel.
            </p>
          </div>
          <div>
            <b>Destination</b>
            <p>
              {activeTab === "Email"
                ? "CRM (Marketing) / proposed Marketo connector"
                : activeTab === "Event follow-up"
                  ? "Events + marketing CRM"
                  : activeTab === "Website"
                    ? "Marketing Website"
                    : activeTab === "Sales enablement"
                      ? "Sales CRM / account team"
                      : activeTab === "Executive thought leadership"
                        ? "Executive communications workflow + sales CRM"
                        : "Social publishing / advocacy workflow"}
            </p>
          </div>
          <div>
            <b>Tracking attached</b>
            <p>
              Campaign: enterprise-adoption
              <br />
              Audience: buying-role / lifecycle segment
              <br />
              Channel: {activeTab}
            </p>
          </div>
          <div className="handoff-gate">
            <b>
              {approved
                ? "✓ Review packet approved"
                : "Review packet not approved"}
            </b>
            <p>Eligibility and destination checks still gate release.</p>
          </div>
          <button
            className="agent-primary"
            disabled={!approved || campaignPrepared}
            onClick={stage}
          >
            {campaignPrepared
              ? "Campaign outputs prepared"
              : `Prepare all ${channels.length} campaign outputs`}
          </button>
          {!approved && (
            <p>
              Return to the approval package to obtain the required reviews.
            </p>
          )}
          {campaignPrepared && (
            <div className="handoff-receipt" role="status">
              <b>✓ Prepared · not sent</b>
              <p>
                Campaign handoff · {channels.join(" · ")}
                <br />
                Status: accepted into staging
                <br />
                Routing: marketing operations
                <br />
                Release: blocked pending final checks
                <br />
                Sent: no
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="handoff-progress">
        One campaign handoff covers {channels.length} selected outputs.
        Eligibility and final destination checks still gate release.
      </div>
    </section>
  );
}
