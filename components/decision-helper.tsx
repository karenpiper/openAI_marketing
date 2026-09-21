const helpers: Record<string, [string, string][]> = {
  s2: [
    [
      "A signal is not permission",
      "Use matched evidence for planning, but hold unresolved contacts out of activation.",
    ],
    [
      "Choose the gap, not the biggest number",
      "High technical engagement does not show that a business sponsor is ready. Choose the next decision you need to enable.",
    ],
    [
      "Make the brief falsifiable",
      "A good brief says what response would justify the next move—not just how much content to produce.",
    ],
  ],
  s3: [
    [
      "An approved asset has limits",
      "Approval of the guide does not authorize new ROI, security or privacy claims. Keep those limits in each package.",
    ],
    [
      "Relevance is more than a greeting",
      "Before accepting, check that each role has a different decision need and a useful next action. Edit the package if those are missing.",
    ],
    [
      "Approval belongs to a version",
      "Changing a claim, audience or channel after review invalidates that approval. Resolve feedback and resubmit the actual revision.",
    ],
    [
      "Staged does not mean sent",
      "Approved content is only one gate. Consent, destination setup and exclusions still need to pass.",
    ],
  ],
  s5: [
    [
      "Checks can pass while one contact is unsafe",
      "Separate configuration checks from permission checks. Passing the first does not waive the second.",
    ],
    [
      "Contain the risk at the right scope",
      "Hold only the affected contact when the issue is isolated. Pause the campaign if the conflict may be systemic.",
    ],
    [
      "A request is not a completed action",
      "Do not report a hold as applied until the connector acknowledges it. A failure should remain visible and retryable.",
    ],
  ],
};
export default function DecisionHelper({
  id,
  index,
}: {
  id: string;
  index: number;
}) {
  const h = helpers[id]?.[index];
  return h ? (
    <aside className="decision-helper">
      <b>Before you decide · {h[0]}</b>
      <p>{h[1]}</p>
    </aside>
  ) : null;
}
