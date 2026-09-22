import { useState } from "react";
import { contentVariants, exampleAccounts } from "../lib/content-variants";
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
  const [accountId, setAccountId] = useState("ACCT-01");
  const [segmentIndex, setSegmentIndex] = useState(0);
  const variants = contentVariants(session);
  const accountVariants = variants.filter((v) => v.accountId === accountId);
  const variant = accountVariants[segmentIndex] || accountVariants[0];
  const p = processState(session, "s3", 3);
  const channels = activationChannels(session.channel);
  const activeTab = channels.includes(tab) ? tab : channels[0];
  const approved = processReady(session, "s3", 2);
  const staged = p.reviewers[activeTab] === "Staged";
  function stage() {
    const reviewers = { ...p.reviewers, [activeTab]: "Staged" };
    onChange(
      processUpdate(
        p,
        {
          reviewers,
          status: channels.every((c) => reviewers[c] === "Staged")
            ? "Complete"
            : "Staging",
        },
        `${activeTab} master handoff (three approved role patterns, then account-level assembly across the cohort) accepted by the simulated connector. Routed to the configured team. Not sent.`,
      ),
    );
  }
  return (
    <section className="handoff-console">
      <header>
        <span className="agent-kicker">
          Activation workspace · simulated destination
        </span>
        <h3>Three approved patterns. Account-specific assembly.</h3>
        <p>
          Approve the role-level channel pattern once. The system then adapts it
          against account context and eligibility for the 12-account cohort. You
          are not reviewing 36 separate packages.
        </p>
      </header>
      <section className="handoff-channel-editor">
        <div>
          <span className="agent-kicker">Channel mix</span>
          <b>Adjust channels without leaving the handoff.</b>
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
      <nav aria-label="Channel work orders">
        {channels.map((c) => (
          <button
            key={c}
            aria-pressed={activeTab === c}
            onClick={() => setTab(c)}
          >
            {c} {p.reviewers[c] === "Staged" ? "✓" : ""}
          </button>
        ))}
      </nav>
      <section
        className="variant-browser"
        aria-label="Account content variants"
      >
        <div>
          <b>
            {accountVariants.length} master role patterns · 12 account-level
            instances after approval
          </b>
          <p>
            The master pattern holds the approved structure and claims. The
            account context changes the emphasis and next action at assembly
            time. This preview is a representative instance, not a recipient
            list or a send.
          </p>
        </div>
        <div className="variant-controls">
          <span className="agent-kicker">Representative account</span>
          <div className="variant-choice-row">
            {exampleAccounts.slice(0, 3).map((account) => (
              <button
                key={account.id}
                aria-pressed={accountId === account.id}
                onClick={() => setAccountId(account.id)}
              >
                {account.name}
              </button>
            ))}
          </div>
          <span className="agent-kicker">Role pattern</span>
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
        <p>
          <b>Account context:</b> {variant.context}. <b>Illustrative inputs:</b>{" "}
          CRM account context + identity / audience membership + engagement
          signals.
        </p>
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
            <div className="email-preview">
              <div>OPENAI FOR ENTERPRISE / NORTHSTAR HEALTH</div>
              <article>
                <small>FOR {variant.segment.toUpperCase()}</small>
                <h2>{variant.headline}</h2>
                <p>{variant.body}</p>
                <span className="preview-cta">{variant.cta} →</span>
              </article>
              <footer>
                Audience rule: resolved identity + eligible account context
              </footer>
            </div>
          ) : activeTab === "Sales enablement" ? (
            <div className="event-preview">
              <small>OPENAI FOR ENTERPRISE · SELLER BRIEF</small>
              <h2>{variant.account}</h2>
              <article>
                <b>Why this account, now</b>
                <p>
                  {variant.context}. The next buying-group conversation should
                  focus on {variant.segment.toLowerCase()} needs.
                </p>
              </article>
              <article>
                <b>Suggested seller action</b>
                <p>{variant.body}</p>
                <span>{variant.cta} →</span>
              </article>
              <footer>
                Includes role context, approved guide and campaign reference.
              </footer>
            </div>
          ) : activeTab === "Executive thought leadership" ? (
            <div className="event-preview">
              <small>OPENAI FOR ENTERPRISE · EXECUTIVE POV</small>
              <h2>{variant.headline}</h2>
              <article>
                <b>Perspective</b>
                <p>{variant.body}</p>
              </article>
              <article>
                <b>Distribution</b>
                <p>
                  Prepare executive social copy, a seller talking point and an
                  account-specific invitation to continue the conversation.
                </p>
              </article>
              <footer>
                Claims remain tied to the approved source and the review packet.
              </footer>
            </div>
          ) : (
            <div className="event-preview">
              <small>OPENAI FOR ENTERPRISE · SOCIAL</small>
              <h2>{variant.headline}</h2>
              <article>
                <b>Post copy</b>
                <p>{variant.body}</p>
              </article>
              <article>
                <b>Destination</b>
                <p>
                  Link to the matching approved website experience and retain
                  campaign, audience and account context.
                </p>
              </article>
              <footer>
                Prepared for review and staging; no content has been published.
              </footer>
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
            <p>
              Unresolved consent, suppressed contacts and unmatched identities.
            </p>
          </div>
          <div>
            <b>Asset binding</b>
            <p>
              {variant.source}. All {variants.length} candidate variants are
              included in the channel bundle; this preview shows one.
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
            disabled={!approved || staged}
            onClick={stage}
          >
            {staged
              ? "Prepared for release"
              : `Prepare ${activeTab.toLowerCase()} for release`}
          </button>
          {!approved && (
            <p>
              Return to the approval package to obtain the required reviews.
            </p>
          )}
          {staged && (
            <div className="handoff-receipt" role="status">
              <b>✓ Prepared · not sent</b>
              <p>
                WO-
                {activeTab
                  .toUpperCase()
                  .replace(/[^A-Z]/g, "")
                  .slice(0, 8)}
                -001
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
        {channels.filter((c) => p.reviewers[c] === "Staged").length} of{" "}
        {channels.length} channels prepared · then we’ll check eligibility
        before release.
      </div>
    </section>
  );
}
