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
export function architectureDiagram(
  s: Session,
  caseId?: string,
  stepIndex = -1,
) {
  const steps = caseId ? workflows[caseId] : undefined;
  const shown = steps
    ? stepIndex >= 0
      ? [steps[stepIndex]].filter(Boolean)
      : steps
    : [];
  const active = new Set(
    shown.flatMap((step) => step.boxes.map((k) => diagramReferences[k])),
  );
  const focused = active.size > 0;
  const groupFor = (x: number, y: number) =>
    x === 103 && y < 230
      ? "A"
      : x === 103 && y === 270
        ? "B"
        : x === 293
          ? "C"
          : y === 430 || y === 555
            ? "D"
            : x === 490
              ? "E"
              : y >= 895
                ? "G"
                : "";
  const tint = (svg: string, id: string) =>
    !focused
      ? svg
      : `<g opacity="${active.has(id) ? 1 : 0.28}">${active.has(id) ? svg.replaceAll('fill="#ffffff"', 'fill="#fff0c2"').replaceAll('stroke-width="1.5"', 'stroke-width="4"') : svg}</g>`;

  const counts: Record<string, number> = {};
  for (const r of s.workflowReviews) {
    if (caseId && r.useCase !== caseId) continue;
    if (r.choice === "Not reviewed" && !r.change.trim()) continue;
    for (const k of workflows[r.useCase]?.[r.step]?.boxes || [])
      counts[diagramReferences[k]] = (counts[diagramReferences[k]] || 0) + 1;
  }
  const text = (x: number, y: number, lines: string[], size = 19) =>
    lines
      .map(
        (line, i) =>
          `<text x="${x}" y="${y + i * (size + 5)}" font-family="Roboto" font-size="${size}" font-weight="500" fill="#203d33">${line}</text>`,
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
    tint(
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#ffffff" stroke="#365343" stroke-width="1.5"/>${text(x + 16, y + Math.max(28, (h - lines.length * (size + 5)) / 2 + size), lines, size)}`,
      groupFor(x, y),
    );
  const tag = (x: number, y: number, id: string) =>
    `<rect x="${x}" y="${y}" width="${counts[id] ? 85 : 30}" height="27" rx="6" fill="${counts[id] ? "#85581f" : "#365343"}"/>${text(x + 7, y + 19, [`${id}${counts[id] ? ` · ${counts[id]} notes` : ""}`], 13).replaceAll("#203d33", "#ffffff")}`;
  const arrow = (
    x: number,
    y: number,
    xx: number,
    yy: number,
    groups: string[] = [],
  ) => {
    const a = Math.atan2(yy - y, xx - x);
    const color =
      focused && groups.length && groups.every((g) => active.has(g))
        ? "#a85c00"
        : "#365343";
    const opacity = focused && !groups.every((g) => active.has(g)) ? 0.2 : 1;
    return `<g opacity="${opacity}"><path d="M ${x} ${y} L ${xx} ${yy}" fill="none" stroke="#365343" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M ${xx} ${yy} L ${xx - 11 * Math.cos(a - 0.45)} ${yy - 11 * Math.sin(a - 0.45)} L ${xx - 11 * Math.cos(a + 0.45)} ${yy - 11 * Math.sin(a + 0.45)} Z" fill="#365343"/></g>`.replaceAll(
      "#365343",
      color,
    );
  };
  const anchors: Record<string, [number, number]> = {
    A: [450, 180],
    B: [180, 270],
    C: [363, 270],
    D: [433, 460],
    E: [490, 132],
    F: [910, 420],
    G: [725, 980],
  };
  const edges = new Set<string>();
  for (const step of shown) {
    const refs = step.boxes.map((k) => diagramReferences[k]);
    for (let i = 1; i < refs.length; i++)
      edges.add([refs[0], refs[i]].join("-"));
  }
  const proposed = [...edges]
    .filter(
      (edge) => !["E-F", "F-E", "D-F", "F-D", "D-G", "G-D"].includes(edge),
    )
    .map((edge) => {
      const [a, b] = edge.split("-");
      // Route proposed connections through the gaps between component groups.
      const ports = (id: string): [number, number][] => {
        const [x, y] = anchors[id];
        if (id === "B" || id === "C")
          return [
            [x, y],
            [x, 245],
            [470, 245],
          ];
        if (id === "F" || id === "G")
          return [
            [x, y],
            [865, y],
            [865, 260],
            [470, 260],
          ];
        return [
          [x, y],
          [470, y],
        ];
      };
      const points = [...ports(a), ...ports(b).reverse()];
      const path = points
        .map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`)
        .join(" ");
      const [xx, yy] = anchors[b];
      return `<path d="${path}" stroke="#a85c00" stroke-width="3" stroke-dasharray="9 6" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="${xx}" cy="${yy}" r="4" fill="#a85c00"/>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1160" viewBox="0 0 1000 1160">
 ${text(85, 27, ["OAI Infrastructure"], 17)}
 <rect rx="16" x="85" y="40" width="365" height="190" fill="#edf2e8" stroke="#c0cdbf"/>
 ${box(103, 65, 330, 65, ["Codex Interfaces", "+ ChatGPT work"])}${box(103, 145, 330, 65, ["Agent Interface(s)"])}${tag(345, 40, "A")}
 ${text(490, 27, ["B2B Marketing Touchpoints"], 23)}
 ${box(490, 40, 340, 55, ["Events"])}${box(490, 105, 340, 55, ["CRM (Marketing)"])}${box(490, 170, 340, 55, ["Marketing Website"])}${tag(850, 10, "E")}
 ${box(103, 270, 155, 135, ["Adobe", "Workfront"])}${tag(103, 240, "B")}
 ${box(293, 270, 140, 135, ["Adobe CSC", "(Assets, etc)"], 17)}${tag(293, 240, "C")}
 ${box(103, 430, 330, 60, ["Adobe CDP (w/ ABM)"])}${tag(330, 430, "D")}
 <path d="M 470 40 L 470 410" stroke="#c0cdbf" stroke-dasharray="7 7"/>
 ${text(18, 523, ["OAI Infrastructure"], 17)}<rect rx="16" x="18" y="535" width="582" height="300" fill="#edf2e8" stroke="#c0cdbf"/>
 ${box(113, 555, 455, 255, ["OpenAI", "Data Lake"], 32)}
 <rect rx="10" x="30" y="585" width="60" height="205" fill="#ffffff" stroke="#365343" stroke-width="1.5"/>
 <text transform="translate(65,770) rotate(-90)" font-family="Roboto" font-size="20" fill="#203d33">ChatGPT Usage</text>
 <rect rx="10" x="910" y="40" width="60" height="795" fill="${focused && active.has("F") ? "#fff0c2" : "#fffdf7"}" stroke="#365343" stroke-width="${focused && active.has("F") ? 4 : 2}" opacity="${focused && !active.has("F") ? 0.28 : 1}"/>
 <text transform="translate(947,675) rotate(-90)" font-family="Roboto" font-size="22" fill="#203d33">Adobe Customer Journey Analytics</text>${tag(885, 845, "F")}
 ${arrow(830, 68, 907, 68, ["E", "F"])}${arrow(830, 133, 907, 133, ["E", "F"])}${arrow(830, 198, 907, 198, ["E", "F"])}${arrow(905, 705, 571, 705, ["F", "D"])}
 ${text(615, 684, ["Adobe data to OpenAI Data Lake"], 16)}${arrow(90, 705, 110, 705)}${arrow(335, 552, 335, 493, ["D"])}
 ${arrow(197, 812, 197, 891, ["D", "G"])}${arrow(487, 812, 487, 891, ["D", "G"])}
 ${box(75, 895, 245, 150, ["Salesforce"], 30)}
 ${text(340, 881, ["OAI Infrastructure"], 17)}<rect rx="16" x="340" y="895" width="385" height="180" fill="#edf2e8" stroke="#c0cdbf"/>
 ${box(363, 921, 140, 132, ["CRM", "(Sales)"])}${box(520, 921, 170, 132, ["Offer Tools"])}${tag(735, 895, "G")}
 ${text(341, 1103, ["Currently built tools (demoed by Matt/Pat)"], 16)}
 ${arrow(55, 490, 55, 42)}${arrow(36, 885, 36, 1123)}
 ${focused ? proposed : ""}
 </svg>`;
}
