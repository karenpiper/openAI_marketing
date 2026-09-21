const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
require.extensions[".ts"] = (module, path) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(path, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    path,
  );
const { useCases, heard, decisions, axes } = require("../lib/workshop-data.ts");
const { defaults, restore, composite, rank } = require("../lib/assessment.ts");
const html = fs.readFileSync("reference/claude-workshop.html", "utf8");
const extract = (name) =>
  JSON.parse(
    JSON.stringify(
      vm.runInNewContext(
        "(" +
          html.match(
            new RegExp("var " + name + " = (\\[[\\s\\S]*?\\n  \\]);"),
          )[1] +
          ")",
        {},
        { timeout: 1000 },
      ),
    ),
  );
test("all original scene fields, feedback, decisions and rubric remain verbatim", () => {
  const original = extract("scenes").filter((s) => !s.kind);
  assert.equal(useCases.length, 7);
  original.forEach((s, i) =>
    Object.keys(s).forEach((k) =>
      assert.equal(useCases[i][k], s[k], `${s.id}.${k}`),
    ),
  );
  assert.deepEqual(heard, extract("HEARD"));
  assert.deepEqual(decisions, extract("BIG_DECISIONS"));
  assert.deepEqual(axes, extract("AXES"));
});
test("geometric mean, exact endpoints and independent move-now status", () => {
  const a = defaults().s1;
  assert.equal(composite(a), 3);
  for (const n of [1, 5])
    assert.equal(
      composite({ ...a, frequency: n, severity: n, evidence: n, leverage: n }),
      n,
    );
  const mixed = { ...a, frequency: 5, severity: 5, evidence: 1, leverage: 5 };
  assert.equal(composite(mixed), Math.pow(125, 0.25));
  assert.equal(
    composite({ ...mixed, noRegret: "no" }),
    composite({ ...mixed, noRegret: "yes" }),
  );
});
test("veto excludes entirely, can be undone, and ties follow day order", () => {
  const state = defaults();
  assert.deepEqual(
    rank(state).map((s) => s.id),
    useCases.map((s) => s.id),
  );
  state.s1.veto = true;
  assert.ok(!rank(state).some((s) => s.id === "s1"));
  state.s1.veto = false;
  assert.equal(rank(state)[0].id, "s1");
  Object.values(state).forEach((a) => (a.veto = true));
  assert.equal(rank(state).length, 0);
});
test("saved inputs round trip; malformed and old scores cannot corrupt ratings", () => {
  const state = defaults();
  state.s2.note = "Room correction";
  state.s2.frequency = 5;
  state.s2.veto = true;
  state.s2.discussed = true;
  assert.deepEqual(restore(JSON.parse(JSON.stringify(state))), state);
  assert.deepEqual(restore(null), defaults());
  const bad = restore({
    s1: {
      frequency: 9,
      severity: 1.5,
      evidence: "5",
      leverage: null,
      noRegret: "bad",
      veto: "yes",
      note: 23,
    },
  });
  assert.deepEqual(bad, defaults());
  assert.deepEqual(
    restore({ "next-action": { outcome: 5, productivity: 5, proof: 5 } }),
    defaults(),
  );
});
