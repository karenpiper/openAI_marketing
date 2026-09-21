const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
require.extensions[".ts"] = (module, path) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(path, "utf8"), {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
      },
    }).outputText,
    path,
  );
const m = require("../lib/agent-workspace.ts");
test("new workshop does not invent room agreement or existing capabilities", () => {
  const s = m.createAgentState();
  for (const c of m.chapters) {
    assert.equal(s.findings[c.id].priority, "To discuss");
    assert.deepEqual(s.findings[c.id].capabilities, {});
  }
  assert.notEqual(m.AGENT_KEY, require("../lib/workshop.ts").SESSION_KEY);
});
test("scenario distinguishes missing source, audience and event routing", () => {
  const s = m.createAgentState();
  assert.match(m.planRows(s)[2].detail, /non-attendee/);
  s.source = "Source material missing";
  s.audience = "Lifecycle stages";
  assert.match(m.planRows(s)[1].value, /Pause/);
  assert.match(m.planRows(s)[0].value, /Evaluating/);
});
test("room findings roundtrip and propagate into architecture and readout", () => {
  const s = m.createAgentState();
  s.findings.s3.note = "Assets live in our internal library";
  s.findings.s3.priority = "Priority";
  s.findings.s3.capabilities["Approved material"] = "Available now";
  s.findings.s3.decision = "Confirm rights owner";
  s.findings.s3.owner = "Marketing lead";
  s.findings.s2.priority = "Not needed";
  const restored = m.restoreAgentState(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(restored.findings, s.findings);
  const arch = m.architectureSession(restored);
  assert.ok(!arch.selected.includes("s2"));
  assert.match(
    arch.architectureAdditions.find((a) => a.useCase === "s3").note,
    /Confirm rights owner/,
  );
  assert.match(m.agentReadout(restored), /Assets live in our internal library/);
  restored.architecture = arch;
  assert.equal(
    m
      .architectureSession(restored)
      .architectureAdditions.filter((a) => a.id.startsWith("agent-")).length,
    3,
  );
});
test("malformed backups cannot inject incompatible form values", () => {
  assert.throws(() => m.restoreAgentState({}));
  const s = m.createAgentState();
  s.findings.s3.capabilities["Approved material"] = "invented";
  assert.throws(() => m.restoreAgentState(s));
});

test('guided conversation exposes requirements and boundaries without claiming live execution', () => {
 const c=m.chapters[1];
 assert.match(m.guidedReply(c,'What do you need?'),/Approved material/);
 assert.match(m.guidedReply(c,'What stays with Morgan?'),/Morgan reviews/);
 assert.equal(m.guidedReply(c,'What should we prove?'),c.proof);
 assert.match(m.guidedReply(c,'Send a campaign right now'),/not connected/);
});
