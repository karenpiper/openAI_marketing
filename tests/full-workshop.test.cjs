const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const compile = (module, path) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(path, "utf8"), {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText,
    path,
  );
require.extensions[".ts"] = compile;
require.extensions[".tsx"] = compile;
const w = require("../lib/workshop.ts");
const g = require("../lib/generation.ts");
const { useCases } = require("../lib/workshop-data.ts");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

test("a working set is explicit, veto aware, and loses confirmation after a selected answer changes", () => {
  const s = w.createSession();
  assert.equal(w.activeCases(s).length, 0);
  assert.equal(w.selectionConfirmed(s), false);
  s.selected = ["s2", "s3"];
  s.selectionBy = "Room consensus";
  s.selectionSignature = w.selectionStamp(s);
  assert.ok(w.selectionConfirmed(s));
  s.assessments.s3.proofText = "A revised proof";
  assert.equal(w.selectionConfirmed(s), false);
  s.selectionSignature = w.selectionStamp(s);
  assert.ok(w.selectionConfirmed(s));
  s.assessments.s3.veto = true;
  assert.deepEqual(
    w.activeCases(s).map((u) => u.id),
    ["s2"],
  );
  assert.equal(w.selectionConfirmed(s), false);
});
test("complete workshop backup preserves cross-stage records, long notes and before/after drafts", () => {
  const s = w.createSession();
  s.selected = ["s3"];
  s.selectionBy = "Karen";
  s.assessments.s3.note = "n".repeat(30000);
  s.selectionSignature = w.selectionStamp(s);
  s.capabilities = [
    {
      id: "c",
      useCase: "s3",
      name: "Content",
      system: "Library",
      fit: "Extend",
      owner: "Pat",
      evidence: "Demo",
      gap: "Search",
      status: "Confirmed",
    },
  ];
  s.boundaries = [
    {
      id: "b",
      useCase: "s3",
      layer: "content",
      system: "Library",
      owner: "Adobe",
      implementer: "C&T",
      truth: "Approved library",
      state: "Version history",
      control: "Human review",
      status: "Proposed",
    },
  ];
  s.handoffs = [
    {
      id: "h",
      useCase: "s3",
      from: "content",
      to: "activation",
      payload: "Approved asset",
      trigger: "Approval",
      owner: "Team",
      control: "Permission check",
      status: "Disputed",
    },
  ];
  s.actions = [
    {
      id: "a",
      useCase: "s3",
      task: "Test search",
      owner: "Karen",
      when: "Next week",
      blockedBy: "Source access",
      sponsorship: "Approve access",
      status: "Proposed",
    },
  ];
  s.lab.drafts = [
    {
      ...w.practiceDraft(s.lab, s.lab.audiences[0]),
      id: "draft",
      createdAt: "2026-09-21T00:00:00Z",
      seconds: 1,
      previous: { subject: "Old", body: "Old body", headline: "Old headline" },
    },
  ];
  const restored = w.parseSession(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(restored, s);
  assert.ok(w.selectionConfirmed(restored));
  assert.ok(w.draftCurrent(restored.lab, restored.lab.drafts[0]));
  const md = w.readout(restored);
  for (const text of [
    "Karen",
    "Test search",
    "Source access",
    "Approve access",
    "Human review",
    "Approved asset",
    "Old",
  ]) {
    if (text !== "Old") assert.ok(md.includes(text), text);
  }
});
test("invalid imports are rejected and malformed values are normalized without rendering objects", () => {
  for (const invalid of [null, {}, { schema: 2 }, { schema: 1 }])
    assert.throws(() => w.parseSession(invalid));
  const s = w.createSession();
  const raw = {
    ...s,
    stage: 100,
    scene: 1.5,
    focus: "invented",
    selected: ["s3", "s3", "bad"],
    capabilities: [
      { id: "c", name: { evil: 1 }, fit: "Bogus", status: "Agreed" },
    ],
    lab: { ...s.lab, audiences: [null, { id: "a", name: 42 }] },
    timer: { remaining: Infinity, runningSince: "now" },
  };
  const r = w.parseSession(raw);
  assert.equal(r.stage, 0);
  assert.equal(r.scene, 0);
  assert.deepEqual(r.selected, ["s3"]);
  assert.equal(r.capabilities[0].name, "");
  assert.equal(r.capabilities[0].status, "Unknown");
  assert.equal(r.lab.audiences[0].name, "");
  assert.equal(r.timer.runningSince, null);
});
test("draft freshness follows source, constraints and individual audience changes", () => {
  const l = w.practiceLab();
  const d = {
    ...w.practiceDraft(l, l.audiences[0]),
    id: "d",
    createdAt: "2026-09-21T00:00:00Z",
    seconds: 0,
    review: "Usable",
  };
  assert.ok(w.draftCurrent(l, d));
  l.audiences[1].need = "Different second audience";
  assert.ok(w.draftCurrent(l, d));
  l.audiences[0].need = "Changed first audience";
  assert.equal(w.draftCurrent(l, d), false);
  const fresh = w.practiceDraft(l, l.audiences[0]);
  l.fixed += " New exclusion";
  assert.equal(w.draftCurrent(l, fresh), false);
});
test("practice content is visibly a template and carries source and fixed wording", () => {
  const l = w.practiceLab();
  const d = w.practiceDraft(l, l.audiences[0]);
  assert.equal(d.mode, "Practice");
  assert.equal(d.review, "Pending");
  assert.ok(d.body.includes(l.source));
  assert.ok(d.body.includes(l.fixed));
  assert.ok(d.body.includes(l.audiences[0].cta));
  assert.match(d.rationale, /Template assembly/);
});
test("generation validates source approval, size, audience completeness and exact response coverage", () => {
  const l = w.practiceLab();
  assert.equal(g.validateInput(l).audiences.length, 3);
  assert.throws(() => g.validateInput({ ...l, source: "" }));
  assert.throws(() => g.validateInput({ ...l, source: "x".repeat(20001) }));
  assert.throws(() =>
    g.validateInput({ ...l, sourceStatus: "Approved for exercise" }),
  );
  assert.throws(() =>
    g.validateInput({ ...l, audiences: [{ ...l.audiences[0], cta: "" }] }),
  );
  assert.throws(() =>
    g.validateInput({ ...l, audiences: [l.audiences[0], l.audiences[0]] }),
  );
  const variants = l.audiences.map((a) => ({
    audienceId: a.id,
    subject: "Subject",
    body: "Body",
    headline: "Headline",
    rationale: "Rationale",
  }));
  assert.equal(g.validateVariants({ variants }, l.audiences).length, 3);
  assert.throws(() =>
    g.validateVariants({ variants: variants.slice(0, 1) }, l.audiences),
  );
  assert.throws(() =>
    g.validateVariants(
      { variants: [variants[0], variants[0], variants[2]] },
      l.audiences,
    ),
  );
});
test("every stage and room scene renders with empty and populated state; intro describes today", () => {
  const s = w.createSession();
  const Priority = require("../components/priority-workshop.tsx").default;
  const Room = require("../components/room-view.tsx").default;
  const Mapping = require("../components/workshop-mapping.tsx");
  const Lab = require("../components/content-lab.tsx").default;
  const Readout = require("../components/workshop-readout.tsx").default;
  const noop = () => {};
  const html = renderToStaticMarkup(
    React.createElement(Priority, {
      state: s.assessments,
      setState: noop,
      step: 0,
      setStep: noop,
      selection: null,
    }),
  );
  assert.match(html, /Tuesday today/);
  assert.ok(!html.includes("as it could look"));
  for (let step = 0; step < 10; step++) {
    renderToStaticMarkup(
      React.createElement(Priority, {
        state: s.assessments,
        setState: noop,
        step,
        setStep: noop,
        selection: null,
      }),
    );
    renderToStaticMarkup(
      React.createElement(Room, { session: { ...s, scene: step } }),
    );
  }
  for (const Comp of [
    Mapping.CurrentState,
    Mapping.Architecture,
    Lab,
    Readout,
  ]) {
    renderToStaticMarkup(
      React.createElement(Comp, { session: s, setSession: noop }),
    );
    s.selected = ["s3"];
    renderToStaticMarkup(
      React.createElement(Comp, { session: s, setSession: noop }),
    );
  }
  for (let stage = 1; stage < 4; stage++)
    for (const architectureTab of ["map", "lab"])
      renderToStaticMarkup(
        React.createElement(Room, {
          session: { ...s, stage, architectureTab },
        }),
      );
  const draft = {
    ...w.practiceDraft(s.lab, s.lab.audiences[0]),
    id: "d",
    createdAt: new Date().toISOString(),
    seconds: 1,
  };
  s.lab.drafts = [draft];
  const labHtml = renderToStaticMarkup(
    React.createElement(Lab, { session: s, setSession: noop }),
  );
  assert.match(labHtml, /Practice template/);
  assert.match(labHtml, /human review|human reviewer/i);
});
test("generation endpoint rejects unconfigured, unauthorized and cross-origin calls; validates mocked API output", async () => {
  const route = require("../app/api/generate/route.ts");
  const saved = {
    key: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL,
    code: process.env.WORKSHOP_ACCESS_CODE,
    fetch: global.fetch,
  };
  try {
    delete process.env.OPENAI_API_KEY;
    assert.equal(
      (
        await route.POST(
          new Request("http://localhost/api/generate", { method: "POST" }),
        )
      ).status,
      503,
    );
    process.env.OPENAI_API_KEY = "test-only";
    process.env.OPENAI_MODEL = "test-model";
    process.env.WORKSHOP_ACCESS_CODE = "test-code";
    const req = (headers = {}, body = w.practiceLab()) =>
      new Request("http://localhost/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(body),
      });
    assert.equal((await route.POST(req())).status, 401);
    assert.equal(
      (
        await route.POST(
          req({
            origin: "https://elsewhere.example",
            "x-workshop-code": "test-code",
          }),
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await route.POST(
          req({ "x-workshop-code": "test-code" }, { source: "" }),
        )
      ).status,
      400,
    );
    let payload;
    global.fetch = async (url, init) => {
      assert.equal(url, "https://api.openai.com/v1/responses");
      payload = JSON.parse(init.body);
      return Response.json({
        status: "completed",
        output: [
          {
            type: "message",
            content: [
              {
                type: "output_text",
                text: JSON.stringify({
                  variants: w
                    .practiceLab()
                    .audiences.map((a) => ({
                      audienceId: a.id,
                      subject: "Subject",
                      body: "Body",
                      headline: "Headline",
                      rationale: "Rationale",
                    })),
                }),
              },
            ],
          },
        ],
      });
    };
    const response = await route.POST(req({ "x-workshop-code": "test-code" }));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).variants.length, 3);
    assert.equal(payload.store, false);
    assert.equal(payload.text.format.strict, true);
    assert.ok(!payload.input.includes("selectionSignature"));
    global.fetch = async () =>
      Response.json({ status: "completed", output: [] });
    assert.equal(
      (await route.POST(req({ "x-workshop-code": "test-code" }))).status,
      502,
    );
  } finally {
    for (const [env, key] of [
      ["OPENAI_API_KEY", "key"],
      ["OPENAI_MODEL", "model"],
      ["WORKSHOP_ACCESS_CODE", "code"],
    ]) {
      if (saved[key] === undefined) delete process.env[env];
      else process.env[env] = saved[key];
    }
    global.fetch = saved.fetch;
  }
});
