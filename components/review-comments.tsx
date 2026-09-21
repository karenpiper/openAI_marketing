"use client";
import { useEffect, useState } from "react";
import { VercelToolbar } from "@vercel/toolbar/next";

export default function ReviewComments() {
  const [enabled, setEnabled] = useState(false);
  const [help, setHelp] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setEnabled(new URLSearchParams(location.search).get("review") === "1");
  }, []);
  function start() {
    const url = new URL(location.href);
    url.searchParams.set("review", "1");
    history.replaceState(history.state, "", url);
    setEnabled(true);
    setHelp(true);
  }
  function end() {
    const url = new URL(location.href);
    url.searchParams.delete("review");
    // Reload removes the injected review overlay; workshop answers are autosaved separately.
    location.assign(url.toString());
  }
  return (
    <div className="review-comments">
      <button
        onClick={() => (enabled ? setHelp(!help) : start())}
        aria-expanded={help}
        aria-controls="review-help"
      >
        {enabled ? "Comments · review mode" : "Comments"}
      </button>
      {enabled && <VercelToolbar onError={() => setFailed(true)} />}
      {help && (
        <section
          id="review-help"
          className="review-help"
          aria-label="Shared comments"
        >
          <header>
            <h2>Review together</h2>
            <button
              aria-label="Close comment instructions"
              onClick={() => setHelp(false)}
            >
              ×
            </button>
          </header>
          <p>
            In the Vercel toolbar, choose <b>Comment</b>, then click the spot
            you want to discuss. Open <b>Inbox</b> to reply, find threads or
            resolve feedback.
          </p>
          <p>
            Sign in to Vercel when prompted. Reviewers need access through
            Vercel’s sharing controls. Comments are shared; workshop answers and
            workflow progress are still private to each browser.
          </p>
          <p>
            For a workflow comment, include the step and artifact name so
            another reviewer can recreate the same view.
          </p>
          {failed && (
            <p role="alert">
              The commenting toolbar could not load. Check your connection or
              browser blocking settings, then reload.
            </p>
          )}
          <p>
            If the toolbar does not appear, check the project’s Settings →
            General → Vercel Toolbar → Production setting.
          </p>
          <footer>
            <a
              href="https://vercel.com/docs/comments/using-comments"
              target="_blank"
              rel="noreferrer"
            >
              Commenting guide ↗
            </a>
            <button onClick={end}>Exit review mode</button>
          </footer>
        </section>
      )}
    </div>
  );
}
