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

test("guided conversation exposes requirements and boundaries without claiming live execution", () => {
  const c = m.chapters[1];
  assert.match(m.guidedReply(c, "What do you need?"), /Approved material/);
  assert.match(m.guidedReply(c, "What stays with Morgan?"), /Morgan reviews/);
  assert.equal(m.guidedReply(c, "What should we prove?"), c.proof);
  assert.match(m.guidedReply(c, "Send a campaign right now"), /not connected/);
});

test("one day carries decisions forward and stops approval when source is missing", () => {
  let s = m.createAgentState();
  assert.equal(s.day.moment, 0);
  s = m.advanceDay(s, 0);
  assert.equal(s.day.moment, 2);
  assert.match(s.day.history[0].text, /12-account/);
  s.source = "Source material missing";
  assert.strictEqual(m.advanceDay(s, 1), s);
  s.source = "Approved source available";
  s.channel = "Email + sales follow-up";
  s = m.advanceDay(s, 1);
  assert.equal(s.day.moment, 3);
  assert.match(s.day.history[1].text, /Email \+ sales follow-up/);
  s = m.advanceDay(s, 2);
  assert.equal(s.day.moment, 4);
  assert.equal(s.day.history.length, 3);
  assert.deepEqual(
    m.restoreAgentState(JSON.parse(JSON.stringify(s))).day,
    s.day,
  );
  s = m.advanceDay(s, 0);
  assert.equal(s.day.history.length, 1);
});
test("earlier backups start at the morning briefing without losing findings", () => {
  const s = m.createAgentState();
  delete s.day;
  assert.equal(m.restoreAgentState(s).day.moment, 0);
});

test('agenda outcomes and Colin asks survive restore and reach the readout',()=>{
 const s=m.createAgentState();s.northstar='Grow enterprise adoption';s.findings.s3.businessOutcome='More relevant campaigns per marketer';s.architecture.closing.sequence='Connect approved assets first';s.architecture.closing.colin='Sponsor the pilot';
 const restored=m.restoreAgentState(JSON.parse(JSON.stringify(s)));
 assert.equal(restored.findings.s3.businessOutcome,s.findings.s3.businessOutcome);
 for(const phrase of [s.northstar,s.findings.s3.businessOutcome,s.architecture.closing.sequence,s.architecture.closing.colin])assert.ok(m.agentReadout(restored).includes(phrase));
});

test('work packages carry audience and channel context and invalidate when conditions change',()=>{
 const work=require('../lib/workflow-work.ts');const s=m.createAgentState();
 assert.equal(work.workStages(s,'s3').length,4);
 assert.equal(work.workStages(s,'s3')[1].rows.length,3);
 s.work={s3:{signature:work.workSignature(s,'s3'),step:2}};
 assert.equal(work.currentWorkStep(s,'s3'),2);
 assert.equal(work.currentWorkStep(m.restoreAgentState(JSON.parse(JSON.stringify(s))),'s3'),2);
 s.audience='One audience';assert.equal(work.currentWorkStep(s,'s3'),0);assert.equal(work.workStages(s,'s3')[1].rows.length,1);
 s.source='Source material missing';assert.match(work.workStages(s,'s3')[0].summary,/on hold/);
 for(const id of ['s2','s3','s5'])for(const step of work.workStages(s,id))for(const key of ['input','output','connection','enables','control'])assert.ok(step[key].length>20);
});
