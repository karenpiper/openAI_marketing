"use client";
import { useEffect, useRef, useState } from "react";
import SaveFooter, { SaveContext } from "../components/save-footer";
import { middayReadout } from "../lib/closing-summary";
import { persistSession } from "../lib/persistence";
import WorkshopChapter from "../components/workshop-chapter";
import WorkshopOverview from "../components/workshop-overview";
import PriorityWorkshop from "../components/priority-workshop";
import { CurrentState, Architecture } from "../components/workshop-mapping";
import ContentLab from "../components/content-lab";
import WorkshopReadout from "../components/workshop-readout";
import RoomView from "../components/room-view";
import { Field, Badge } from "../components/workshop-fields";
import {
  createSession,
  parseSession,
  SESSION_KEY,
  stages,
  activeCases,
  selectionStamp,
  selectionConfirmed,
  readout,
  type Session,
} from "../lib/workshop";
import { rank, restore, STORAGE_KEY } from "../lib/assessment";
import {
  createDemoSession,
  addDemoGuideExamples,
  DEMO_SESSION_KEY,
  DEMO_CHANNEL,
} from "../lib/demo-session";

export default function Workshop() {
  const [session, setSession] = useState(createSession);
  const [loaded, setLoaded] = useState(false);
  const [room, setRoom] = useState(false);
  const [demo, setDemo] = useState(false);
  const storageKeyRef = useRef(SESSION_KEY);
  const [storageError, setStorageError] = useState("");
  const [message, setMessage] = useState("");
  const [toolsOpen, setToolsOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isRoom = params.get("view") === "room";
    const isDemo = params.get("demo") === "1";
    const key = isDemo ? DEMO_SESSION_KEY : SESSION_KEY;
    storageKeyRef.current = key;
    setRoom(isRoom);
    setDemo(isDemo);
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const saved = parseSession(JSON.parse(raw));
        setSession(
          isRoom
            ? saved
            : {
                ...(isDemo ? addDemoGuideExamples(saved) : saved),
                overview: true,
                briefingPanel: 0,
                timer: {
                  ...saved.timer,
                  remaining: Math.max(
                    0,
                    saved.timer.remaining -
                      (saved.timer.runningSince
                        ? Math.floor(
                            (Date.now() - saved.timer.runningSince) / 1000,
                          )
                        : 0),
                  ),
                  runningSince: null,
                },
              },
        );
      } else if (isDemo) setSession(createDemoSession());
      else {
        const old = localStorage.getItem(STORAGE_KEY);
        if (old)
          setSession((s) => ({ ...s, assessments: restore(JSON.parse(old)) }));
      }
    } catch {
      if (isDemo) setSession(createDemoSession());
      setStorageError(
        "Saved workshop data could not be read. Export this session before leaving; the unreadable saved copy has not been overwritten.",
      );
    }
    const receive = (raw: string | null) => {
      if (!isRoom || !raw) return;
      try {
        setSession(parseSession(JSON.parse(raw)));
      } catch {
        setStorageError("The facilitator update could not be read.");
      }
    };
    const handler = (e: StorageEvent) => {
      if (e.key === key) receive(e.newValue);
    };
    window.addEventListener("storage", handler);
    if ("BroadcastChannel" in window) {
      const c = new BroadcastChannel(
        isDemo ? DEMO_CHANNEL : "oai-workshop-room",
      );
      channelRef.current = c;
      if (isRoom)
        c.onmessage = (e) =>
          receive(typeof e.data === "string" ? e.data : null);
    }
    setLoaded(true);
    return () => {
      window.removeEventListener("storage", handler);
      channelRef.current?.close();
    };
  }, []);
  useEffect(() => {
    if (!loaded || room) return;
    const data = JSON.stringify(session);
    channelRef.current?.postMessage(data);
    if (storageError) return;
    try {
      persistSession(localStorage, storageKeyRef.current, session);
    } catch {
      setStorageError(
        "Browser storage is unavailable or full. Export a backup before leaving.",
      );
    }
  }, [session, loaded, room, storageError]);
  function saveNow() {
    if (storageError.includes("unreadable saved copy"))
      return {
        ok: false,
        message:
          "Save blocked: restore or export a backup before replacing the unreadable saved session.",
      };
    try {
      const data = persistSession(localStorage, storageKeyRef.current, session);
      setStorageError("");
      channelRef.current?.postMessage(data);
      return { ok: true, message: "Saved in this browser. Autosave stays on." };
    } catch {
      const message =
        "Could not save in this browser. Export a backup before leaving.";
      setStorageError(message);
      return { ok: false, message };
    }
  }
  function navigate(stage: number) {
    setSession((s) => ({
      ...s,
      stage,
      overview: false,
      focus: s.focus,
      timer: {
        stage,
        remaining: stages[stage].minutes * 60,
        runningSince: null,
      },
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function download(kind: "json" | "md") {
    const data =
      kind === "json"
        ? JSON.stringify(session, null, 2)
        : `${demo ? "DEMO DATA · Fictional test records, not workshop findings.\n\n" : ""}${middayReadout(session)}`;
    const url = URL.createObjectURL(
      new Blob([data], {
        type: kind === "json" ? "application/json" : "text/markdown",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${demo ? "DEMO-" : ""}openai-workshop-${new Date().toISOString().slice(0, 10)}.${kind}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function importFile(file?: File) {
    if (!file) return;
    try {
      if (file.size > 2000000)
        throw Error("Choose a workshop backup smaller than 2 MB.");
      const next = parseSession(JSON.parse(await file.text()));
      if (
        !confirm(
          "Replace the current workshop with this backup? Export first if you need to keep this session.",
        )
      )
        return;
      setSession(next);
      setStorageError("");
      setMessage("Workshop restored from backup.");
    } catch (e) {
      setMessage(`Import failed: ${(e as Error).message}`);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }
  function enterDemo() {
    if (storageError) {
      setMessage(
        "Export your real session before switching. Browser storage must be available to keep both sessions safely.",
      );
      return;
    }
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      window.location.assign(`${window.location.pathname}?demo=1`);
    } catch {
      setStorageError(
        "Could not save your real workshop, so demo mode was not opened. Export a backup before leaving.",
      );
    }
  }
  const selection = (
    <section className="selection-panel">
      <span className="eyebrow">A score is a conversation aid</span>
      <h2>Confirm the working set.</h2>
      <p>
        Select the cases to carry into current state and architecture. The room
        can choose a different set from the score order.
      </p>
      {rank(session.assessments).map((u) => (
        <label className="selection-row" key={u.id}>
          <input
            type="checkbox"
            checked={session.selected.includes(u.id)}
            onChange={(e) =>
              setSession((s) => ({
                ...s,
                selected: e.target.checked
                  ? [...s.selected, u.id]
                  : s.selected.filter((id) => id !== u.id),
                selectionSignature: "",
              }))
            }
          />
          <span>
            <strong>{u.label}</strong>
            <small>{session.assessments[u.id].proofText}</small>
          </span>
        </label>
      ))}
      <div className="inline-actions">
        <button
          className="primary"
          disabled={!activeCases(session).length}
          onClick={() =>
            setSession((s) => ({ ...s, selectionSignature: selectionStamp(s) }))
          }
        >
          Confirm the room’s working set
        </button>
        <Badge value={selectionConfirmed(session) ? "Confirmed" : "Proposed"} />
      </div>
      <p className="muted">
        Changing a selected case’s score, proof, notes or veto requires
        confirmation again.
      </p>
      <button
        disabled={!selectionConfirmed(session)}
        onClick={() => navigate(1)}
      >
        Continue to current state →
      </button>
      <SaveFooter />
    </section>
  );
  if (!loaded)
    return (
      <main className="loading-screen">
        <span className="eyebrow">OpenAI × Adobe × Code and Theory</span>
        <h1>Preparing the workshop…</h1>
      </main>
    );
  if (room)
    return (
      <>
        {storageError && (
          <p role="alert" className="notice error">
            {storageError}
          </p>
        )}
        {demo && (
          <div className="demo-banner">
            <strong>Demo data</strong>
            <span>
              Fictional records for testing. No real workshop decisions.
            </span>
          </div>
        )}
        <RoomView session={session} />
      </>
    );
  return (
    <SaveContext.Provider
      value={{ save: saveNow, revision: session, error: storageError }}
    >
      <div className="workshop-app">
        <header className="workshop-header">
          <div className="workshop-brand">
            <span className="brand-mark">↗</span>
            <div>
              <strong>The working session</strong>
              <span>OpenAI × Adobe × Code and Theory</span>
            </div>
          </div>
          <div className="header-actions">
            <span className={`save-status ${storageError ? "unsaved" : ""}`}>
              {storageError ? "Not saved" : "Saved in this browser"}
            </span>
            {!session.overview && (
              <button
                onClick={() => {
                  setSession((s) => ({
                    ...s,
                    overview: true,
                    briefingPanel: 0,
                    timer: { ...s.timer, runningSince: null },
                  }));
                }}
              >
                00 · Workshop overview
              </button>
            )}
            <button
              aria-expanded={toolsOpen}
              onClick={() => setToolsOpen((v) => !v)}
            >
              Workshop settings
            </button>
          </div>
        </header>
        {demo && (
          <div className="demo-banner">
            <div>
              <strong>Demo data · test anything here</strong>
              <p>
                Fictional priorities and step 2 answers for all seven use cases
                are loaded. Your real workshop is untouched. Enter the workshop,
                then explore step 2 or jump to architecture, the workflow
                exercise or readout.
              </p>
            </div>
            <div className="inline-actions">
              <button
                onClick={() => {
                  if (
                    confirm(
                      "Reset only the demo data and discard your demo edits?",
                    )
                  ) {
                    setSession(createDemoSession());
                    setStorageError("");
                  }
                }}
              >
                Reset demo data
              </button>
              <button
                onClick={() => window.location.assign(window.location.pathname)}
              >
                Return to real workshop
              </button>
            </div>
          </div>
        )}
        {!session.overview && (
          <>
            <nav className="agenda-tabs" aria-label="Workshop agenda">
              {stages.map((stage, i) => (
                <button
                  key={stage.title}
                  aria-current={session.stage === i ? "step" : undefined}
                  className={session.stage === i ? "active" : ""}
                  onClick={() => {
                    navigate(i);
                  }}
                >
                  <span className="agenda-number">0{i + 1}</span>
                  <span>
                    <strong>{stage.title}</strong>
                    <small>{stage.subtitle}</small>
                  </span>
                  <span className="agenda-time">{stage.minutes} min</span>
                </button>
              ))}
            </nav>
            <div className="facilitator-strip">
              <span>
                {session.stage < 2
                  ? "Today · establish and correct"
                  : "Proposed future · test and agree"}{" "}
                <b> · </b> {activeCases(session).length} selected cases{" "}
                <b> · </b>{" "}
                {selectionConfirmed(session)
                  ? "Working set confirmed"
                  : "Working set not confirmed"}
              </span>
            </div>
          </>
        )}
        {storageError && (
          <p className="notice error" role="alert">
            {storageError}
          </p>
        )}
        {message && (
          <p className="notice" role="status">
            {message}
            <button className="quiet" onClick={() => setMessage("")}>
              Dismiss
            </button>
          </p>
        )}
        {toolsOpen && (
          <section className="session-tools">
            <div>
              <h2>Workshop settings</h2>
              <p>
                Share this workshop screen with the room. Notes save
                automatically in this browser. Use these controls to back up
                your work, restore a session or try demo data.
              </p>
              <div className="inline-actions">
                {!demo && <button onClick={enterDemo}>Try demo data</button>}
                <button onClick={() => download("json")}>
                  Export session backup
                </button>
                <button onClick={() => fileRef.current?.click()}>
                  Restore backup
                </button>
                <button onClick={() => download("md")}>Export readout</button>
                <button onClick={() => window.print()}>
                  Print readout / PDF
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".json,application/json"
                hidden
                onChange={(e) => importFile(e.target.files?.[0])}
              />
            </div>
            <div>
              <Field
                label="Parking lot · questions for later"
                multiline
                value={session.parking}
                onChange={(v) => setSession((s) => ({ ...s, parking: v }))}
              />
              <button
                className="quiet danger"
                onClick={() => {
                  if (
                    confirm(
                      "Clear the full workshop, including scores, decisions and drafts? Export a backup first.",
                    )
                  ) {
                    setSession(demo ? createDemoSession() : createSession());
                    setStorageError("");
                    setMessage("New workshop started.");
                  }
                }}
              >
                {demo ? "Reset demo workshop" : "Start a fresh workshop"}
              </button>
            </div>
            <SaveFooter />
          </section>
        )}
        {!session.overview &&
          session.stage > 0 &&
          !selectionConfirmed(session) && (
            <div className="notice">
              The working set needs confirmation. You can explore these
              sections, but the readout will show the selection as proposed.{" "}
              <button
                onClick={() => {
                  navigate(0);
                  setSession((s) => ({ ...s, scene: 9 }));
                }}
              >
                Return to selection
              </button>
            </div>
          )}
        {!session.overview && <WorkshopChapter stage={session.stage} />}
        <div className="capture-content">
          {session.overview ? (
            <WorkshopOverview
              session={session}
              setSession={setSession}
              onEnter={() => {
                navigate(0);
                setSession((s) => ({ ...s, scene: 0 }));
              }}
              onResume={() => setSession((s) => ({ ...s, overview: false }))}
            />
          ) : (
            <>
              {session.stage === 0 && (
                <PriorityWorkshop
                  state={session.assessments}
                  setState={(action) =>
                    setSession((s) => ({
                      ...s,
                      assessments:
                        typeof action === "function"
                          ? action(s.assessments)
                          : action,
                    }))
                  }
                  step={session.scene}
                  setStep={(n) => setSession((s) => ({ ...s, scene: n }))}
                  selection={selection}
                />
              )}{" "}
              {session.stage === 1 && (
                <CurrentState session={session} setSession={setSession} />
              )}{" "}
              {session.stage === 2 && (
                <>
                  <div className="architecture-tabs">
                    <button
                      className={
                        session.architectureTab === "map" ? "selected" : ""
                      }
                      onClick={() =>
                        setSession((s) => ({ ...s, architectureTab: "map" }))
                      }
                    >
                      Architecture & decisions
                    </button>
                    <button
                      className={
                        session.architectureTab === "lab" ? "selected" : ""
                      }
                      onClick={() =>
                        setSession((s) => ({ ...s, architectureTab: "lab" }))
                      }
                    >
                      Explore the workflow · engagement at scale
                    </button>
                    <small>
                      The exercise sits within the 45-minute architecture block.
                    </small>
                  </div>
                  {session.architectureTab === "map" ? (
                    <Architecture session={session} setSession={setSession} />
                  ) : (
                    <ContentLab session={session} setSession={setSession} />
                  )}
                </>
              )}{" "}
              {session.stage === 3 && (
                <>
                  <div className="readout-export">
                    <button onClick={() => download("md")}>
                      Export readout
                    </button>
                    <button onClick={() => window.print()}>
                      Print / save PDF
                    </button>
                    <button onClick={() => download("json")}>
                      Backup all inputs
                    </button>
                  </div>
                  <WorkshopReadout session={session} setSession={setSession} />
                </>
              )}
            </>
          )}
        </div>
        <footer className="workshop-footer">
          <span>Capture → read back → confirm · Unknowns stay visible</span>
          {!session.overview && session.stage < 3 && (
            <button onClick={() => navigate(session.stage + 1)}>
              Next: {stages[session.stage + 1].title} →
            </button>
          )}
        </footer>
        <div className="print-only">
          {demo && (
            <p>
              <strong>
                DEMO DATA · Fictional test records. Not actual workshop
                findings.
              </strong>
            </p>
          )}
          <WorkshopReadout session={session} room />
        </div>
      </div>
    </SaveContext.Provider>
  );
}
