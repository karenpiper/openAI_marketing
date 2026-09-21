import WorkshopGlyph from "./workshop-glyph";
const activities = [
  ["Listen & prioritize", "Seven moments. The room decides what matters."],
  ["Map the reality", "A recent example. A shared picture of today."],
  [
    "Shape the next workflow",
    "Keep, change, question. Build the answer together.",
  ],
  [
    "Make the next move",
    "Read it back. Assign an owner. Choose the first test.",
  ],
];
export default function WorkshopChapter({ stage }: { stage: number }) {
  return (
    <div className={`workshop-chapter chapter-${stage}`}>
      <span className="chapter-index">0{stage + 1}</span>
      <div>
        <span className="eyebrow">On the workshop table</span>
        <strong>{activities[stage][0]}</strong>
        <p>{activities[stage][1]}</p>
      </div>
      <WorkshopGlyph kind={stage} />
    </div>
  );
}
