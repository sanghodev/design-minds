"use client";

import { useReducer } from "react";
import Link from "next/link";
import { ArrowLeftRight, Minus, Plus, RotateCcw } from "lucide-react";
import { COLOR_PAIRS, INITIAL, MAX_SHARE, MIN_SHARE, pairFor, panelOrder, studyReducer } from "./model";
import s from "./experiment.module.css";

export default function ColorAreaExperiment() {
  const [state, dispatch] = useReducer(studyReducer, INITIAL);
  const pair = pairFor(state.pair);
  const panels = panelOrder(state);

  return <main className={s.page} lang="en">
    <nav className={s.nav} aria-label="Experiment navigation">
      <Link href="/">Design Minds</Link>
      <span>ChatGPT / Day 022</span>
      <Link href="/research/chatgpt/day-022">Research notebook (Korean)</Link>
    </nav>

    <header className={s.intro}>
      <p className={s.kicker}>COLOR / QUANTITY</p>
      <h1>When does a color become the <em>background?</em></h1>
      <p>Keep two colors unchanged. Move their boundary until one feels less like a field and more like a figure.</p>
    </header>

    <figure className={s.study}>
      <div
        className={`${s.field} ${state.guide ? s.guided : ""}`}
        role="img"
        aria-label={`${pair.a.name} occupies ${state.shareA} percent. ${pair.b.name} occupies ${100 - state.shareA} percent. ${panels[0].name} is on the left.`}
        style={{ gridTemplateColumns: panels.map(panel => `${panel.share}fr`).join(" ") }}
      >
        {panels.map(panel => <div key={panel.key} className={s.color} data-color={panel.key} style={{ backgroundColor: panel.value }} />)}
        <span className={s.halfway} aria-hidden="true" />
      </div>
      <figcaption>
        <span><i style={{ backgroundColor: pair.a.value }} aria-hidden="true" />{pair.a.name} <strong>{state.shareA}%</strong></span>
        <span><i style={{ backgroundColor: pair.b.value }} aria-hidden="true" />{pair.b.name} <strong>{100 - state.shareA}%</strong></span>
      </figcaption>
    </figure>

    <section className={s.controls} aria-label="Color area controls">
      <fieldset className={s.pairs}>
        <legend>Color pair</legend>
        {COLOR_PAIRS.map(option => <label key={option.id}>
          <input type="radio" name="pair" checked={state.pair === option.id} onChange={() => dispatch({ type: "pair", value: option.id })} />
          <span>{option.label}</span>
        </label>)}
      </fieldset>

      <div className={s.shareControl}>
        <label htmlFor="share">{pair.a.name} area <output htmlFor="share">{state.shareA}%</output></label>
        <div>
          <button type="button" aria-label={`Give ${pair.a.name} one percent less area`} disabled={state.shareA === MIN_SHARE} onClick={() => dispatch({ type: "share", value: state.shareA - 1 })}><Minus aria-hidden="true" size={20} /></button>
          <input id="share" type="range" min={MIN_SHARE} max={MAX_SHARE} step="1" value={state.shareA} aria-valuetext={`${pair.a.name} ${state.shareA} percent; ${pair.b.name} ${100 - state.shareA} percent`} onChange={event => dispatch({ type: "share", value: Number(event.target.value) })} />
          <button type="button" aria-label={`Give ${pair.a.name} one percent more area`} disabled={state.shareA === MAX_SHARE} onClick={() => dispatch({ type: "share", value: state.shareA + 1 })}><Plus aria-hidden="true" size={20} /></button>
        </div>
      </div>

      <div className={s.actions}>
        <label><input type="checkbox" checked={state.guide} onChange={() => dispatch({ type: "guide" })} />Show halfway</label>
        <button type="button" aria-pressed={state.swapped} onClick={() => dispatch({ type: "swap" })}><ArrowLeftRight aria-hidden="true" size={18} />Swap sides</button>
        <button type="button" onClick={() => dispatch({ type: "reset" })}><RotateCcw aria-hidden="true" size={17} />Reset</button>
      </div>
    </section>

    <p className={s.status} role="status" aria-live="polite" aria-atomic="true">
      {pair.a.name} takes {state.shareA} percent. {pair.b.name} takes {100 - state.shareA} percent. {panels[0].name} is on the left. Halfway guide {state.guide ? "visible" : "hidden"}.
    </p>

    <footer className={s.footer}>
      <p>Area changes. Color values do not. The percentages describe the rendered split; they do not measure attention, dominance, or a universal figure–ground threshold.</p>
      <p>Names and percentages repeat the color condition in text. No response is stored.</p>
    </footer>
  </main>;
}
