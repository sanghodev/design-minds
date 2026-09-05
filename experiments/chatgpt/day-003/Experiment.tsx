"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import styles from "./experiment.module.css";

const thoughts = [
  { cue: "NOTICE", text: "Attention is not a spotlight. It changes the room around what it touches." },
  { cue: "RETURN", text: "An interruption matters most when the path back remains visible." },
  { cue: "EDGE", text: "What leaves the center does not become less true. It becomes context." },
  { cue: "CHOICE", text: "Focus is the temporary architecture made by choosing one thing." },
  { cue: "PAUSE", text: "A quiet interface can still move—by changing relationships, not adding noise." },
  { cue: "RESUME", text: "The page should remember where your attention was without remembering who you are." },
];

export default function FocusRoomExperiment() {
  const [active, setActive] = useState(0);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  const select = useCallback((index: number, moveFocus = false) => {
    const next = (index + thoughts.length) % thoughts.length;
    setActive(next);
    if (moveFocus) buttons.current[next]?.focus();
  }, []);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/">← Design Minds</Link>
        <span>ChatGPT · Day 003</span>
        <span>Spatial attention study</span>
      </header>

      <section className={styles.intro}>
        <p>CHOOSE ONE THOUGHT</p>
        <h1>Focus rearranges<br />the room.</h1>
        <p>Tap a sentence. Use Tab, or move between thoughts with the arrow keys. Nothing disappears; context moves to make space.</p>
      </section>

      <section className={styles.room} style={{ "--active": active } as React.CSSProperties} aria-label="A room of six selectable thoughts">
        {thoughts.map((thought, index) => (
          <button
            key={thought.cue}
            ref={(node) => { buttons.current[index] = node; }}
            type="button"
            className={index === active ? styles.active : styles.panel}
            aria-pressed={index === active}
            onClick={() => select(index)}
            onFocus={() => select(index)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") { event.preventDefault(); select(active + 1, true); }
              if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); select(active - 1, true); }
              if (event.key === "Home") { event.preventDefault(); select(0, true); }
              if (event.key === "End") { event.preventDefault(); select(thoughts.length - 1, true); }
            }}
          >
            <span>{thought.cue}</span>
            <strong>{thought.text}</strong>
          </button>
        ))}
        <div className={styles.axis} aria-hidden="true"><i /><i /></div>
      </section>

      <section className={styles.reading} aria-live="polite">
        <span>{thoughts[active].cue}</span>
        <p>{thoughts[active].text}</p>
      </section>

      <footer className={styles.footer}>
        <p>The interruption is reversible. Select another thought and the room forms again.</p>
        <span>Touch · pointer · keyboard</span>
      </footer>
    </main>
  );
}
