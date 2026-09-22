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
  const themeImage: Record<string, string> = {
    "adoption-in-practice": "/images/campaign/adoption-in-practice.png",
    "business-value": "/images/campaign/business-value.png",
    "confidence-to-scale": "/images/campaign/confidence-to-scale.png",
  };
  const creativeImage =
    themeImage[previewTheme] || themeImage["adoption-in-practice"];
  const p = processState(session, "s3", 3);
  const channels = activationChannels(session.channel);
  const activeTab = channels.includes(tab) ? tab : channels[0];
  const approved = processReady(session, "s3", 2);
  const campaignPrepared = channels.every((channel) => p.reviewers[channel] === "Staged");
  const deploymentStaged = p.owner === "Deployment staged";
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
  function deploymentDestination(channel: string) {
    if (channel === "Email") return "Marketing CRM / Marketo connector";
    if (channel === "Event follow-up") return "Event platform + marketing CRM";
    if (channel === "Website") return "Marketing website / CMS connector";
    if (channel === "Sales enablement") return "Sales CRM / account workspace";
    if (channel === "Executive thought leadership") return "Executive communications workflow";
    return "Social trafficking / advocacy workflow";
  }
  function deploy() {
    onChange(
      processUpdate(
        p,
        { owner: "Deployment staged" },
        `Campaign deployment staged through the proposed connectors: ${channels.map((channel) => `${channel} → ${deploymentDestination(channel)}`).join("; ")}. No live assets were published.`,
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
                <img className="email-creative" src={creativeImage} alt="" />
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
              <nav className="website-nav">
                <b>OpenAI</b>
                <div className="website-nav-links"><span>Why OpenAI</span><span>Solutions</span><span>Resources</span></div>
                <button>Contact sales</button>
              </nav>
              <main className="website-landing">
                <section className="website-copy">
                  <small>OPENAI FOR BUSINESS</small>
                  <h2>{variant.headline}</h2>
                  <p>{variant.body}</p>
                  <button>{variant.cta} <span>↗</span></button>
                </section>
                <section className="website-image">
                  <img src={creativeImage} alt="Illustrative enterprise team collaborating" />
                  <div className="website-image-caption">
                    <span>PERSONALIZED FOR</span>
                    <b>{variant.recipient}</b>
                    <small>{variant.segment} · Northstar Health</small>
                  </div>
                </section>
              </main>
              <section className="website-proof-grid">
                <div><b>One shared foundation</b><span>Approved material is carried forward.</span></div>
                <div><b>Relevant by design</b><span>Each role receives the right emphasis.</span></div>
                <div><b>Ready to act</b><span>A clear next step for {variant.recipient.split(" ")[0]}.</span></div>
              </section>
            </div>
          ) : activeTab === "Sales enablement" ? (
            <div className="seller-preview">
              <header><span>OPENAI FOR ENTERPRISE</span><b>Account brief</b><em>Northstar Health</em></header>
              <div className="seller-score"><span>Opportunity signal</span><b>Active evaluation · sponsor gap</b></div>
              <section><small>WHY NOW</small><p>{variant.context}</p></section>
              <section><small>CONVERSATION OPENING</small><h2>{variant.headline}</h2><p>{variant.body}</p><img src={creativeImage} alt="" /></section>
              <footer><b>Suggested next move</b><span>{variant.cta} →</span></footer>
            </div>
          ) : activeTab === "Executive thought leadership" ? (
            <div className="pov-preview">
              <header><b>OpenAI</b><span>Ideas</span><span>Enterprise</span></header>
              <article><small>POINT OF VIEW</small><img src={creativeImage} alt="" /><h2>{variant.headline}</h2><p>{variant.body}</p><blockquote>“The question is no longer whether teams can begin. It is how leaders create the conditions for useful, governed adoption.”</blockquote><div><span>5 min read</span><b>Read the perspective →</b></div></article>
            </div>
          ) : (
            <div className="social-preview">
              <header><span className="social-avatar">O</span><div><b>OpenAI</b><small>Sponsored · for {variant.recipient}</small></div><span>•••</span></header>
              <p>{variant.body}</p>
              <div className="social-card"><img src={creativeImage} alt="" /><small>OPENAI FOR ENTERPRISE</small><h2>{variant.headline}</h2><span>{variant.cta} →</span></div>
              <footer><span>♡ 128</span><span>◌ 24 comments</span><span>↗ Share</span></footer>
            </div>
          )}
        </div>
      </div>
        </div>
      )}
      {campaignPrepared && (
        <section className="deployment-panel">
          <header>
            <span className="agent-kicker">Next · simulated deployment</span>
            <h3>Stage the campaign in its connected destinations.</h3>
            <p>
              The agent carries the approved audience rules, personalized
              assets, campaign ID and measurement instructions into every
              destination as one coordinated release package.
            </p>
          </header>
          <div className="deployment-routes">
            {channels.map((channel) => (
              <article key={channel}>
                <span>{channel}</span>
                <b>→</b>
                <strong>{deploymentDestination(channel)}</strong>
              </article>
            ))}
          </div>
          {!deploymentStaged ? (
            <button className="agent-primary" onClick={deploy}>
              Stage campaign in connected destinations
            </button>
          ) : (
            <div className="deployment-receipt" role="status">
              <b>✓ Campaign staged · not published</b>
              <p>
                Each destination has the right personalized asset, audience
                rule, campaign identifier and measurement instruction. Final
                eligibility and destination checks remain before release.
              </p>
            </div>
          )}
        </section>
      )}
      <div className="handoff-progress">
        {campaignPrepared
          ? `Prepared as one campaign handoff: ${channels.join(" · ")}. Release remains gated by eligibility and final destination checks.`
          : "The previews are for review only. Preparing the campaign will create one coordinated handoff for every selected output."}
      </div>
    </section>
  );
}
