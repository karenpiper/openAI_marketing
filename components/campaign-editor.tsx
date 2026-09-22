import { useState } from "react";
import type { AgentState } from "../lib/agent-workspace";
export function CampaignEditor({
  session,
  onApply,
}: {
  session: AgentState;
  onApply: (value: { objective: string; instruction: string }) => void;
}) {
  const [editing, setEditing] = useState(false),
    [objective, setObjective] = useState(""),
    [instruction, setInstruction] = useState(""),
    [changed, setChanged] = useState("");
  return (
    <section className="campaign-editor">
      <header>
        <div>
          <span className="agent-kicker">Shared campaign brief</span>
          <h3>
            {session.campaign?.objective ||
              "Help Northstar Health move from technical evaluation to an expansion decision"}
          </h3>
        </div>
        <button
          onClick={() => {
            setObjective(
              session.campaign?.objective ||
                "Help Northstar Health move from technical evaluation to an expansion decision",
            );
            setInstruction(session.campaign?.instruction || "");
            setEditing(!editing);
          }}
        >
          {editing ? "Cancel" : "Adjust brief"}
        </button>
      </header>
      {session.campaign?.instruction && (
        <p>
          <b>Your instruction:</b> {session.campaign.instruction}
        </p>
      )}
      {editing && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setChanged(
              `Objective updated to “${objective.trim()}”. New work packages will use this brief.`,
            );
            onApply({
              objective: objective.trim(),
              instruction: instruction.trim(),
            });
            setEditing(false);
          }}
        >
          <label>
            Business objective
            <input
              required
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
            />
          </label>
          <label>
            Additional direction
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="For example: emphasize security review; avoid unapproved ROI claims."
            />
          </label>
          <button className="agent-primary" disabled={!objective.trim()}>
            Update brief and rebuild work
          </button>
        </form>
      )}
      {changed && (
        <p role="status" className="artifact-change">
          {changed}
        </p>
      )}
    </section>
  );
}
