import { useState } from "react";
import type { AgentState } from "../lib/agent-workspace";
import {
  processReady,
  processState,
  processUpdate,
  type ProcessState,
} from "../lib/process-state";
export default function ChannelHandoff({
  session,
  onChange,
}: {
  session: AgentState;
  onChange: (p: ProcessState) => void;
}) {
  const [tab, setTab] = useState("Email");
  const p = processState(session, "s3", 3);
  const second = session.channel.includes("event")
    ? "Event follow-up"
    : session.channel.includes("sales")
      ? "Sales handoff"
      : "Website";
  const channels = ["Email", second];
  const approved = processReady(session, "s3", 2);
  const staged = p.reviewers[tab] === "Staged";
  function stage() {
    const reviewers = { ...p.reviewers, [tab]: "Staged" };
    onChange(
      processUpdate(
        p,
        {
          reviewers,
          status: channels.every((c) => reviewers[c] === "Staged")
            ? "Complete"
            : "Staging",
        },
        `${tab} work order accepted by the simulated connector. Routed to the configured marketing operations team. Not sent.`,
      ),
    );
  }
  return (
    <section className="handoff-console">
      <header>
        <span className="agent-kicker">
          Activation workspace · simulated destination
        </span>
        <h3>Ready for the next step.</h3>
        <p>
          Review the preview, then prepare each channel for release. The agent
          routes the work to the configured team. Nothing is sent yet.
        </p>
      </header>
      <nav aria-label="Channel work orders">
        {channels.map((c) => (
          <button key={c} aria-pressed={tab === c} onClick={() => setTab(c)}>
            {c} {p.reviewers[c] === "Staged" ? "✓" : ""}
          </button>
        ))}
      </nav>
      <div className="handoff-canvas">
        <div className="handoff-preview">
          <span className="agent-kicker">{tab} · illustrative preview</span>
          {tab === "Email" ? (
            <div className="email-preview">
              <div>
                <b>To</b> Eligible contacts · role-specific versions
              </div>
              <div>
                <b>Subject</b> Your next step toward enterprise adoption
              </div>
              <article>
                <small>ENTERPRISE ADOPTION</small>
                <h2>
                  From evaluation
                  <br />
                  to a practical plan.
                </h2>
                <p>
                  An approved-guide placement, adapted to the recipient’s buying
                  role.
                </p>
                <div className="source-preview">
                  ▤ Enterprise adoption guide
                  <br />
                  <small>v3 · source reference attached</small>
                </div>
                <span className="preview-cta">Review the adoption guide →</span>
              </article>
              <footer>
                Preview only · not generated or sent by a live service
              </footer>
            </div>
          ) : tab === "Event follow-up" ? (
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
          ) : tab === "Website" ? (
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
          ) : (
            <div className="event-preview">
              <h2>
                Account-team
                <br />
                handoff card.
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
          )}
        </div>
        <div className="handoff-settings">
          <div>
            <b>Audience</b>
            <p>{session.audience} · 12 illustrative target accounts</p>
          </div>
          <div>
            <b>Exclusions</b>
            <p>
              Unresolved consent, suppressed contacts and unmatched identities.
            </p>
          </div>
          <div>
            <b>Asset binding</b>
            <p>Adoption guide v3 + accepted audience work package.</p>
          </div>
          <div>
            <b>Destination</b>
            <p>
              {tab === "Email"
                ? "CRM (Marketing) / proposed Marketo connector"
                : tab === "Event follow-up"
                  ? "Events + marketing CRM"
                  : tab === "Website"
                    ? "Marketing Website"
                    : "Sales CRM / account team"}
            </p>
          </div>
          <div>
            <b>Tracking attached</b>
            <p>
              Campaign: enterprise-adoption
              <br />
              Audience: buying-role / lifecycle segment
              <br />
              Channel: {tab}
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
              : `Prepare ${tab.toLowerCase()} for release`}
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
                WO-{tab === "Email" ? "EMAIL" : "SECOND"}-001
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
        {channels.length} channels prepared · then we’ll check eligibility before release.
      </div>
    </section>
  );
}
