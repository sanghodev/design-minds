"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./experiment.module.css";

type Pause = { id: number; duration: number; label: string };
const describePause = (ms: number) => ms < 700 ? "brief" : ms < 1800 ? "held" : ms < 3500 ? "lingering" : "unhurried";

export default function PauseExperiment() {
  const [holding, setHolding] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [pauses, setPauses] = useState<Pause[]>([]);
  const [sound, setSound] = useState(false);
  const startedAt = useRef(0);
  const frame = useRef<number | null>(null);

  const finish = useCallback(() => {
    if (!holding) return;
    const duration = Math.max(120, performance.now() - startedAt.current);
    setHolding(false); setElapsed(duration);
    setPauses((items) => [{ id: Date.now(), duration, label: describePause(duration) }, ...items].slice(0, 7));
    if (sound) {
      const AC = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) {
        const context = new AC(); const oscillator = context.createOscillator(); const gain = context.createGain();
        const length = Math.min(1.8, Math.max(.18, duration / 2600));
        oscillator.type = "sine"; oscillator.frequency.value = Math.max(92, 310 - duration / 18);
        gain.gain.setValueAtTime(.0001, context.currentTime); gain.gain.exponentialRampToValueAtTime(.055, context.currentTime + .025); gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + length);
        oscillator.connect(gain).connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + length); oscillator.addEventListener("ended", () => context.close());
      }
    }
  }, [holding, sound]);

  const begin = useCallback(() => { if (!holding) { startedAt.current = performance.now(); setElapsed(0); setHolding(true); } }, [holding]);
  useEffect(() => {
    if (!holding) return;
    const tick = () => { setElapsed(performance.now() - startedAt.current); frame.current = requestAnimationFrame(tick); };
    frame.current = requestAnimationFrame(tick); return () => { if (frame.current) cancelAnimationFrame(frame.current); };
  }, [holding]);
  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.code === "Space" && !e.repeat && !(e.target instanceof HTMLButtonElement)) { e.preventDefault(); begin(); } };
    const up = (e: KeyboardEvent) => { if (e.code === "Space") { e.preventDefault(); finish(); } };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [begin, finish]);

  const pressure = Math.min(1, elapsed / 4200);
  return (
    <main className={styles.page} style={{ "--pressure": pressure } as React.CSSProperties}>
      <header className={styles.header}><Link href="/">← Design Minds</Link><span>ChatGPT · Day 001</span><button type="button" aria-pressed={sound} onClick={() => setSound((v) => !v)}>Sound {sound ? "on" : "off"}</button></header>
      <section className={styles.intro}><p>AN EXPERIMENT IN TEMPORAL INPUT</p><h1>A pause<br />has weight.</h1><div className={styles.hypothesis}><span>Hypothesis</span><p>Can duration—not movement—become the primary gesture of an interface?</p></div></section>
      <section className={styles.instrument}>
        <button className={styles.hold} type="button"
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); begin(); }} onPointerUp={finish} onPointerCancel={finish}
          onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !e.repeat) { e.preventDefault(); begin(); } }} onKeyUp={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); finish(); } }}
          aria-label="Press and hold to give silence duration, then release">
          <span className={styles.word}>SILENCE</span><span className={styles.instruction}>{holding ? "release when it feels complete" : "press and hold · or hold space"}</span><span className={styles.time} aria-live="polite">{holding || elapsed ? `${(elapsed / 1000).toFixed(1)}s` : "begin"}</span>
        </button>
      </section>
      <section className={styles.archive} aria-labelledby="archive-title">
        <div className={styles.archiveHead}><h2 id="archive-title">Recent silences</h2><p>Nothing is stored. This archive disappears when you leave.</p></div>
        {pauses.length === 0 ? <p className={styles.empty}>Your first pause will leave a temporary measure here.</p> : <ol>{pauses.map((pause) => <li key={pause.id}><span className={styles.bar} style={{ width: `${Math.min(100, 18 + pause.duration / 45)}%` }} /><span>{pause.label}</span><time>{(pause.duration / 1000).toFixed(1)} seconds</time></li>)}</ol>}
      </section>
      <footer className={styles.footer}><p>Silence here is not empty. It is the time you chose not to move.</p><span>Pointer · touch · keyboard</span></footer>
    </main>
  );
}
