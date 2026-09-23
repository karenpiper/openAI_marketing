import type { Session } from "./workshop";
import { workflows } from "./architecture-workflow";
export const diagramReferences = {
  orchestration: "H",
  interface: "A",
  agentInterfaces: "K",
  review: "B",
  assets: "C",
  data: "D",
  curation: "L",
  cdp: "J",
  touchpoints: "E",
  activation: "I",
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
  focusReferences?: string[],
) {
  const steps = caseId ? workflows[caseId] : undefined;
  const shown = steps
    ? stepIndex >= 0
      ? [steps[stepIndex]].filter(Boolean)
      : steps
    : [];
  const active = new Set(
    focusReferences ??
      shown.flatMap((step) => step.boxes.map((k) => diagramReferences[k])),
  );
  // Frontier is the shared orchestration layer for every proposed workflow; agents use it, rather than being it.
  if (shown.length && !focusReferences?.length) active.add("H");
  const focused = active.size > 0;
  const groupFor = (x: number, y: number) =>
    x === 103 && y === 65
      ? "A"
      : x === 103 && y === 145
        ? "K"
      : x === 103 && y === 270
        ? "B"
    : x === 220
      ? "C"
      : x === 337 && y === 270
        ? "I"
          : y === 430
            ? "J"
            : y === 555
              ? "D"
              : y === 502
                ? "L"
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
    id = groupFor(x, y),
  ) =>
    tint(
      `<g class="architecture-component" data-architecture-component="${id}" tabindex="0" role="button"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#ffffff" stroke="#365343" stroke-width="1.5"/>${text(x + 16, y + Math.max(28, (h - lines.length * (size + 5)) / 2 + size), lines, size)}</g>`,
      id,
    );
  const tag = (x: number, y: number, id: string) =>
    `<rect x="${x}" y="${y}" width="${counts[id] ? 85 : 30}" height="27" rx="6" fill="${counts[id] ? "#85581f" : "#365343"}"/>${text(x + 7, y + 19, [`${id}${counts[id] ? ` · ${counts[id]} notes` : ""}`], 13).replaceAll("#203d33", "#ffffff")}`;
  const arrow = (
    x: number,
    y: number,
    xx: number,
    yy: number,
    groups: string[] = [],
    route: [number, number][] = [],
  ) => {
    const points: [number, number][] = [[x, y], ...route, [xx, yy]];
    const path = points
      .map(([px, py], i) => `${i ? "L" : "M"} ${px} ${py}`)
      .join(" ");
    const [px, py] = points[points.length - 2];
    const a = Math.atan2(yy - py, xx - px);
    const color =
      focused && groups.length && groups.every((g) => active.has(g))
        ? "#a85c00"
        : "#365343";
    const opacity = focused && !groups.every((g) => active.has(g)) ? 0.2 : 1;
    return `<g opacity="${opacity}"><path d="${path}" fill="none" stroke="#365343" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M ${xx} ${yy} L ${xx - 11 * Math.cos(a - 0.45)} ${yy - 11 * Math.sin(a - 0.45)} L ${xx - 11 * Math.cos(a + 0.45)} ${yy - 11 * Math.sin(a + 0.45)} Z" fill="#365343"/></g>`.replaceAll(
      "#365343",
      color,
    );
  };
  const anchors: Record<string, [number, number]> = {
    A: [450, 180],
    K: [433, 177],
    B: [180, 270],
    C: [363, 270],
    D: [568, 680],
    L: [433, 519],
    I: [433, 337],
    J: [433, 460],
    E: [490, 132],
    F: [910, 420],
    G: [725, 980],
    H: [735, 306],
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
 ${box(103, 65, 330, 65, ["Codex Interfaces", "+ ChatGPT work"])}${box(103, 145, 330, 65, ["Agent Interface(s)"])}
 ${text(490, 27, ["B2B Marketing Touchpoints"], 23)}
 ${box(490, 40, 340, 55, ["Events"])}${box(490, 105, 340, 55, ["CRM (Marketing)"])}${box(490, 170, 340, 55, ["Marketing Website"])}
 ${text(103, 257, ["Adobe marketing tools"], 17)}<rect rx="16" x="85" y="265" width="365" height="155" fill="#edf2e8" stroke="#c0cdbf"/>
 ${box(103, 270, 100, 135, ["Adobe", "Workfront"], 16)}
 ${box(220, 270, 100, 135, ["Adobe", "CSC"], 17)}
 ${box(337, 270, 96, 135, ["Adobe", "Marketo /", "AJO"], 14, "I")}
 ${box(103, 430, 330, 60, ["Adobe CDP (w/ ABM)"], 19, "J")}
 ${box(103, 502, 330, 33, ["Curatorial layer · marketer-safe data"], 14, "L")}
 ${box(590, 265, 290, 100, ["Orchestration layer", "OpenAI Frontier", "Adobe CX Coworker"], 16, "H")}
 ${arrow(590, 288, 433, 177, ["H", "A"], [[470, 288], [470, 177]])}${arrow(735, 265, 830, 132, ["H", "E"], [[880, 265], [880, 132]])}${arrow(590, 315, 433, 337, ["H", "I"], [[500, 315]])}${arrow(590, 325, 433, 460, ["H", "J"], [[470, 325], [470, 460]])}${arrow(590, 345, 320, 405, ["H", "C"], [[470, 345], [470, 420], [320, 420]])}${arrow(880, 315, 907, 315, ["H", "F"])}
 <path d="M 470 40 L 470 410" stroke="#c0cdbf" stroke-dasharray="7 7"/>
 ${text(18, 523, ["OAI Infrastructure"], 17)}<rect rx="16" x="18" y="535" width="582" height="300" fill="#edf2e8" stroke="#c0cdbf"/>
 ${box(113, 555, 455, 255, ["OpenAI", "Data Lake"], 32)}
 ${tint(`<g class="architecture-component" data-architecture-component="A" tabindex="0" role="button"><rect rx="10" x="30" y="585" width="60" height="205" fill="#ffffff" stroke="#365343" stroke-width="1.5"/><text transform="translate(65,770) rotate(-90)" font-family="Roboto" font-size="20" fill="#203d33">ChatGPT Usage</text></g>`, "A")}
 <g class="architecture-component" data-architecture-component="F" tabindex="0" role="button" opacity="${focused && !active.has("F") ? 0.28 : 1}"><rect rx="10" x="910" y="40" width="60" height="795" fill="${focused && active.has("F") ? "#fff0c2" : "#fffdf7"}" stroke="#365343" stroke-width="${focused && active.has("F") ? 4 : 2}"/><text transform="translate(947,675) rotate(-90)" font-family="Roboto" font-size="22" fill="#203d33">Adobe Customer Journey Analytics</text></g>
 ${arrow(830, 68, 907, 68, ["E", "F"])}${arrow(830, 133, 907, 133, ["E", "F"])}${arrow(830, 198, 907, 198, ["E", "F"])}${arrow(905, 705, 571, 705, ["F", "D"])}
 ${text(615, 684, ["Adobe data to OpenAI Data Lake"], 16)}${arrow(90, 705, 110, 705)}${arrow(335, 552, 335, 535, ["D", "L"])}${arrow(335, 502, 335, 490, ["L", "J"])}
 ${arrow(197, 812, 197, 891, ["D", "G"])}${arrow(487, 812, 487, 891, ["D", "G"])}
 ${box(75, 895, 245, 150, ["Salesforce"], 30)}
 ${text(340, 881, ["OAI Infrastructure"], 17)}<rect rx="16" x="340" y="895" width="385" height="180" fill="#edf2e8" stroke="#c0cdbf"/>
 ${box(363, 921, 140, 132, ["CRM", "(Sales)"])}${box(520, 921, 170, 132, ["Offer Tools"])}
 ${text(341, 1103, ["Currently built tools (demoed by Matt/Pat)"], 16)}
 ${text(28, 300, ["Marketer experience"], 20).replace('x="28" y="300"', 'transform="translate(28,300) rotate(-90)"')}${arrow(55, 490, 55, 42)}
 ${text(28, 1090, ["Sales experience"], 20).replace('x="28" y="1090"', 'transform="translate(28,1090) rotate(-90)"')}${arrow(36, 885, 36, 1123)}
 ${focused ? proposed : ""}
 </svg>`;
}
