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
export default function ProcessActions({
  session,
  id,
  index,
  onChange,
}: {
  session: AgentState;
  id: string;
  index: number;
  onChange: (p: ProcessState) => void;
}) {
  const p = processState(session, id, index);
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
    <section className="process-actions">
      <header>
        <span className="agent-kicker">Your decision · {p.status}</span>
        <h3>
          {id === "s3" && index === 2
            ? "Review and resolve the actual packet"
            : "Put this work into motion"}
        </h3>
      </header>
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
              One unmatched contact → account identity{" "}
              <b>Unresolved · exclude from activation</b>
            </span>
          </div>
          {select("How should the agent handle the unmatched contact?", [
            "Exclude it and retain the resolved account evidence",
            "Hold the entire audience for identity review",
          ])}
          <button
            disabled={!p.choice}
            onClick={() =>
              p.choice.startsWith("Exclude")
                ? complete(
                    "Unmatched contact excluded; resolved evidence accepted for planning",
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
          <p>
            Choose which gap should drive the recommendation. This direction is
            carried into the campaign record.
          </p>
          {select("Where should the campaign focus?", [
            "Bring business sponsors into evaluation",
            "Resolve procurement and governance questions",
            "Help technical evaluators move into a pilot",
          ])}
          {field("What makes this the right next move?", "note")}
          <button
            disabled={!p.choice || !p.note.trim()}
            onClick={() =>
              complete(`Audience direction: ${p.choice}. Rationale: ${p.note}`)
            }
          >
            Use this direction
          </button>
        </>
      )}
      {id === "s2" && index === 2 && (
        <>
          <p>
            Review the action brief above and assign accountability for the next
            handoff. Use “Adjust brief” if the objective needs to change.
          </p>
          {field("Campaign owner (name or role)", "owner")}
          <button
            disabled={!p.owner.trim()}
            onClick={() =>
              complete(
                `Action brief accepted; campaign owner: ${p.owner}. Content planning requested.`,
              )
            }
          >
            Accept brief and assign owner
          </button>
        </>
      )}
      {id === "s3" && index === 0 && (
        <>
          <p>
            Confirm the source and limits you want the agent to use. Selecting a
            source does not approve the campaign for release.
          </p>
          <div className="process-evidence">
            <span>
              Enterprise adoption guide <b>v3 · illustrative approved source</b>
            </span>
            <span>
              Allowed use <b>Adapt emphasis; preserve factual claims</b>
            </span>
            <span>
              Excluded <b>Unsupported ROI and security assertions</b>
            </span>
          </div>
          {select("Source instruction", [
            "Use v3 within its approved claims",
            "Request a different approved source",
          ])}
          <button
            disabled={!p.choice || session.source === "Source material missing"}
            onClick={() =>
              p.choice.startsWith("Use")
                ? complete(
                    "Adoption guide v3 selected; approved claims and source references required in each package",
                  )
                : update(
                    { status: "Blocked" },
                    "Replacement source requested; adaptation paused",
                  )
            }
          >
            Confirm source instruction
          </button>
          {p.status === "Blocked" && (
            <p>
              Source replacement is pending. Select the available approved
              source to continue this scenario.
            </p>
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
          {field("Direction for the production / review team", "note")}
          <button
            disabled={!p.note.trim()}
            onClick={() =>
              complete(
                `Audience work packages accepted with instruction: ${p.note}`,
              )
            }
          >
            Accept these packages for review
          </button>
        </>
      )}
      {id === "s3" && index === 2 && (
        <>
          <p>
            Packet v{p.version} · Morgan approves the audience promise and
            channel mix here. Reviewers receive the same packet through the
            proposed Workfront connection.
          </p>
          <div className="process-reviewers">
            {["Morgan", "Brand / asset owner", "Legal / privacy"].map(
              (role) => (
                <article key={role}>
                  <b>{role}</b>
                  <span>{p.reviewers[role] || "Not submitted"}</span>
                </article>
              ),
            )}
          </div>
          {p.status === "Not started" && (
            <button
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
              Approve direction and route packet
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
                          "Please specify the release owner and the evidence they must check before activation.",
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
                  "Please specify the release owner and the evidence they must check before activation."}
              </p>
              {field("Release owner to add to this packet", "owner")}
              {field("Required evidence / revision to the packet", "note")}
              <button
                disabled={!p.owner.trim() || !p.note.trim()}
                onClick={() =>
                  update(
                    { status: "Revision prepared" },
                    `Packet revision: release owner ${p.owner}; required evidence: ${p.note}`,
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
                <b>Added owner:</b> {p.owner}
              </p>
              <p>
                <b>Added release evidence:</b> {p.note}
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
        <ChannelHandoff session={session} onChange={onChange} />
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
                  <b>One conflicting record · needs a decision</b>
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
            CONSENT-001: engagement is present, but permission records conflict.
            Decide the scope of the hold and who must reconcile it.
          </p>
          {select("Containment decision", [
            "Hold the affected contact only",
            "Pause the whole campaign pending reconciliation",
          ])}
          {field("Data / consent owner", "owner")}
          <button
            disabled={!p.choice || !p.owner.trim()}
            onClick={() =>
              complete(
                `CONSENT-001: ${p.choice}. Reconciliation assigned to ${p.owner}. No consent inferred from engagement.`,
              )
            }
          >
            Create the hold and owner task
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
                  "Simulated connector acknowledged the hold and owner task; audit record attached. Campaign release remains gated.",
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
