"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./experiment.module.css";

const words = [
  "WE", "KEEP", "WHAT", "WE", "CAN", "NAME", "AND", "LOSE", "WHAT", "WE", "CANNOT", "HOLD",
  "BUT", "EVERY", "ABSENCE", "LEAVES", "A", "SHAPE", "THE", "ROOM", "STILL", "KNOWS",
];

type AudioNodes = { context: AudioContext; master: GainNode; voices: Map<number, OscillatorNode> };

export default function RemovalExperiment() {
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const [sound, setSound] = useState(false);
  const [painting, setPainting] = useState(false);
  const audio = useRef<AudioNodes | null>(null);

  const stopAudio = useCallback(() => {
    const current = audio.current;
    if (!current) return;
    current.master.gain.setTargetAtTime(0.0001, current.context.currentTime, 0.06);
    window.setTimeout(() => current.context.close(), 240);
    audio.current = null;
  }, []);

  const syncVoices = useCallback((next: Set<number>) => {
    const current = audio.current;
    if (!current) return;
    current.voices.forEach((voice, index) => {
      if (!next.has(index)) { voice.stop(); current.voices.delete(index); }
    });
    next.forEach((index) => {
      if (current.voices.has(index)) return;
      const voice = current.context.createOscillator();
      const gain = current.context.createGain();
      voice.type = index % 3 === 0 ? "sine" : "triangle";
      voice.frequency.value = 110 * Math.pow(2, ([0, 3, 5, 7, 10][index % 5]) / 12);
      gain.gain.value = 0.012;
      voice.connect(gain).connect(current.master);
      voice.start(); current.voices.set(index, voice);
    });
  }, []);

  const enableSound = useCallback(() => {
    if (sound) { setSound(false); stopAudio(); return; }
    const AC = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const context = new AC(); const master = context.createGain();
    master.gain.value = 0.075; master.connect(context.destination);
    audio.current = { context, master, voices: new Map() };
    setSound(true); syncVoices(removed);
  }, [removed, sound, stopAudio, syncVoices]);

  const removeWord = useCallback((index: number) => {
    setRemoved((current) => {
      if (current.has(index)) return current;
      const next = new Set(current); next.add(index); syncVoices(next); return next;
    });
  }, [syncVoices]);

  const reset = useCallback(() => { const next = new Set<number>(); setRemoved(next); syncVoices(next); }, [syncVoices]);
  useEffect(() => () => stopAudio(), [stopAudio]);
  useEffect(() => {
    const release = () => setPainting(false);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => { window.removeEventListener("pointerup", release); window.removeEventListener("pointercancel", release); };
  }, []);

  const phrase = useMemo(() => words.filter((_, index) => !removed.has(index)).join(" "), [removed]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/">← Design Minds</Link><span>ChatGPT · Day 002</span>
        <button type="button" aria-pressed={sound} onClick={enableSound}>Sound {sound ? "on" : "off"}</button>
      </header>

      <section className={styles.stage}>
        <div className={styles.context}>
          <p>AN INSTRUMENT FOR EDITING BY ABSENCE</p>
          <h1>What we remove<br />remains.</h1>
          <p className={styles.instruction}>Tap a word, or drag across several. Keyboard users can focus a word and press Enter or Space.</p>
        </div>

        <div className={styles.sentence} aria-label="Interactive sentence. Remove words to reveal their negative space.">
          {words.map((word, index) => {
            const isRemoved = removed.has(index);
            return (
              <button key={`${word}-${index}`} type="button" className={isRemoved ? styles.missing : styles.word}
                aria-label={isRemoved ? `${word}, removed` : `Remove ${word}`}
                aria-pressed={isRemoved} disabled={isRemoved}
                onPointerDown={() => { setPainting(true); removeWord(index); }}
                onPointerEnter={() => { if (painting) removeWord(index); }}
                onClick={() => removeWord(index)}>
                <span aria-hidden="true">{word}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.after} aria-live="polite">
          <p>{removed.size === 0 ? "The sentence is intact." : phrase || "Only the shape of the sentence remains."}</p>
          {removed.size > 0 && <button type="button" onClick={reset}>Restore every word</button>}
        </div>
      </section>

      <footer className={styles.footer}>
        <p>Turn on sound only if you want to hear the gaps. Each missing position holds one quiet note.</p>
        <span>No text is stored.</span>
      </footer>
    </main>
  );
}
