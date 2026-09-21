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
}: {
  session: AgentState;
  onChange: (p: ProcessState) => void;
}) {
  const [tab, setTab] = useState("Email");
  const [accountId, setAccountId] = useState("ACCT-01");
  const [segmentIndex, setSegmentIndex] = useState(0);
  const variants = contentVariants(session);
  const accountVariants = variants.filter((v) => v.accountId === accountId);
  const variant = accountVariants[segmentIndex] || accountVariants[0];
  function downloadVariants() {
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            {
              notice:
                "Fictional candidate variants; not sent or live-generated. Recipient eligibility and review gates still apply.",
              variants,
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "account-content-variants.json";
    link.click();
    URL.revokeObjectURL(url);
  }
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
        `${activeTab} bundle (${variants.length} candidate account packages across 12 accounts) accepted by the simulated connector. Routed to the configured team. Not sent.`,
      ),
    );
  }
  return (
    <section className="handoff-console">
      <header>
        <span className="agent-kicker">
          Activation workspace · simulated destination
        </span>
        <h3>One source. Twelve account packages.</h3>
        <p>
          Review the account and audience variants, then prepare each channel
          for release. The agent routes the work to the configured team. Nothing
          is sent yet.
        </p>
      </header>
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
            {variants.length} candidate account packages · 12 accounts ·{" "}
            {accountVariants.length} audience{" "}
            {accountVariants.length === 1 ? "version" : "versions"} each
          </b>
          <p>
            Shared source and layout; different audience needs, message and next
            action. These are fictional examples, not {variants.length}{" "}
            confirmed recipients or sends.
          </p>
        </div>
        <div className="variant-controls">
          <label>
            Account
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              {exampleAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Audience version
            <select
              value={accountVariants.indexOf(variant)}
              onChange={(e) => setSegmentIndex(Number(e.target.value))}
            >
              {accountVariants.map((v, i) => (
                <option key={v.id} value={i}>
                  {v.segment}
                </option>
              ))}
            </select>
          </label>
          <button onClick={downloadVariants}>
            Download all {variants.length} variants
          </button>
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
                <small>ENTERPRISE ADOPTION</small>
                <h2>{variant.headline}</h2>
                <p>{variant.body}</p>
                <div className="source-preview">
                  ▤ Enterprise adoption guide
                  <br />
                  <small>v3 · source reference attached</small>
                </div>
                <span className="preview-cta">{variant.cta} →</span>
              </article>
              <footer>
                {variant.id} · fictional copy · not generated or sent by a live
                service
              </footer>
            </div>
          ) : activeTab === "Event follow-up" ? (
            <div className="event-preview">
              <h2>
                Two paths.
                <br />
                One event context.
              </h2>
              <article>
                <b>Attended</b>
                <p>
                  Prepare a follow-up referencing the session and the approved
                  adoption guide.
                </p>
                <span>Next step → account conversation</span>
              </article>
              <article>
                <b>Did not attend</b>
                <p>
                  Prepare the approved resource path without claiming
                  attendance.
                </p>
                <span>Next step → review the guide</span>
              </article>
              <footer>
                Suppress duplicate invitations and ineligible contacts.
              </footer>
            </div>
          ) : activeTab === "Website" ? (
            <div className="email-preview">
              <div>Marketing website / proposed audience experience</div>
              <article>
                <small>FOR YOUR TEAM</small>
                <h2>
                  A clearer path
                  <br />
                  to enterprise adoption.
                </h2>
                <div className="source-preview">Approved guide placement</div>
                <span className="preview-cta">Explore the guide →</span>
              </article>
              <footer>
                Audience rule: resolved identity + eligible account context
              </footer>
            </div>
          ) : activeTab === "Sales enablement" ? (
            <div className="event-preview">
              <h2>
                Seller-ready
                <br />
                account brief.
              </h2>
              <article>
                <b>Why this account, now</b>
                <p>
                  Technical engagement is present; broader buying-role
                  participation needs attention.
                </p>
              </article>
              <article>
                <b>Suggested seller action</b>
                <p>
                  Review the account brief and coordinate the next conversation
                  with the account team.
                </p>
              </article>
              <footer>
                Includes role context, approved guide and campaign reference.
              </footer>
            </div>
          ) : activeTab === "Executive thought leadership" ? (
            <div className="event-preview">
              <h2>Executive point of view.</h2>
              <article>
                <b>Perspective</b>
                <p>
                  Frame enterprise adoption as a leadership decision, using
                  approved evidence and the account’s stated priorities.
                </p>
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
              <h2>
                Account-relevant
                <br />
                social campaign.
              </h2>
              <article>
                <b>Social story</b>
                <p>
                  Adapt the approved enterprise adoption perspective into a
                  role-relevant social sequence.
                </p>
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
