"use client";

import { useReducer } from "react";
import Link from "next/link";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { INITIAL, MAX_TRACKING, MIN_TRACKING, studyReducer, trackingEm, type Word } from "./model";
import s from "./experiment.module.css";

function WordSpecimen({ word, tracking, guides, kerned }: { word: Word; tracking: number; guides: boolean; kerned: boolean }) {
  const label = kerned ? "Pair-aware kerning" : "Uniform tracking only";
  return <figure className={s.specimen} data-specimen={kerned ? "kerned" : "uniform"}>
    <figcaption><span>{label}</span><span>{tracking > 0 ? "+" : ""}{tracking / 100}em added</span></figcaption>
    <div className={`${s.wordField} ${guides ? s.guided : ""}`}>
      <div
        className={s.word}
        aria-label={`${word}, ${label}, ${tracking / 100} em added tracking`}
        style={{ letterSpacing: `${trackingEm(tracking)}em`, fontKerning: kerned ? "normal" : "none", fontFeatureSettings: kerned ? '"kern" 1' : '"kern" 0' }}
      >{word}</div>
    </div>
  </figure>;
}

export default function GapExperiment() {
  const [state, dispatch] = useReducer(studyReducer, INITIAL);
  const kerned = <WordSpecimen key="kerned" word={state.word} tracking={state.tracking} guides={state.guides} kerned />;
  const uniform = <WordSpecimen key="uniform" word={state.word} tracking={state.tracking} guides={state.guides} kerned={false} />;
  return <main className={s.page} lang="en">
    <nav className={s.nav} aria-label="Experiment navigation"><Link href="/">Design Minds</Link><span>ChatGPT / Day 021</span><Link href="/research/chatgpt/day-021">Research notebook (Korean)</Link></nav>
    <header className={s.intro}>
      <p className={s.kicker}>LETTERSPACE / PAIRSPACE</p>
      <h1>When is a gap <em>equal?</em></h1>
      <p>Change one amount of tracking. Compare what happens when the font may also adjust specific pairs.</p>
    </header>
    <section className={s.stage} aria-label="Two spacing rules applied to the same word">
      {state.swapped ? [uniform, kerned] : [kerned, uniform]}
    </section>
    <section className={s.controls} aria-label="Spacing controls">
      <fieldset className={s.words}><legend>Word specimen</legend>{(["AVATAR", "WAYWARD", "TOY"] as const).map(word => <label key={word}><input type="radio" name="word" checked={state.word === word} onChange={() => dispatch({ type: "word", value: word })} /><span>{word}</span></label>)}</fieldset>
      <div className={s.tracking}>
        <label htmlFor="tracking">Added tracking <output htmlFor="tracking">{state.tracking > 0 ? "+" : ""}{state.tracking / 100}em</output></label>
        <div>
          <button type="button" aria-label="Tighten by 0.01 em" disabled={state.tracking === MIN_TRACKING} onClick={() => dispatch({ type: "tracking", value: state.tracking - 1 })}><Minus aria-hidden="true" size={19} /></button>
          <input id="tracking" type="range" min={MIN_TRACKING} max={MAX_TRACKING} step="1" value={state.tracking} aria-valuetext={`${state.tracking / 100} em added tracking`} onChange={event => dispatch({ type: "tracking", value: Number(event.target.value) })} />
          <button type="button" aria-label="Loosen by 0.01 em" disabled={state.tracking === MAX_TRACKING} onClick={() => dispatch({ type: "tracking", value: state.tracking + 1 })}><Plus aria-hidden="true" size={19} /></button>
        </div>
      </div>
      <div className={s.actions}>
        <label><input type="checkbox" checked={state.guides} onChange={() => dispatch({ type: "guides" })} />Show character bands</label>
        <button type="button" aria-pressed={state.swapped} onClick={() => dispatch({ type: "swap" })}>Swap rows</button>
        <button type="button" onClick={() => dispatch({ type: "reset" })}><RotateCcw aria-hidden="true" size={17} />Reset</button>
      </div>
    </section>
    <p className={s.status} role="status" aria-live="polite" aria-atomic="true">{state.word}. {state.tracking / 100} em added to both rows. Pair-aware specimen is on the {state.swapped ? "bottom" : "top"}. Character bands {state.guides ? "visible" : "hidden"}.</p>
    <footer className={s.footer}><p>Tracking adds the same amount between letters. Kerning may also reposition particular glyph pairs. These specimens expose two operations; they do not identify a universally correct gap or measure reading performance.</p><p>Inter is served locally under the SIL Open Font License 1.1.</p></footer>
  </main>;
}
