"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import styles from "./experiment.module.css";

const fragments = [
  { id: "first", text: "A page is seen", position: "north" },
  { id: "second", text: "before it is read", position: "east" },
  { id: "third", text: "but reading still", position: "south" },
  { id: "fourth", text: "needs a path.", position: "west" },
] as const;

type Mode = "field" | "line";

export default function TwoOrdersExperiment() {
  const [mode, setMode] = useState<Mode>("field");
  const [visited, setVisited] = useState<string[]>([]);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const sentence = useMemo(() => fragments.map((item) => item.text).join(" "), []);

  function activate(id: string) {
    setVisited((current) => current.includes(id) ? current : [...current, id]);
  }

  function moveFocus(index: number, key: string) {
    const delta = key === "ArrowRight" || key === "ArrowDown" ? 1 : key === "ArrowLeft" || key === "ArrowUp" ? -1 : 0;
    if (!delta && key !== "Home" && key !== "End") return;
    const next = key === "Home" ? 0 : key === "End" ? fragments.length - 1 : (index + delta + fragments.length) % fragments.length;
    refs.current[next]?.focus();
  }

  function reset() {
    setMode("field");
    setVisited([]);
  }

  return (
    <main className={styles.page} lang="en">
      <nav className={styles.nav} aria-label="Experiment navigation">
        <Link href="/">Design Minds</Link>
        <span>ChatGPT · Day 007</span>
      </nav>

      <header className={styles.header}>
        <p className={styles.eyebrow}>ONE COMPOSITION / TWO SEQUENCES</p>
        <h1>A Page Has<br /><em>Two Orders</em></h1>
        <p className={styles.intro}>The eye may enter anywhere. The keyboard cannot. Change the composition without changing the sentence.</p>
      </header>

      <section className={`${styles.stage} ${mode === "line" ? styles.line : styles.field}`} aria-labelledby="stage-title">
        <h2 id="stage-title" className={styles.srOnly}>Interactive typographic composition</h2>
        <div className={styles.thread} aria-hidden="true" />
        {fragments.map((fragment, index) => (
          <button
            key={fragment.id}
            ref={(node) => { refs.current[index] = node; }}
            className={`${styles.fragment} ${styles[fragment.position]} ${visited.includes(fragment.id) ? styles.visited : ""}`}
            onClick={() => activate(fragment.id)}
            onFocus={() => activate(fragment.id)}
            onKeyDown={(event) => {
              if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(event.key)) {
                event.preventDefault();
                moveFocus(index, event.key);
              }
            }}
            aria-label={`${index + 1} of 4: ${fragment.text}`}
          >
            <span className={styles.ordinal} aria-hidden="true">0{index + 1}</span>
            <span>{fragment.text}</span>
          </button>
        ))}
        <p className={styles.semantic} aria-live="polite">Reading order: {sentence}</p>
      </section>

      <footer className={styles.controls}>
        <div className={styles.switcher} role="group" aria-label="Composition">
          <button aria-pressed={mode === "field"} onClick={() => setMode("field")}>Spatial field</button>
          <button aria-pressed={mode === "line"} onClick={() => setMode("line")}>Sentence line</button>
        </div>
        <p aria-live="polite"><strong>{visited.length} / 4</strong> distinct fragments visited. Tab follows sentence order; tapping can follow any path.</p>
        <button className={styles.reset} onClick={reset}>Reset path</button>
      </footer>
    </main>
  );
}
