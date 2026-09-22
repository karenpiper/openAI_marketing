import { useState } from "react";
import { contentVariants } from "../lib/content-variants";
import {
  contentSourceOptions,
  selectedContentSource,
} from "../lib/content-source-library";
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
  const [showGallery, setShowGallery] = useState(false);
  const [previewTheme, setPreviewTheme] = useState(() =>
    selectedContentSource(session).id,
  );
  const variants = contentVariants(session, previewTheme);
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
        <h3>One campaign. Multiple channel-ready outputs.</h3>
        <p>
          Inspect any output below. The system applies the approved audience,
          content theme and direction across the campaign automatically.
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
      <section className="handoff-campaign-summary">
        <div>
          <span className="agent-kicker">Campaign scope</span>
          <b>Northstar Health · {session.audience}</b>
          <p>
            {accountVariants.map((item) => item.recipient).join(" · ")} each
            receive a 1:1 adaptation from the same approved direction. Morgan
            does not compose these versions one by one.
          </p>
        </div>
        <div>
          <span className="agent-kicker">Preparation</span>
          <b>{campaignPrepared ? "Campaign outputs prepared" : "Ready to prepare as one campaign"}</b>
          <p>One handoff covers all {channels.length} selected outputs.</p>
          <button
            className="agent-primary"
            disabled={!approved || campaignPrepared}
            onClick={stage}
          >
            {campaignPrepared
              ? "Campaign outputs prepared"
              : `Prepare complete campaign`}
          </button>
          {!approved && <small>Complete the approval packet first.</small>}
        </div>
      </section>
      <button
        className="open-output-gallery"
        onClick={() => setShowGallery(true)}
      >
        <span aria-hidden="true">▧</span> Open campaign output gallery
      </button>
      {showGallery && (
        <div
          className="asset-gallery-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Northstar Health campaign output gallery"
        >
          <header className="asset-gallery-header">
            <div>
              <span className="agent-kicker">Northstar Health campaign</span>
              <h3>Campaign output gallery</h3>
              <p>Inspect each channel-ready artifact, then return to Morgan’s workspace.</p>
            </div>
            <button onClick={() => setShowGallery(false)}>Close gallery ✕</button>
          </header>
          <section className="gallery-inspector" aria-label="Asset preview controls">
            <div>
              <span className="agent-kicker">Recipient preview</span>
              <p>Inspect the 1:1 version prepared for each buying-group member.</p>
              <div className="gallery-choice-row">
                {accountVariants.map((item, index) => (
                  <button
                    key={item.id}
                    aria-pressed={segmentIndex === index}
                    onClick={() => setSegmentIndex(index)}
                  >
                    <b>{item.recipient}</b>
                    <small>{item.segment}</small>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="agent-kicker">Content theme</span>
              <p>Compare the same asset under each fictional message theme.</p>
              <div className="gallery-choice-row">
                {contentSourceOptions.map((theme) => (
                  <button
                    key={theme.id}
                    aria-pressed={previewTheme === theme.id}
                    onClick={() => setPreviewTheme(theme.id)}
                  >
                    {theme.title}
                    {selectedContentSource(session).id === theme.id && (
                      <small>Campaign theme</small>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <p className="gallery-preview-note">
              Preview only. Each recipient version uses their role and observed
              signal; changing a preview does not change the approved campaign.
            </p>
          </section>
      <section className="handoff-output-picker" aria-label="Campaign outputs">
        <span className="agent-kicker">Preview a channel output</span>
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
      <div className="handoff-canvas">
        <div className="handoff-preview">
          <span className="agent-kicker">
            {activeTab} · illustrative preview
          </span>
          {activeTab === "Email" ? (
            <div className="email-preview">
              <div>
                <b>To</b> {variant.recipient} · {variant.segment} · {variant.account}
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
              <header><span className="social-avatar">O</span><div><b>OpenAI</b><small>Sponsored · for {variant.recipient}</small></div><span>•••</span></header>
              <p>{variant.body}</p>
              <div className="social-card"><small>OPENAI FOR ENTERPRISE</small><h2>{variant.headline}</h2><span>{variant.cta} →</span></div>
              <footer><span>♡ 128</span><span>◌ 24 comments</span><span>↗ Share</span></footer>
            </div>
          )}
        </div>
      </div>
        </div>
      )}
      <div className="handoff-progress">
        {campaignPrepared
          ? `Prepared as one campaign handoff: ${channels.join(" · ")}. Release remains gated by eligibility and final destination checks.`
          : "The previews are for review only. Preparing the campaign will create one coordinated handoff for every selected output."}
      </div>
    </section>
  );
}
