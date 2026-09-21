import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import type { Session } from "./workshop";
import { architectureOutput } from "./architecture-output";
export function architectureDocument(s: Session): TDocumentDefinitions {
  const model = architectureOutput(s);
  const content: Content[] = [
    { text: "WORKSHOP OUTPUT / ARCHITECTURE", style: "eyebrow" },
    { text: "The way of working we discussed", style: "title" },
    { text: model.title, style: "subtitle" },
    {
      text: `Working set: ${model.selectionConfirmed ? "confirmed" : "proposed / not confirmed"}`,
      margin: [0, 10, 0, 8],
    },
    {
      text: `Attendees: ${model.attendees || "Not recorded"}`,
      margin: [0, 0, 0, 12],
    },
    {
      text: "Generated from captured workshop answers. Agreed = the room chose Keep or Change and captured systems, owner, handoff and controls. Proposed = not reviewed. Unresolved = open choices or missing details. Needs recheck = source evidence changed.",
      style: "note",
    },
    {
      text: "Arrows show workflow order, not implemented system integrations. Unreviewed steps retain our suggested process; suggested systems remain proposals until reviewed.",
      style: "note",
    },
  ];
  if (!model.cases.length)
    content.push({
      text: "No selected or discussed workflows yet. Capture the conversation in step 3 to generate the architecture.",
      margin: [0, 20, 0, 0],
    });
  for (const c of model.cases) {
    content.push(
      { text: c.label, style: "caseTitle", pageBreak: "before" },
      {
        text: c.selected
          ? "In the working set"
          : "Outside the current working set",
        style: "eyebrow",
      },
      { text: `What to prove: ${c.proof}`, margin: [0, 10, 0, 14] },
    );
    content.push(
      {
        text: "WORKFLOW OVERVIEW / detailed entries follow",
        style: "eyebrow",
        margin: [0, 4, 0, 10],
      },
      {
        table: {
          widths: ["*", "*", "*", "*", "*"],
          body: [
            c.nodes.map((n, i) => ({
              stack: [
                {
                  text: `${i + 1}`,
                  fontSize: 18,
                  bold: true,
                  color: "#527864",
                },
                { text: n.title, bold: true, margin: [0, 6, 0, 6] },
                { text: n.status, fontSize: 8 },
                {
                  text:
                    n.systems.length > 90
                      ? n.systems.slice(0, 90) + "…"
                      : n.systems,
                  fontSize: 8,
                  margin: [0, 8, 0, 0],
                },
              ],
              fillColor: "#eef3ef",
              margin: [5, 8, 5, 8],
            })),
          ],
        },
        layout: "noBorders",
        margin: [0, 0, 0, 18],
      },
    );
    c.nodes.forEach((n, i) => {
      const nodeContent: Content[] = [
        { text: `${i + 1}. ${n.title}`, style: "stepTitle" },
        {
          text: n.status.toUpperCase(),
          style: "status",
          color:
            n.status === "Agreed"
              ? "#23664a"
              : n.status === "Proposed"
                ? "#526875"
                : "#96521f",
        },
        {
          table: {
            widths: [85, "*"],
            body: [
              ["Approach", n.approach],
              [
                n.systemsSuggested && n.status !== "Agreed"
                  ? "Suggested systems"
                  : "Systems / roles",
                n.systems,
              ],
              ["Owner", n.owner],
              ["Handoff", n.handoff],
              ["Controls", n.controls],
              ...(n.missing.length
                ? [["Still needed", n.missing.join(", ")]]
                : []),
              ...(n.next ? [["Next decision / test", n.next]] : []),
            ].map(([label, value]) => [
              { text: label, bold: true, fillColor: "#eef3ef" },
              { text: value },
            ]),
          },
          layout: "lightHorizontalLines",
          margin: [0, 4, 0, 8],
        },
        ...(i < 4
          ? [
              {
                text: "Next workflow step",
                color: "#678172",
                fontSize: 9,
                margin: [0, 0, 0, 10],
              } as Content,
            ]
          : []),
      ];
      content.push({
        stack: nodeContent,
        unbreakable:
          [n.approach, n.systems, n.owner, n.handoff, n.controls, n.next].join(
            "",
          ).length < 1800,
      });
    });
    if (c.boundaries.length || c.handoffs.length)
      content.push({
        text: "Additional architecture captured in the workshop",
        style: "stepTitle",
      });
    for (const b of c.boundaries)
      content.push(
        { text: `${b.layer} / ${b.status}`, bold: true, margin: [0, 8, 0, 3] },
        {
          text: `System: ${b.system || "Not decided"}\nOwner: ${b.owner || "Not assigned"}\nImplementation: ${b.implementer || "Not assigned"}\nSource of truth: ${b.truth || "Not captured"}\nState: ${b.state || "Not captured"}\nControls: ${b.control || "Not captured"}`,
        },
      );
    for (const h of c.handoffs)
      content.push(
        {
          text: `${h.from} → ${h.to} / ${h.status}`,
          bold: true,
          margin: [0, 8, 0, 3],
        },
        {
          text: `Payload: ${h.payload || "Not captured"}\nTrigger: ${h.trigger || "Not captured"}\nOwner: ${h.owner || "Not assigned"}\nControls: ${h.control || "Not captured"}`,
        },
      );
  }
  content.push({
    text: "Shared decisions and open questions",
    style: "caseTitle",
    pageBreak: "before",
  });
  for (const d of model.decisions)
    content.push(
      { text: `${d.title} / ${d.status}`, style: "stepTitle" },
      {
        text: `Scope: ${d.useCase ? model.cases.find((c) => c.id === d.useCase)?.label || d.useCase : "Workshop-wide"}\n${d.answer || "Not answered"}\nOwner: ${d.owner || "Not assigned"}\nNeeded by: ${d.due || "Not captured"}`,
        margin: [0, 0, 0, 12],
      },
    );
  return {
    info: { title: "Workshop architecture", subject: model.title },
    pageSize: "A4",
    pageMargins: [40, 40, 40, 44],
    defaultStyle: {
      font: "Roboto",
      fontSize: 10,
      color: "#233d34",
      lineHeight: 1.2,
    },
    styles: {
      eyebrow: { fontSize: 9, bold: true, color: "#527864" },
      title: { fontSize: 30, bold: true, margin: [0, 14, 0, 14] },
      subtitle: { fontSize: 15 },
      note: { fontSize: 10, color: "#52655c", margin: [0, 8, 0, 8] },
      caseTitle: { fontSize: 23, bold: true, margin: [0, 0, 0, 12] },
      stepTitle: { fontSize: 14, bold: true, margin: [0, 12, 0, 4] },
      status: { fontSize: 9, bold: true },
    },
    content,
    footer: (page, count) => ({
      text: `Workshop record · ${page} / ${count}`,
      alignment: "right",
      fontSize: 8,
      color: "#62776d",
      margin: [40, 12, 40, 0],
    }),
  };
}
export async function architecturePdf(s: Session) {
  const [{ default: pdfMake }, { default: fonts }] = await Promise.all([
    import("pdfmake/build/pdfmake"),
    import("pdfmake/build/vfs_fonts"),
  ]);
  return pdfMake.createPdf(
    architectureDocument(s),
    undefined,
    undefined,
    fonts as unknown as Record<string, string>,
  );
}
