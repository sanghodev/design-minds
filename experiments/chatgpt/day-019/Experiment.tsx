"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import s from "./experiment.module.css";

type Mode = "compact" | "split";
type Phase = "idle" | "accepted" | "complete" | "cancelled";

const DELAY_MS = 6000;

function clock(date: Date | null) {
  return date ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—";
}

export default function AcceptedExperiment() {
  const [mode, setMode] = useState<Mode>("split");
  const [phase, setPhase] = useState<Phase>("idle");
  const [acceptedAt, setAcceptedAt] = useState<Date | null>(null);
  const [completedAt, setCompletedAt] = useState<Date | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function clearTimer() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }

  function start() {
    clearTimer();
    setAcceptedAt(new Date());
    setCompletedAt(null);
    setPhase("accepted");
    timer.current = setTimeout(() => {
      setCompletedAt(new Date());
      setPhase("complete");
      timer.current = null;
    }, DELAY_MS);
  }

  function cancel() {
    clearTimer();
    setPhase("cancelled");
  }

  function reset() {
    clearTimer();
    setPhase("idle");
    setAcceptedAt(null);
    setCompletedAt(null);
    setMode("split");
  }

  const busy = phase === "accepted";
  const status = phase === "idle"
    ? "No request has been sent."
    : phase === "accepted"
      ? mode === "split" ? "Request accepted. Completion is not yet known." : "Working. Completion is not yet known."
      : phase === "complete" ? "Request completed." : "Request cancelled before completion.";

  return (
    <main className={s.page} lang="en">
      <nav className={s.nav}>
        <Link href="/">Design Minds</Link>
        <span>CHATGPT / DAY 019</span>
      </nav>

      <header className={s.header}>
        <p className={s.kicker}>ASYNC STATE / HONEST FEEDBACK</p>
        <h1>Accepted is<br />not finished.</h1>
        <p className={s.lede}>Run one fixed delay. Compare a status that changes in place with a receipt that remains after completion.</p>
      </header>

      <section className={s.mode} aria-labelledby="mode-label">
        <p id="mode-label">Status structure</p>
        <div className={s.buttons}>
          <button type="button" aria-pressed={mode === "compact"} disabled={busy} onClick={() => setMode("compact")}>One changing message</button>
          <button type="button" aria-pressed={mode === "split"} disabled={busy} onClick={() => setMode("split")}>Receipt + completion</button>
        </div>
      </section>

      <section className={s.instrument} aria-busy={busy} aria-describedby="task-note">
        <div className={s.task}>
          <p className={s.label}>AUTHORED LOCAL TASK</p>
          <p className={s.request}>Prepare a reading copy.</p>
          <p id="task-note">The page waits six seconds locally. It performs no upload and knows no percentage of completion.</p>
          <div className={s.buttons}>
            <button type="button" onClick={start} disabled={busy}>{phase === "idle" ? "Send request" : "Send again"}</button>
            <button type="button" onClick={cancel} disabled={!busy}>Cancel</button>
            <button type="button" onClick={reset}>Reset</button>
          </div>
        </div>

        <div className={s.record}>
          <div className={s.status} role="status" aria-live="polite" aria-atomic="true">
            <span>CURRENT STATUS</span>
            <strong>{status}</strong>
          </div>

          {mode === "split" ? (
            <ol className={s.ledger} aria-label="Request record">
              <li data-state={phase === "idle" ? "empty" : "recorded"}>
                <span>01 / RECEIPT</span>
                <strong>{phase === "idle" ? "Not issued" : "Accepted"}</strong>
                <time>{clock(acceptedAt)}</time>
                <small>{phase === "idle" ? "Nothing has been requested." : "The action was received. This is not a completion claim."}</small>
              </li>
              <li data-state={phase === "complete" ? "recorded" : phase === "cancelled" ? "cancelled" : "empty"}>
                <span>02 / OUTCOME</span>
                <strong>{phase === "complete" ? "Completed" : phase === "cancelled" ? "Cancelled" : "Unresolved"}</strong>
                <time>{clock(completedAt)}</time>
                <small>{phase === "complete" ? "The fixed local delay ended." : phase === "cancelled" ? "The pending timer was stopped." : "No result is available yet."}</small>
              </li>
            </ol>
          ) : (
            <div className={s.compact}>
              <span>SINGLE RECORD</span>
              <strong>{status}</strong>
              <small>The earlier message is replaced. This view does not preserve a separate receipt.</small>
            </div>
          )}
        </div>
      </section>

      <aside className={s.disclosure}>
        <h2>What this page knows</h2>
        <p>It knows when you pressed the button, whether its local timer is pending, and when that timer ended. It does not know a fractional amount of work, so it draws no progress bar.</p>
        <p>No interaction data leaves this page. No participant behavior or comprehension improvement has been measured.</p>
      </aside>

      <footer className={s.footer}>
        <Link href="/research/chatgpt/day-019">Read the research notebook (Korean)</Link>
        <span>Independent design study / local state only</span>
      </footer>
    </main>
  );
}
