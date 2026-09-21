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
  assert.match(labHtml, /Watch the workflow adapt/);
  assert.match(labHtml, /No content is generated/);
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
                  variants: w.practiceLab().audiences.map((a) => ({
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

test("demo starts at step 2 with confirmed choices and complete linked examples, without changing defaults", () => {
  const {
    createDemoSession,
    DEMO_SESSION_KEY,
    DEMO_CHANNEL,
  } = require("../lib/demo-session.ts");
  const real = w.createSession();
  real.assessments.s3.note = "Real room note";
  const before = JSON.stringify(real);
  const demo = createDemoSession();
  assert.equal(demo.stage, 1);
  assert.equal(demo.focus, "s3");
  assert.ok(w.selectionConfirmed(demo));
  assert.deepEqual(
    w.activeCases(demo).map((u) => u.id),
    ["s2", "s3", "s5"],
  );
  assert.notEqual(DEMO_SESSION_KEY, w.SESSION_KEY);
  assert.notEqual(DEMO_CHANNEL, "oai-workshop-room");
  assert.deepEqual(
    new Set(
      demo.capabilities.filter((c) => c.useCase === "s3").map((c) => c.fit),
    ),
    new Set(["Reuse", "Extend", "Missing", "Unknown"]),
  );
  assert.deepEqual(
    new Set(demo.decisions.map((d) => d.status)),
    new Set(["Proposed", "Confirmed", "Disputed", "Unknown"]),
  );
  for (const row of [
    ...demo.capabilities,
    ...demo.boundaries,
    ...demo.handoffs,
    ...demo.actions,
  ])
    assert.ok(useCases.some((c) => c.id === row.useCase));
  assert.ok(demo.actions.some((a) => !a.owner));
  assert.equal(demo.lab.drafts.length, 3);
  for (const d of demo.lab.drafts) {
    assert.ok(w.draftCurrent(demo.lab, d));
    assert.equal(d.mode, "Practice");
    assert.ok(d.previous);
  }
  assert.deepEqual(w.parseSession(JSON.parse(JSON.stringify(demo))), demo);
  demo.capabilities[0].system = "My temporary edit";
  demo.lab.drafts[0].body = "Changed";
  assert.equal(JSON.stringify(real), before);
  assert.notEqual(
    createDemoSession().capabilities[0].system,
    "My temporary edit",
  );
  assert.equal(w.createSession().selected.length, 0);
});

test("populated demo renders steps 2–4 and projector views with fictional readout labeling", () => {
  const { createDemoSession } = require("../lib/demo-session.ts");
  const demo = createDemoSession();
  const noop = () => {};
  const Mapping = require("../components/workshop-mapping.tsx");
  const Lab = require("../components/content-lab.tsx").default;
  const Readout = require("../components/workshop-readout.tsx").default;
  const Room = require("../components/room-view.tsx").default;
  for (const Comp of [Mapping.CurrentState, Mapping.Architecture, Lab, Readout])
    assert.ok(
      renderToStaticMarkup(
        React.createElement(Comp, { session: demo, setSession: noop }),
      ).length > 500,
    );
  for (const stage of [1, 2, 3])
    for (const architectureTab of ["map", "lab"])
      assert.ok(
        renderToStaticMarkup(
          React.createElement(Room, {
            session: { ...demo, stage, architectureTab },
          }),
        ).length > 500,
      );
  const text = w.readout(demo);
  assert.match(text, /DEMO DATA/);
  assert.match(text, /Fictional test result/);
  assert.match(text, /Needs edits/);
  assert.match(text, /Unassigned/);
});

test("guided capture supports all seven cases, preserves legacy notes and multiple tools, and reopens edited agreements", () => {
  const guide = require("../lib/workshop-guide.ts");
  const {
    createDemoSession,
    addDemoGuideExamples,
  } = require("../lib/demo-session.ts");
  let s = createDemoSession();
  const original = s.capabilities.find(
    (c) => c.useCase === "s3" && c.questionId === "source",
  );
  const prompt = guide.currentQuestions.s3[0];
  const count = s.capabilities.length;
  s = guide.editAnswer(s, "s3", prompt, {
    system: "Library — approved source\nReview tool — approval record",
  });
  assert.equal(s.capabilities.length, count);
  assert.equal(guide.findAnswer(s, "s3", prompt).id, original.id);
  assert.equal(guide.findAnswer(s, "s3", prompt).status, "Proposed");
  assert.equal(guide.findAnswer(s, "s3", prompt).evidence, original.evidence);
  assert.deepEqual(w.parseSession(JSON.parse(JSON.stringify(s))), s);
  assert.equal(
    guide.findAnswer(addDemoGuideExamples(s), "s3", prompt).system,
    "Library — approved source\nReview tool — approval record",
  );
  for (const c of useCases) {
    assert.equal(guide.currentQuestions[c.id].length, 4);
    assert.equal(
      new Set(guide.currentQuestions[c.id].map((q) => q.id)).size,
      4,
    );
    for (const q of guide.currentQuestions[c.id])
      assert.ok(guide.findAnswer(s, c.id, q)?.evidence);
  }
  let real = w.createSession();
  const assessments = JSON.stringify(real.assessments);
  real = guide.editAnswer(real, "s4", guide.currentQuestions.s4[0], {
    evidence: "A real answer",
  });
  assert.equal(real.selected.length, 0);
  assert.equal(JSON.stringify(real.assessments), assessments);
  assert.equal(real.capabilities.length, 1);
  const legacy = { ...real };
  delete legacy.guide;
  assert.deepEqual(w.parseSession(legacy).guide, {
    current: 0,
    architecture: 0,
  });
  assert.deepEqual(
    w.parseSession({ ...real, guide: { current: 99, architecture: -1 } }).guide,
    { current: 0, architecture: 0 },
  );
});

test("all guided questions and readbacks render in real, demo and projected sessions", () => {
  const { createDemoSession } = require("../lib/demo-session.ts");
  const {
    CurrentState,
    Architecture,
  } = require("../components/workshop-mapping.tsx");
  const Room = require("../components/room-view.tsx").default;
  const guide = require("../lib/workshop-guide.ts");
  for (const s of [w.createSession(), createDemoSession()])
    for (const c of useCases) {
      s.focus = c.id;
      s.overview = false;
      for (const [stage, Comp, key, max] of [
        [1, CurrentState, "current", 4],
        [2, Architecture, "architecture", 5],
      ]) {
        s.stage = stage;
        for (let step = 0; step <= max; step++) {
          s.guide[key] = step;
          const html = renderToStaticMarkup(
            React.createElement(Comp, { session: s, setSession: () => {} }),
          );
          const room = renderToStaticMarkup(
            React.createElement(Room, { session: s }),
          );
          assert.ok(html.length > 500 && room.length > 500);
          if (stage === 1 && step < 4) {
            assert.ok(
              html.includes(guide.currentQuestions[c.id][step].question),
            );
            assert.ok(
              room.includes(guide.currentQuestions[c.id][step].question),
            );
            assert.ok(html.includes(guide.toolPrompts[c.id][step]));
          }
          assert.ok(!html.includes("Start with a capability"));
          assert.ok(!html.includes("Define the boundary"));
        }
      }
    }
});

test("architecture edits stay case-specific and preserve other handoffs", () => {
  const guide = require("../lib/workshop-guide.ts");
  let s = require("../lib/demo-session.ts").createDemoSession();
  const old = s.handoffs.find((h) => h.id === "demo-h1");
  s = guide.editHandoff(s, "s3", { payload: "Updated payload" });
  assert.deepEqual(
    s.handoffs.find((h) => h.id === "demo-h1"),
    old,
  );
  assert.equal(guide.primaryHandoff(s, "s3").status, "Proposed");
  s = guide.editBoundary(s, "s1", "data", {
    system: "CRM\nWarehouse",
    owner: "Data team",
  });
  assert.ok(
    !s.boundaries.some((b) => b.useCase === "s2" && b.layer === "data"),
  );
  assert.ok(
    s.boundaries.some(
      (b) => b.useCase === "s1" && b.system === "CRM\nWarehouse",
    ),
  );
});

test("live synthesis preserves evidence and tools, requires room judgment and invalidates on source changes", () => {
  const {
    saveInterpretation,
    interpretation,
    capabilityNames,
  } = require("../lib/live-synthesis.ts");
  const guide = require("../lib/workshop-guide.ts");
  let s = w.createSession();
  for (const c of useCases) assert.equal(capabilityNames[c.id].length, 4);
  assert.deepEqual(saveInterpretation(s, "s3", 0, { status: "Confirmed" }), s);
  s = guide.editAnswer(s, "s3", guide.currentQuestions.s3[0], {
    evidence:
      "Assets are in three places. We ask in Slack which version is approved.",
    system:
      "Library A — documents\nLibrary B — images\nSlack — version questions",
  });
  let a = guide.findAnswer(s, "s3", guide.currentQuestions.s3[0]);
  assert.equal(interpretation(a, 0).name, "Find approved content");
  assert.match(interpretation(a, 0).reason, /three places/);
  s = saveInterpretation(s, "s3", 0, { status: "Confirmed" });
  assert.equal(s.capabilities[0].synthesis.status, "Proposed");
  s = saveInterpretation(s, "s3", 0, {
    coverage: "Works with gaps",
    name: "Find the current approved version",
    status: "Confirmed",
  });
  assert.equal(w.synthesisStatus(s.capabilities[0]), "Confirmed");
  assert.match(w.readout(s), /Find the current approved version/);
  assert.deepEqual(w.parseSession(JSON.parse(JSON.stringify(s))), s);
  s = guide.editAnswer(s, "s3", guide.currentQuestions.s3[0], {
    evidence: "Correction: one library, with approval records.",
  });
  a = s.capabilities[0];
  assert.equal(interpretation(a, 0).stale, true);
  assert.equal(w.synthesisStatus(a), "Needs recheck");
  assert.match(w.readout(s), /Needs recheck/);
  assert.equal(interpretation(a, 0).name, "Find the current approved version");
  assert.match(a.system, /Library A/);
  s = saveInterpretation(s, "s3", 0, { status: "Confirmed" });
  assert.equal(w.synthesisStatus(s.capabilities[0]), "Confirmed");
  s = guide.editAnswer(s, "s3", guide.currentQuestions.s3[0], {
    status: "Disputed",
  });
  s = saveInterpretation(s, "s3", 0, { status: "Confirmed" });
  assert.equal(s.capabilities[0].synthesis.status, "Proposed");
});

test("live synthesis renders in capture, projector, architecture and readout without requiring credentials", () => {
  const s = require("../lib/demo-session.ts").createDemoSession();
  const Live = require("../components/live-synthesis.tsx").default;
  const html = renderToStaticMarkup(
    React.createElement(Live, { session: s, setSession: () => {}, index: 0 }),
  );
  assert.match(html, /Find approved content/);
  assert.match(html, /Yes, that describes it/);
  assert.match(html, /Sample approved asset library/);
  const architecture = renderToStaticMarkup(
    React.createElement(Live, {
      session: s,
      setSession: () => {},
      architecture: true,
    }),
  );
  assert.match(architecture, /What should change/);
  assert.match(architecture, /Demo content operations lead/);
  assert.match(architecture, /Check this interpretation in step 2/);
  const bad = {
    ...s,
    capabilities: s.capabilities.map((c) => ({
      ...c,
      synthesis: c.synthesis
        ? { ...c.synthesis, coverage: "BAD", status: "BAD" }
        : undefined,
    })),
  };
  const parsed = w.parseSession(JSON.parse(JSON.stringify(bad)));
  assert.equal(parsed.capabilities[0].synthesis.coverage, "Not established");
  assert.equal(parsed.capabilities[0].synthesis.status, "Unknown");
});

test("proposed workflows cover seven cases, cite real diagram boxes and carry decisions with source freshness", () => {
  const f = require("../lib/architecture-workflow.ts");
  const guide = require("../lib/workshop-guide.ts");
  let s = require("../lib/demo-session.ts").createDemoSession();
  for (const c of useCases) {
    assert.equal(f.workflows[c.id].length, 5);
    assert.equal(guide.toolPrompts[c.id].length, 4);
    for (const step of f.workflows[c.id]) {
      assert.ok(step.boxes.every((b) => f.pdfBoxes[b]));
      assert.ok(step.sources.every((i) => guide.currentQuestions[c.id][i]));
    }
  }
  s = f.reviewWorkflow(s, "s3", 1, {
    choice: "Change",
    change: "Keep our existing library",
    owner: "Content lead",
    next: "Verify approval metadata",
  });
  assert.equal(f.workflowState(s, "s3", 1).stale, false);
  assert.deepEqual(w.parseSession(JSON.parse(JSON.stringify(s))), s);
  assert.match(w.readout(s), /Keep our existing library/);
  s = guide.editAnswer(s, "s3", guide.currentQuestions.s3[0], {
    system: "Corrected library",
  });
  assert.equal(f.workflowState(s, "s3", 1).stale, true);
  assert.match(w.readout(s), /Evidence changed/);
  assert.equal(f.workflowState(s, "s3", 0).stale, false);
  s = f.reviewWorkflow(s, "s3", 1, { choice: "Keep" });
  assert.equal(f.workflowState(s, "s3", 1).stale, false);
  const legacy = { ...s };
  delete legacy.workflowReviews;
  assert.deepEqual(w.parseSession(legacy).workflowReviews, []);
});

test("walkthrough shows current evidence and room decisions without internal PDF references", () => {
  const Walk = require("../components/architecture-walkthrough.tsx").default;
  const s = require("../lib/demo-session.ts").createDemoSession();
  s.guide.architecture = 1;
  for (const room of [true, false]) {
    const html = renderToStaticMarkup(
      React.createElement(Walk, { session: s, setSession: () => {}, room }),
    );
    assert.match(html, /Find the right approved content/);
    assert.ok(!html.includes("supplied PDF"));
    assert.ok(html.includes("Adobe CSC"));
    assert.match(html, /Sample approved asset library/);
    assert.match(html, /Use the existing approved library/);
    if (!room) {
      assert.match(html, /Looks right/);
      assert.match(html, /Open question/);
    }
  }
});

test("step zero opens real and demo sessions with agenda, attendees and entry while preserving progress", () => {
  const Overview = require("../components/workshop-overview.tsx").default;
  const Room = require("../components/room-view.tsx").default;
  for (const s of [
    w.createSession(),
    require("../lib/demo-session.ts").createDemoSession(),
  ]) {
    assert.equal(s.overview, true);
    s.attendees = "Karen — facilitator\nAlex — operations";
    s.stage = 2;
    s.assessments.s3.note = "Preserve this note";
    const restored = w.parseSession(JSON.parse(JSON.stringify(s)));
    assert.equal(restored.stage, 2);
    assert.equal(restored.attendees, s.attendees);
    assert.equal(restored.assessments.s3.note, "Preserve this note");
    const html = renderToStaticMarkup(
      React.createElement(Overview, {
        session: s,
        setSession: () => {},
        onEnter: () => {},
        onResume: () => {},
      }),
    );
    for (const text of [
      "Enter workshop",
      "120 minutes",
      "What we’ve heard",
      "Attendees and roles",
      "Four conversations. Four outputs.",
    ])
      assert.ok(html.includes(text));
    const projection = renderToStaticMarkup(
      React.createElement(Room, { session: s }),
    );
    assert.match(projection, /Workshop briefing/);
    assert.ok(!projection.includes("Enter workshop"));
    assert.match(w.readout(s), /Karen — facilitator/);
  }
  const old = w.createSession();
  delete old.overview;
  delete old.attendees;
  assert.equal(w.parseSession(old).overview, true);
  assert.equal(w.parseSession(old).attendees, "");
});

test("prior context lives only on step zero and Morgan skips the retired scene without shifting saved case IDs", () => {
  const Priority = require("../components/priority-workshop.tsx").default;
  const Overview = require("../components/workshop-overview.tsx").default;
  const Room = require("../components/room-view.tsx").default;
  const s = w.createSession();
  const front = renderToStaticMarkup(
    React.createElement(Overview, { session: s, onEnter: () => {} }),
  );
  assert.match(front, /What we’ve heard/);
  assert.match(front, /Original statements/);
  assert.ok(!front.includes("<details"));
  assert.ok(front.includes("#briefing-4"));
  assert.ok(front.includes("workshop-collage.png"));
  assert.ok(
    fs.existsSync(
      require("node:path").join(
        __dirname,
        "../public/images/workshop-collage.png",
      ),
    ),
  );
  for (let step = 0; step < 10; step++) {
    const html = renderToStaticMarkup(
      React.createElement(Priority, {
        state: s.assessments,
        setState: () => {},
        step,
        setStep: () => {},
        selection: null,
      }),
    );
    assert.ok(!html.includes("What we heard"));
    assert.ok(!html.includes("See what we heard"));
    if (step === 0 || step === 1) {
      assert.match(html, /Start the day/);
      assert.match(html, /1 \/ 9/);
    }
    const room = renderToStaticMarkup(
      React.createElement(Room, {
        session: { ...s, overview: false, scene: step },
      }),
    );
    assert.ok(!room.includes("What we heard"));
  }
});

test("architecture output uses room systems, preserves revisions and flags incomplete or stale agreements", () => {
  const { architectureOutput } = require("../lib/architecture-output.ts");
  const { reviewWorkflow } = require("../lib/architecture-workflow.ts");
  const guide = require("../lib/workshop-guide.ts");
  let s = w.createSession();
  assert.equal(architectureOutput(s).cases.length, 0);
  s.selected = ["s3"];
  let nodes = architectureOutput(s).cases[0].nodes;
  assert.equal(nodes[0].status, "Proposed");
  assert.match(nodes[0].systems, /OpenAI Data Lake/);
  assert.equal(nodes[0].systemsSuggested, true);
  assert.ok(JSON.stringify(nodes).includes("Adobe CSC"));
  s = reviewWorkflow(s, "s3", 0, { choice: "Keep" });
  assert.equal(
    architectureOutput(s).cases[0].nodes[0].status,
    "Direction agreed",
  );
  s = reviewWorkflow(s, "s3", 0, {
    choice: "Change",
    change: "The room’s revised workflow",
    systems: "Our warehouse\nOur CRM",
    owner: "Alex",
    handoff: "Brief to content team",
    controls: "Alex checks permission",
  });
  nodes = architectureOutput(s).cases[0].nodes;
  assert.equal(nodes[0].status, "Change requested");
  assert.equal(nodes[0].annotation, "The room’s revised workflow");
  assert.equal(nodes[0].systems, "Our warehouse\nOur CRM");
  assert.deepEqual(w.parseSession(JSON.parse(JSON.stringify(s))), s);
  s = guide.editAnswer(s, "s3", guide.currentQuestions.s3[1], {
    evidence: "New audience evidence",
  });
  assert.equal(architectureOutput(s).cases[0].nodes[0].status, "Needs recheck");
  s.selected = [];
  assert.equal(architectureOutput(s).cases[0].selected, false);
});

test("generated architecture PDF includes captured systems and open decisions, and produces a real PDF", async () => {
  const {
    architectureDocument,
    architecturePdf,
  } = require("../lib/architecture-pdf.ts");
  const s = require("../lib/demo-session.ts").createDemoSession();
  s.attendees = "Zoë — facilitator";
  const def = architectureDocument(s);
  const text = JSON.stringify(def);
  assert.match(text, /Sample analytics workspace/);
  assert.match(text, /Use the existing approved library/);
  assert.match(text, /AGREED/);
  assert.match(text, /OPEN QUESTION/);
  assert.match(text, /PROPOSED/);
  assert.match(text, /Shared decisions and open questions/);
  assert.ok(text.includes("Adobe CDP"));
  assert.match(text, /Suggested systems/);
  const pdf = await architecturePdf(s);
  const bytes = await new Promise((resolve) => pdf.getBuffer(resolve));
  assert.equal(Buffer.from(bytes).subarray(0, 5).toString(), "%PDF-");
  assert.ok(bytes.length > 10000);
  fs.writeFileSync("/tmp/workshop-architecture-demo.pdf", bytes);
});

test("architecture prefills PDF proposals across all cases without overwriting entered or cleared systems", () => {
  const f = require("../lib/architecture-workflow.ts");
  let s = w.createSession();
  for (const c of useCases)
    for (let i = 0; i < 5; i++) {
      const systems = f.workflowSystems(s, c.id, i);
      assert.ok(systems.value.length > 0);
      assert.equal(systems.suggested, true);
      assert.equal(systems.unreviewed, true);
    }
  assert.equal(s.workflowReviews.length, 0);
  s = f.reviewWorkflow(s, "s3", 1, { owner: "Content owner" });
  assert.match(s.workflowReviews[0].systems, /Adobe CSC/);
  assert.equal(s.workflowReviews[0].choice, "Not reviewed");
  s = f.reviewWorkflow(s, "s3", 1, { systems: "Our existing library" });
  assert.equal(f.workflowSystems(s, "s3", 1).value, "Our existing library");
  assert.equal(f.workflowSystems(s, "s3", 1).suggested, false);
  s = f.reviewWorkflow(s, "s3", 1, { systems: "" });
  assert.equal(f.workflowSystems(s, "s3", 1).value, "");
  assert.equal(
    f.workflowSystems(w.parseSession(JSON.parse(JSON.stringify(s))), "s3", 1)
      .value,
    "",
  );
  const legacy = {
    ...s,
    workflowReviews: [
      { ...s.workflowReviews[0], systems: "Legacy custom tool" },
    ],
  };
  delete legacy.workflowReviews[0].systemsOrigin;
  const edited = f.reviewWorkflow(legacy, "s3", 1, { owner: "New owner" });
  assert.equal(edited.workflowReviews[0].systems, "Legacy custom tool");
  assert.equal(f.workflowSystems(edited, "s3", 1).suggested, false);
});

test("manual and automatic saving use the same session snapshot and isolated storage keys; failures propagate", () => {
  const { persistSession } = require("../lib/persistence.ts");
  const { DEMO_SESSION_KEY } = require("../lib/demo-session.ts");
  const saved = new Map();
  const storage = { setItem: (key, data) => saved.set(key, data) };
  const s = w.createSession();
  s.attendees = "Workshop attendees";
  s.draftDecisionTitle = "A question still being typed";
  const before = JSON.stringify(s);
  persistSession(storage, w.SESSION_KEY, s);
  assert.equal(saved.get(w.SESSION_KEY), before);
  s.assessments.s3.note = "Latest input";
  persistSession(storage, DEMO_SESSION_KEY, s);
  assert.equal(saved.get(w.SESSION_KEY), before);
  assert.equal(
    JSON.parse(saved.get(DEMO_SESSION_KEY)).assessments.s3.note,
    "Latest input",
  );
  assert.equal(
    w.parseSession(JSON.parse(saved.get(DEMO_SESSION_KEY))).draftDecisionTitle,
    "A question still being typed",
  );
  assert.throws(
    () =>
      persistSession(
        {
          setItem: () => {
            throw Error("Quota exceeded");
          },
        },
        w.SESSION_KEY,
        s,
      ),
    /Quota/,
  );
  assert.equal(s.assessments.s3.discussed, false);
});

test("data-entry sections expose save controls while read-only sections do not", () => {
  const Save = require("../components/save-footer.tsx");
  const s = require("../lib/demo-session.ts").createDemoSession();
  const noop = () => {};
  const modules = [
    require("../components/workshop-overview.tsx").default,
    require("../components/workshop-mapping.tsx").CurrentState,
    require("../components/workshop-mapping.tsx").Architecture,
    require("../components/content-lab.tsx").default,
    require("../components/workshop-record.tsx").default,
  ];
  for (const Comp of modules) {
    const html = renderToStaticMarkup(
      React.createElement(
        Save.SaveContext.Provider,
        {
          value: {
            save: () => ({ ok: true, message: "Saved" }),
            revision: s,
            error: "",
          },
        },
        React.createElement(Comp, { session: s, setSession: noop }),
      ),
    );
    assert.match(html, />Save<\/button>/);
    assert.match(html, /Autosave is on/);
  }
  const noProvider = renderToStaticMarkup(React.createElement(Save.default));
  assert.equal(noProvider, "");
  const error = renderToStaticMarkup(
    React.createElement(
      Save.SaveContext.Provider,
      { value: { save: noop, revision: s, error: "Storage unavailable" } },
      React.createElement(Save.default),
    ),
  );
  assert.match(error, /Storage unavailable/);
  assert.ok(!error.includes("Autosave is on"));
});

test("proposal board needs no technical forms and additions survive backup and exports", () => {
  const { reviewWorkflow } = require("../lib/architecture-workflow.ts");
  const { architectureOutput } = require("../lib/architecture-output.ts");
  const { architectureDocument } = require("../lib/architecture-pdf.ts");
  const Walk = require("../components/architecture-walkthrough.tsx").default;
  for (const focus of ["s1", "s2", "s3", "s4", "s5", "s6", "s7"]) {
    let s = { ...w.createSession(), focus, selected: [focus] };
    s = reviewWorkflow(s, focus, 0, { choice: "Keep" });
    assert.equal(
      architectureOutput(s).cases[0].nodes[0].status,
      "Direction agreed",
    );
    let html = renderToStaticMarkup(
      React.createElement(Walk, { session: s, setSession: () => {} }),
    );
    assert.equal((html.match(/<textarea/g) || []).length, 0);
    assert.ok(!html.includes("detailed architecture"));
    s = reviewWorkflow(s, focus, 0, {
      choice: "Change",
      change: "Use our existing event platform",
    });
    s.architectureAdditions = [
      {
        id: "addition",
        useCase: focus,
        note: "Connect event attendance to the audience profile",
        owner: "Sam",
      },
    ];
    s = w.parseSession(JSON.parse(JSON.stringify(s)));
    html = renderToStaticMarkup(
      React.createElement(Walk, { session: s, setSession: () => {} }),
    );
    assert.equal((html.match(/<textarea/g) || []).length, 2);
    assert.match(
      JSON.stringify(architectureDocument(s)),
      /Connect event attendance/,
    );
    assert.match(w.readout(s), /Connect event attendance/);
    assert.equal(
      architectureOutput(s).cases[0].nodes[0].annotation,
      "Use our existing event platform",
    );
  }
});

test("workflow simulation adapts all 32 scenarios and persists without generation", () => {
  const {
    defaultScenario,
    scenarioFlow,
    scenarioOptions,
  } = require("../lib/workflow-simulation.ts");
  const Lab = require("../components/content-lab.tsx").default;
  const { architectureDocument } = require("../lib/architecture-pdf.ts");
  for (const audiences of scenarioOptions.audiences)
    for (const assets of scenarioOptions.assets)
      for (const approval of scenarioOptions.approval)
        for (const channels of scenarioOptions.channels)
          for (const identity of scenarioOptions.identity) {
            const scenario = {
              audiences,
              assets,
              approval,
              channels,
              identity,
              notes: "Route event signals through our existing integration",
            };
            const flow = scenarioFlow(scenario);
            assert.equal(
              flow[1].branches.length,
              audiences === "Three segments" ? 3 : 1,
            );
            assert.equal(
              flow[3].components.length,
              assets === "New content needed" ? 2 : 1,
            );
            assert.equal(
              flow[4].branches.length,
              approval === "Legal review required" ? 2 : 1,
            );
            assert.equal(flow[5].branches.length, channels === "Email" ? 1 : 2);
            assert.equal(
              flow[1].components.length,
              identity === "Individual" ? 1 : 2,
            );
            const s = w.parseSession(
              JSON.parse(JSON.stringify({ ...w.createSession(), scenario })),
            );
            assert.deepEqual(s.scenario, scenario);
            for (const room of [false, true]) {
              const html = renderToStaticMarkup(
                React.createElement(Lab, {
                  session: s,
                  setSession: () => {},
                  room,
                }),
              );
              assert.match(html, /Route event signals/);
              assert.ok(!html.includes("Generate AI drafts"));
              assert.equal(
                (html.match(/<button/g) || []).length,
                room ? 0 : 10,
              );
            }
            assert.match(w.readout(s), /Route event signals/);
            assert.match(
              JSON.stringify(architectureDocument(s)),
              /Route event signals/,
            );
          }
  assert.deepEqual(
    w.parseSession({ ...w.createSession(), scenario: { audiences: "bad" } })
      .scenario,
    defaultScenario,
  );
  assert.ok(
    !fs
      .readFileSync(require.resolve("../components/content-lab.tsx"), "utf8")
      .includes("fetch("),
  );
});

test("outcome readout lands on priorities and architecture without capture forms", () => {
  const Readout = require("../components/workshop-readout.tsx").default;
  const s = require("../lib/demo-session.ts").createDemoSession();
  for (const room of [false, true]) {
    const html = renderToStaticMarkup(
      React.createElement(Readout, { session: s, setSession: () => {}, room }),
    );
    assert.match(html, /Three priority use cases/);
    assert.match(html, /Proposed architecture/);
    assert.equal((html.match(/class="outcome-priority"/g) || []).length, 3);
    assert.ok(!html.includes("<textarea"));
    assert.ok(!html.includes("Current-state findings"));
    assert.ok(!html.includes("actions without owners"));
    assert.equal(html.includes("Open full workshop record"), !room);
  }
  const empty = renderToStaticMarkup(
    React.createElement(Readout, { session: w.createSession() }),
  );
  assert.match(empty, /0 priority use cases/);
  assert.ok(!empty.includes("Three priority use cases"));
});

test("architecture download recreates source diagram and links session annotations", () => {
  const {
    architectureDiagram,
    diagramRefs,
  } = require("../lib/architecture-diagram.ts");
  const { architectureDocument } = require("../lib/architecture-pdf.ts");
  const s = require("../lib/demo-session.ts").createDemoSession();
  const svg = architectureDiagram(s);
  for (const component of [
    "Adobe Workfront",
    "Adobe CSC",
    "Adobe CDP",
    "OpenAI",
    "ChatGPT Usage",
    "Salesforce",
    "Offer Tools",
    "Customer Journey Analytics",
  ]) {
    assert.ok(
      svg.includes(component) ||
        svg.includes(component.replace("Adobe Workfront", "Workfront")),
    );
  }
  assert.match(diagramRefs("s3", 1), /C/);
  assert.match(svg, /#ffffff/);
  const doc = architectureDocument(s);
  assert.ok(doc.content.slice(0, 5).some((c) => c.svg));
  assert.match(JSON.stringify(doc), /SESSION ANNOTATIONS/);
  assert.match(JSON.stringify(doc), /Use the existing approved library/);
});

test("closing readout has one diagram, three outputs and a persistent editorial summary", () => {
  const {
    closingSummary,
    middayReadout,
  } = require("../lib/closing-summary.ts");
  const Readout = require("../components/workshop-readout.tsx").default;
  let s = require("../lib/demo-session.ts").createDemoSession();
  const auto = closingSummary(s);
  assert.ok(auto.sequence.length > 0);
  s.closing = {
    ownership:
      "OpenAI owns audience reasoning; Adobe owns activation; C&T owns integration.",
    sequence: "1. Validate audience data. 2. Test the content handoff.",
    open: "Resolve identity ownership.",
    colin: "Sponsor a joint implementation lead.",
  };
  s = w.parseSession(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(closingSummary(s), s.closing);
  const html = renderToStaticMarkup(
    React.createElement(Readout, { session: s, setSession: () => {} }),
  );
  assert.equal((html.match(/<svg/g) || []).length, 1);
  assert.ok(!html.includes("generated-node"));
  assert.match(html, /What we take to Colin/);
  assert.match(html, /Sponsor a joint implementation lead/);
  assert.match(middayReadout(s), /Resolve identity ownership/);
  assert.ok(!middayReadout(s).includes("Current-state findings"));
  const legacy = { ...s };
  delete legacy.closing;
  assert.deepEqual(w.parseSession(legacy).closing, {
    ownership: "",
    sequence: "",
    open: "",
    colin: "",
  });
});

test("readout highlights each priority flow and exposes decisions without the full record", () => {
  const { architectureDiagram } = require("../lib/architecture-diagram.ts");
  const { closingItems } = require("../lib/closing-summary.ts");
  const Readout = require("../components/workshop-readout.tsx").default;
  let s = require("../lib/demo-session.ts").createDemoSession();
  s.readoutFlow = { caseId: "s5", step: 3 };
  s.decisions.push({
    id: "visible",
    title: "Choose the approval owner",
    answer: "Operations lead owns review",
    owner: "Alex",
    due: "Monday",
    status: "Confirmed",
    useCase: "s5",
  });
  s.actions.push({
    id: "blocked",
    task: "Connect the request queue",
    blockedBy: "Confirm access to the queue",
    owner: "Sam",
    when: "First",
    sponsorship: "",
    status: "Proposed",
    useCase: "s5",
  });
  s = w.parseSession(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(s.readoutFlow, { caseId: "s5", step: 3 });
  const html = renderToStaticMarkup(
    React.createElement(Readout, { session: s, setSession: () => {} }),
  );
  assert.match(html, /Choose the approval owner/);
  assert.match(html, /Operations lead owns review/);
  assert.match(html, /Confirm access to the queue/);
  assert.match(html, /Routine marketing operations/);
  assert.match(html, /Route exceptions/);
  assert.match(html, /Dashed: proposed/);
  assert.ok(
    closingItems(s).some(
      (i) => i.id === "decision-visible" && i.status === "Agreed",
    ),
  );
  const routine = architectureDiagram(s, "s5", 3),
    content = architectureDiagram(s, "s3", 1);
  assert.notEqual(routine, content);
  assert.match(routine, /#fff0c2/);
  assert.match(routine, /stroke-dasharray="9 6"/);
  assert.ok(!architectureDiagram(s).includes('stroke-dasharray="9 6"'));
  const legacy = { ...s };
  delete legacy.readoutFlow;
  assert.deepEqual(w.parseSession(legacy).readoutFlow, {
    caseId: "",
    step: -1,
  });
});
