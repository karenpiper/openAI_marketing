import type { Session } from "./workshop";
import { workflows } from "./architecture-workflow";
export const diagramReferences = {
  interface: "A",
  review: "B",
  assets: "C",
  data: "D",
  touchpoints: "E",
  journeys: "F",
  sales: "G",
};
export function diagramRefs(caseId: string, index: number) {
  return workflows[caseId][index].boxes
    .map((k) => diagramReferences[k])
    .join(", ");
}
/** Recreated vector layout and explicit connections from the original workshop proposal. */
export function architectureDiagram(s: Session) {
  const counts: Record<string, number> = {};
  for (const r of s.workflowReviews) {
    if (r.choice === "Not reviewed" && !r.change.trim()) continue;
    for (const k of workflows[r.useCase]?.[r.step]?.boxes || [])
      counts[diagramReferences[k]] = (counts[diagramReferences[k]] || 0) + 1;
  }
  const text = (x: number, y: number, lines: string[], size = 19) =>
    lines
      .map(
        (line, i) =>
          `<text x="${x}" y="${y + i * (size + 5)}" font-family="Roboto" font-size="${size}" fill="#203d33">${line}</text>`,
      )
      .join("");
  const box = (
    x: number,
    y: number,
    w: number,
    h: number,
    lines: string[],
    size = 19,
  ) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#fffdf7" stroke="#365343" stroke-width="2"/>${text(x + 14, y + 30, lines, size)}`;
  const tag = (x: number, y: number, id: string) =>
    `<rect x="${x}" y="${y}" width="${counts[id] ? 85 : 30}" height="27" rx="6" fill="${counts[id] ? "#85581f" : "#365343"}"/>${text(x + 7, y + 19, [`${id}${counts[id] ? ` · ${counts[id]} notes` : ""}`], 13).replaceAll("#203d33", "#ffffff")}`;
  const arrow = (x: number, y: number, xx: number, yy: number) => {
    const a = Math.atan2(yy - y, xx - x);
    return `<path d="M ${x} ${y} L ${xx} ${yy}" fill="none" stroke="#365343" stroke-width="2"/><path d="M ${xx} ${yy} L ${xx - 11 * Math.cos(a - 0.45)} ${yy - 11 * Math.sin(a - 0.45)} L ${xx - 11 * Math.cos(a + 0.45)} ${yy - 11 * Math.sin(a + 0.45)} Z" fill="#365343"/>`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1160" viewBox="0 0 1000 1160">
 ${text(85, 27, ["OAI Infrastructure"], 17)}
 <rect x="85" y="40" width="365" height="190" fill="#e8eddb" stroke="#829c88"/>
 ${box(103, 65, 330, 65, ["Codex Interfaces", "+ ChatGPT work"])}${box(103, 145, 330, 65, ["Agent Interface(s)"])}${tag(345, 40, "A")}
 ${text(490, 27, ["B2B Marketing Touchpoints"], 23)}
 ${box(490, 40, 340, 55, ["Events"])}${box(490, 105, 340, 55, ["CRM (Marketing)"])}${box(490, 170, 340, 55, ["Marketing Website"])}${tag(850, 10, "E")}
 ${box(103, 270, 155, 135, ["Adobe", "Workfront"])}${tag(103, 240, "B")}
 ${box(293, 270, 140, 135, ["Adobe CSC", "(Assets, etc)"], 17)}${tag(293, 240, "C")}
 ${box(103, 430, 330, 60, ["Adobe CDP (w/ ABM)"])}${tag(330, 430, "D")}
 <path d="M 470 40 L 470 410" stroke="#829c88" stroke-dasharray="7 7"/>
 ${text(18, 523, ["OAI Infrastructure"], 17)}<rect x="18" y="535" width="582" height="300" fill="#e8eddb" stroke="#829c88"/>
 ${box(113, 555, 455, 255, ["OpenAI", "Data Lake"], 32)}
 <rect x="30" y="585" width="60" height="205" fill="#fffdf7" stroke="#365343" stroke-width="2"/>
 <text transform="translate(65,770) rotate(-90)" font-family="Roboto" font-size="20" fill="#203d33">ChatGPT Usage</text>
 <rect x="910" y="40" width="60" height="795" fill="#fffdf7" stroke="#365343" stroke-width="2"/>
 <text transform="translate(947,675) rotate(-90)" font-family="Roboto" font-size="22" fill="#203d33">Adobe Customer Journey Analytics</text>${tag(885, 845, "F")}
 ${arrow(830, 68, 907, 68)}${arrow(830, 133, 907, 133)}${arrow(830, 198, 907, 198)}${arrow(905, 705, 571, 705)}
 ${text(615, 684, ["Adobe data to OpenAI Data Lake"], 16)}${arrow(90, 705, 110, 705)}${arrow(335, 552, 335, 493)}
 ${arrow(197, 812, 197, 891)}${arrow(487, 812, 487, 891)}
 ${box(75, 895, 245, 150, ["Salesforce"], 30)}
 ${text(340, 881, ["OAI Infrastructure"], 17)}<rect x="340" y="895" width="385" height="180" fill="#e8eddb" stroke="#829c88"/>
 ${box(363, 921, 140, 132, ["CRM", "(Sales)"])}${box(520, 921, 170, 132, ["Offer Tools"])}${tag(735, 895, "G")}
 ${text(341, 1103, ["Currently built tools (demoed by Matt/Pat)"], 16)}
 ${arrow(55, 490, 55, 42)}${arrow(36, 885, 36, 1123)}
 </svg>`;
}
