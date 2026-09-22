import DecisionHelper from "./decision-helper";
import ChannelHandoff from "./channel-handoff";
import { useState } from "react";
import type { AgentState } from "../lib/agent-workspace";
import {
  applyReview,
  processState,
  processUpdate,
  processReady,
  type ProcessState,
} from "../lib/process-state";
import { contentSourceOptions } from "../lib/content-source-library";
import { selectedContentSource } from "../lib/content-source-library";
import { contentVariants } from "../lib/content-variants";
export default function ProcessActions({
  session,
  id,
  index,
  onChange,
  onCampaignChange,
}: {
  session: AgentState;
  id: string;
  index: number;
  onChange: (p: ProcessState) => void;
  onCampaignChange?: (patch: Partial<AgentState>) => void;
}) {
  const p = processState(session, id, index);
  const approvalVariants = contentVariants(session).filter(
    (variant) => variant.accountId === "ACCT-01",
  );
  const approvalChannels = session.channel.split(" + ").filter(Boolean);
  const selectedTheme = selectedContentSource(session);
  const [feedback, setFeedback] = useState("");
  const update = (patch: Partial<ProcessState>, event?: string) =>
    onChange(processUpdate(p, patch, event));
  const complete = (event: string) => update({ status: "Complete" }, event);
  const field = (label: string, key: "note" | "owner") => (
    <label>
      {label}
      <input
        value={p[key]}
        onChange={(e) =>
          update({
            [key]: e.target.value,
            status: p.status === "Complete" ? "Not started" : p.status,
          })
        }
      />
    </label>
  );
  const select = (label: string, options: string[]) => (
    <label>
      {label}
      <select
        value={p.choice}
        onChange={(e) =>
          update({ choice: e.target.value, status: "Not started" })
        }
      >
        <option value="">Choose a direction…</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
  return (
    <section
      className={`process-actions ${id === "s3" && index === 2 ? "approval-panel" : ""}`}
    >
      <header>
        <span className="agent-kicker">
          {id === "s3" && index === 2
            ? `Approval · v${p.version}`
            : `Your decision · ${p.status}`}
        </span>
        <h3>
          {id === "s3" && index === 2
            ? p.status === "Not started"
              ? "Ready for your review"
              : p.status === "Approved"
                ? "Approved for handoff"
                : p.status === "Changes requested"
                  ? "A revision is needed"
                  : "Review in progress"
            : "Put this work into motion"}
        </h3>
      </header>
      <DecisionHelper id={id} index={index} />
      {id === "s2" && index === 0 && (
        <>
          <p>
            Inspect the evidence before letting the agent use it. The prototype
            includes one unresolved identity record; decide whether it can enter
            the working audience.
          </p>
          <div className="process-evidence">
            <span>
              Product usage → account cohort <b>Matched in this scenario</b>
            </span>
            <span>
              Website + event signals → journey record{" "}
              <b>Matched in this scenario</b>
            </span>
            <span>
              One unmatched account → account identity{" "}
              <b>Unresolved · exclude from activation</b>
            </span>
          </div>
          {select("How should the agent handle the unmatched account?", [
            "Exclude it and retain the resolved account evidence",
            "Hold the entire audience for identity review",
          ])}
          <button
            disabled={!p.choice}
            onClick={() =>
              p.choice.startsWith("Exclude")
                ? complete(
                    "Unmatched account excluded; resolved evidence accepted for planning",
                  )
                : update(
                    { status: "Blocked" },
                    "Audience held for identity review",
                  )
            }
          >
            Apply identity decision
          </button>
          {p.status === "Blocked" && (
            <p role="status">
              The audience is held. Change the decision to continue with
              resolved evidence only.
            </p>
          )}
        </>
      )}
      {id === "s2" && index === 1 && (
        <>
          <div className="recommended-decision">
            <span className="agent-kicker">Agent recommendation</span>
            <b>Coordinate three buying-role paths, led by sponsor value.</b>
            <p>
              The technical team is already active and procurement is
              researching governance. The sponsor path is the missing
              progression point, so it leads the coordinated plan without
              sidelining the other two roles.
            </p>
          </div>
          <p className="decision-prompt">
            Confirm the recommended role-specific plan or choose a different
            leading emphasis. Every option keeps the technical, sponsor and
            procurement paths in the same coordinated campaign.
          </p>
          <div className="decision-options" role="radiogroup">
            {[
              [
                "Coordinate three buying-role paths, led by sponsor value",
                "Recommended · use the sponsor gap as the lead priority while retaining technical and procurement work.",
              ],
              [
                "Coordinate three buying-role paths, led by governance",
                "Use if procurement is the immediate blocker; technical and sponsor work stays coordinated.",
              ],
              [
                "Coordinate three buying-role paths, led by technical proof",
                "Use if the technical team needs more proof before expansion; sponsor and procurement paths remain in scope.",
              ],
            ].map(([choice, detail]) => (
              <button
                key={choice}
                aria-checked={p.choice === choice}
                className={p.choice === choice ? "selected" : ""}
                onClick={() =>
                  update(
                    { choice, status: "Not started" },
                    `Direction selected: ${choice}`,
                  )
                }
                role="radio"
              >
                <b>{choice}</b>
                <span>{detail}</span>
              </button>
            ))}
          </div>
          <label className="optional-decision-note">
            Add context for the brief <span>Optional</span>
            <input
              value={p.note}
              onChange={(e) =>
                update({
                  note: e.target.value,
                  status: p.status === "Complete" ? "Not started" : p.status,
                })
              }
              placeholder="For example: keep the pilot scope fixed for Finance approval."
            />
          </label>
          <button
            disabled={!p.choice}
            onClick={() =>
              complete(
                `Audience direction: ${p.choice}.${p.note.trim() ? ` Additional context: ${p.note.trim()}` : ""}`,
              )
            }
          >
            Carry this direction into the brief
          </button>
        </>
      )}
      {id === "s2" && index === 2 && (
        <>
          <p>
            Review the action brief above. The agent will carry it into content
            planning. Use “Adjust brief” if the objective needs to change.
          </p>
          <button
            onClick={() =>
              complete(
                "Action brief accepted; content planning requested through the configured workflow.",
              )
            }
          >
            Use this brief
          </button>
        </>
      )}
      {id === "s3" && index === 0 && (
        <>
          {!session.campaign ? (
            <div className="recommended-decision">
              <span className="agent-kicker">Plan choice required</span>
              <b>Confirm the audience, channel mix and source status first.</b>
              <p>
                Return to the plan choices above. The content foundation and
                work packages stay unavailable until Morgan confirms the
                recommended defaults or adjusts them.
              </p>
            </div>
          ) : (
            <>
              <p>
                Choose the content theme that should lead this fictional work.
                It changes the point of view and message emphasis; the agent
                then adapts that theme for each audience and channel.
              </p>
              <div className="content-source-options" role="radiogroup">
                {contentSourceOptions.map((source) => (
                  <button
                    key={source.id}
                    aria-checked={p.choice === source.id}
                    className={p.choice === source.id ? "selected" : ""}
                    onClick={() =>
                      update(
                        { choice: source.id, status: "Not started" },
                        `Source set selected: ${source.title}`,
                      )
                    }
                    role="radio"
                  >
                    <span>{source.badge}</span>
                    <b>{source.title}</b>
                    <small>{source.assets}</small>
                    <p>{source.rationale}</p>
                  </button>
                ))}
              </div>
              <p className="source-selection-note">
                These are purpose-built practice themes for this prototype, not
                customer case studies or production source material. Morgan
                selects the narrative direction; approved source material,
                factual claim limits and required reviews would be attached in
                production.
              </p>
              <button
                disabled={
                  !p.choice || session.source === "Source material missing"
                }
                onClick={() =>
                  complete(
                    `Source set confirmed: ${contentSourceOptions.find((source) => source.id === p.choice)?.title || "selected source"}. Approved claims and source references are required in each package.`,
                  )
                }
              >
                Use this source set
              </button>
              {p.status === "Blocked" && (
                <p>
                  The content bank is unavailable for this scenario. Request an
                  approved source set from the asset owner before adaptation can
                  continue.
                </p>
              )}
            </>
          )}
        </>
      )}
      {id === "s3" && index === 1 && (
        <>
          <p>
            Open and edit the audience packages above. Add or remove
            requirements, then accept this version for review. Editing the
            artifact later invalidates this acceptance.
          </p>
          {field("Anything you’d like to change? (optional)", "note")}
          <button
            onClick={() =>
              complete(
                `Audience work packages accepted. ${p.note.trim() ? "Morgan’s changes: " + p.note : "No changes requested."}`,
              )
            }
          >
            Looks good—send for review
          </button>
        </>
      )}
      {id === "s3" && index === 2 && (
        <>
          <p>
            {p.status === "Not started"
              ? "Confirm the audience and channel mix. Then I’ll send this version to Brand and Legal."
              : "Review decisions stay attached to this version of the packet."}
          </p>
          <section className="approval-summary" aria-label="What Morgan is approving">
            <header>
              <span className="agent-kicker">What you are approving</span>
              <b>Review the actual direction before you send this packet.</b>
            </header>
            <article>
              <span>Audience promise</span>
              {approvalVariants.map((variant) => (
                <div key={variant.id}>
                  <b>{variant.segment}</b>
                  <p>
                    {variant.headline} <em>→ {variant.cta}</em>
                  </p>
                </div>
              ))}
            </article>
            <article>
              <span>Channel mix</span>
              <b>{approvalChannels.join(" · ")}</b>
              <p>
                The same role-specific promise will be adapted for each
                selected channel. Change the mix in the plan choices or the
                handoff before approving.
              </p>
            </article>
            <article>
              <span>Content theme</span>
              <b>{selectedTheme.title}</b>
              <p>{selectedTheme.rationale}</p>
            </article>
          </section>
          <div className="process-reviewers">
            {["Morgan", "Brand / asset owner", "Legal / privacy"].map(
              (role) => (
                <article
                  key={role}
                  data-status={p.reviewers[role] || "waiting"}
                >
                  <i aria-hidden="true">
                    {p.reviewers[role] === "Approved"
                      ? "✓"
                      : role === "Morgan"
                        ? "M"
                        : role.startsWith("Brand")
                          ? "B"
                          : "L"}
                  </i>
                  <div>
                    <b>
                      {role === "Morgan"
                        ? "You"
                        : role.startsWith("Brand")
                          ? "Brand"
                          : "Legal & privacy"}
                    </b>
                    <small>
                      {role === "Morgan"
                        ? "Audience & channel direction"
                        : role.startsWith("Brand")
                          ? "Claims & consistency"
                          : "Claims & permissions"}
                    </small>
                  </div>
                  <span>
                    {p.reviewers[role] ||
                      (role === "Morgan" ? "Your turn" : "Up next")}
                  </span>
                </article>
              ),
            )}
          </div>
          {p.status === "Not started" && (
            <button
              className="agent-primary"
              onClick={() =>
                update(
                  {
                    status: "In review",
                    reviewers: {
                      Morgan: "Approved",
                      "Brand / asset owner": "Pending",
                      "Legal / privacy": "Pending",
                    },
                  },
                  `Morgan approved direction for packet v${p.version}; review requests sent to the simulated Brand and Legal inboxes`,
                )
              }
            >
              Approve & send for review
            </button>
          )}
          {p.status === "In review" && (
            <div className="review-inbox">
              <b>↗ Packet v{p.version} sent for review</b>
              <p>
                Morgan’s direction approval is recorded. Waiting for the asset
                owner and Legal / Privacy to return their decisions.
              </p>
            </div>
          )}
          {p.status === "Approved" && (
            <div className="review-inbox">
              <b>↙ Approvals received · packet v{p.version}</b>
              <p>
                Brand / asset owner: approved claims and consistency.
                <br />
                Legal / privacy: approved the submitted packet.
                <br />
                Morgan: approved the audience direction and channel mix.
              </p>
            </div>
          )}
          {p.status === "In review" && (
            <div className="review-simulator">
              <span className="agent-kicker">
                Workshop control · simulate an external reviewer
              </span>
              <p>
                Morgan stays in this workspace. These controls stand in for a
                response from Workfront; they do not represent Morgan approving
                on someone else’s behalf.
              </p>
              {["Brand / asset owner", "Legal / privacy"]
                .filter((role) => p.reviewers[role] === "Pending")
                .map((role) => (
                  <div key={role}>
                    <b>{role}</b>
                    <button
                      onClick={() => onChange(applyReview(p, role, "Approved"))}
                    >
                      Simulate approval
                    </button>
                    <button
                      onClick={() => {
                        setFeedback(
                          "Please attach the approved source reference for the governance claims before release.",
                        );
                        onChange(applyReview(p, role, "Changes requested"));
                      }}
                    >
                      Simulate change request
                    </button>
                  </div>
                ))}
            </div>
          )}
          {p.status === "Changes requested" && (
            <div className="process-change">
              <h4>Changes requested · release is blocked</h4>
              <p>
                {feedback ||
                  "Please attach the approved source reference for the governance claims before release."}
              </p>
              {field("Source reference or correction to add", "note")}
              <button
                disabled={!p.note.trim()}
                onClick={() =>
                  update(
                    { status: "Revision prepared" },
                    `Packet revision: source evidence added — ${p.note}`,
                  )
                }
              >
                Prepare revised packet
              </button>
            </div>
          )}
          {p.status === "Revision prepared" && (
            <div>
              <h4>Packet v{p.version + 1} · revision preview</h4>
              <p>
                <b>Added source reference:</b> {p.note}
              </p>
              <button
                onClick={() =>
                  update(
                    {
                      version: p.version + 1,
                      status: "In review",
                      reviewers: {
                        Morgan: "Approved",
                        "Brand / asset owner": "Pending",
                        "Legal / privacy": "Pending",
                      },
                    },
                    `Morgan accepted revision; packet v${p.version + 1} resubmitted to both reviewers`,
                  )
                }
              >
                Accept revision and resubmit
              </button>
            </div>
          )}
          {p.status === "Approved" && (
            <p role="status">
              All three approvals are recorded for packet v{p.version}. The
              handoff can now be staged. Audience eligibility still gates
              release.
            </p>
          )}
        </>
      )}
      {id === "s3" && index === 3 && (
        <ChannelHandoff
          session={session}
          onChange={onChange}
          onCampaignChange={onCampaignChange}
        />
      )}
      {id === "s5" && index === 0 && (
        <>
          <p>
            Run a simulated check against the staged campaign. The result
            returns to this same screen.
          </p>
          <button
            onClick={() =>
              update(
                { status: "Checked" },
                "Simulated check: destinations match; campaign setup matches; one consent conflict found",
              )
            }
          >
            Run link, setup and consent checks
          </button>
          {["Checked", "Complete"].includes(p.status) && (
            <>
              <div className="process-evidence">
                <span>
                  Approved destinations <b>Pass</b>
                </span>
                <span>
                  Audience / asset setup <b>Pass</b>
                </span>
                <span>
                  Consent consistency{" "}
                  <b>One separate conflict · needs a decision</b>
                </span>
              </div>
              <button
                onClick={() =>
                  complete(
                    "Routine checks accepted; consent conflict isolated for resolution",
                  )
                }
              >
                Open the consent exception
              </button>
            </>
          )}
        </>
      )}
      {id === "s5" && index === 1 && (
        <>
          <p>
            CONSENT-001 is separate from the two identity records already
            excluded upstream. This contact is matched to the account and has
            engagement, but permission records conflict. Decide the scope of
            this new hold and the scope of the pause.
          </p>
          {select("Containment decision", [
            "Hold the affected contact only",
            "Pause the whole campaign pending reconciliation",
          ])}
          <p>
            The agent will send the consent issue to the configured data team.
          </p>
          <button
            disabled={!p.choice}
            onClick={() =>
              complete(
                `CONSENT-001: ${p.choice}. Reconciliation routed to the configured data team. No consent inferred from engagement.`,
              )
            }
          >
            Apply hold and notify the data team
          </button>
        </>
      )}
      {id === "s5" && index === 2 && (
        <>
          <p>
            The agent must receive confirmation before reporting completion.
            Test either response from the proposed action connector.
          </p>
          <div className="review-simulator">
            <span className="agent-kicker">Simulated connector response</span>
            <button
              onClick={() =>
                update(
                  { status: "Failed" },
                  "Connector did not acknowledge the hold; action remains pending",
                )
              }
            >
              Simulate a failed acknowledgement
            </button>
            <button
              onClick={() =>
                complete(
                  "Simulated connector acknowledged the hold and data-team task; audit record attached. Campaign release remains gated.",
                )
              }
            >
              {p.status === "Failed"
                ? "Retry and receive acknowledgement"
                : "Receive acknowledgement"}
            </button>
          </div>
          {p.status === "Failed" && (
            <p role="status">
              Action pending—not complete. Retry or leave it unresolved; it
              cannot be recorded as a successful handoff.
            </p>
          )}
        </>
      )}
      {p.events.length > 0 && (
        <div className="process-receipt">
          <b>Campaign activity record</b>
          <ol>
            {p.events.map((event, i) => (
              <li key={i}>{event}</li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
