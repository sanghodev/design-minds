"use client";

import { useReducer } from "react";
import Link from "next/link";
import { ArrowLeftRight, Minus, MoveHorizontal, Plus, RotateCcw } from "lucide-react";
import { colorsFor, INITIAL, MAX_SHARE, MIN_SHARE, squareSidePercent, studyReducer } from "./model";
import s from "./experiment.module.css";

export default function EdgeFigureExperiment() {
  const [state, dispatch] = useReducer(studyReducer, INITIAL);
  const colors = colorsFor(state);
  const side = squareSidePercent(state.share);
  const stripStyle = {
    width: `${state.share}%`,
    backgroundColor: colors.region.value,
    insetInlineStart: state.stripSide === "left" ? 0 : "auto",
    insetInlineEnd: state.stripSide === "right" ? 0 : "auto",
  };
  const squareStyle = { width: `${side}%`, height: `${side}%`, backgroundColor: colors.region.value };

  return <main className={s.page} lang="en">
    <nav className={s.nav} aria-label="Experiment navigation">
      <Link href="/">Design Minds</Link>
      <span>ChatGPT / Day 023</span>
      <Link href="/research/chatgpt/day-023">Research notebook (Korean)</Link>
    </nav>

    <header className={s.intro}>
      <p className={s.kicker}>FIGURE / GROUND</p>
      <h1>Does an edge make the <em>figure?</em></h1>
      <p>Two colors. Two equal fields. The highlighted region occupies exactly the same area in both—only its boundary changes.</p>
    </header>

    <section className={s.comparison} aria-label="Equal-area boundary comparison">
      <figure>
        <div
          className={s.field}
          role="img"
          aria-label={`Edge-attached construction. ${colors.region.name} occupies ${state.share} percent as a full-height strip attached to the ${state.stripSide} edge. ${colors.ground.name} occupies the remainder.`}
          style={{ backgroundColor: colors.ground.value }}
        >
          <span className={s.strip} data-region="a" style={stripStyle} />
          <span className={s.frame} aria-hidden="true" />
        </div>
        <figcaption><strong>Edge-attached</strong><span>full-height strip · {state.share}%</span></figcaption>
      </figure>

      <figure>
        <div
          className={s.field}
          role="img"
          aria-label={`Enclosed construction. ${colors.region.name} occupies ${state.share} percent as a centered square surrounded by ${colors.ground.name}.`}
          style={{ backgroundColor: colors.ground.value }}
        >
          <span className={s.enclosed} data-region="a" style={squareStyle} />
          <span className={s.frame} aria-hidden="true" />
        </div>
        <figcaption><strong>Enclosed</strong><span>centered square · {state.share}%</span></figcaption>
      </figure>
    </section>

    <section className={s.controls} aria-label="Boundary comparison controls">
      <div className={s.shareControl}>
        <label htmlFor="share">Highlighted area <output htmlFor="share">{state.share}%</output></label>
        <div>
          <button type="button" aria-label="Decrease highlighted area by one percent" disabled={state.share === MIN_SHARE} onClick={() => dispatch({ type: "share", value: state.share - 1 })}><Minus aria-hidden="true" size={20} /></button>
          <input id="share" type="range" min={MIN_SHARE} max={MAX_SHARE} step="1" value={state.share} aria-valuetext={`${state.share} percent in both constructions`} onChange={event => dispatch({ type: "share", value: Number(event.target.value) })} />
          <button type="button" aria-label="Increase highlighted area by one percent" disabled={state.share === MAX_SHARE} onClick={() => dispatch({ type: "share", value: state.share + 1 })}><Plus aria-hidden="true" size={20} /></button>
        </div>
      </div>

      <div className={s.legend} aria-label="Current colors">
        <span><i style={{ backgroundColor: colors.region.value }} aria-hidden="true" />Highlighted: {colors.region.name}</span>
        <span><i style={{ backgroundColor: colors.ground.value }} aria-hidden="true" />Field: {colors.ground.name}</span>
      </div>

      <div className={s.actions}>
        <button type="button" aria-pressed={state.stripSide === "right"} onClick={() => dispatch({ type: "move-strip" })}><MoveHorizontal aria-hidden="true" size={18} />Move strip</button>
        <button type="button" aria-pressed={state.swappedColors} onClick={() => dispatch({ type: "swap-colors" })}><ArrowLeftRight aria-hidden="true" size={18} />Swap colors</button>
        <button type="button" onClick={() => dispatch({ type: "reset" })}><RotateCcw aria-hidden="true" size={17} />Reset</button>
      </div>
    </section>

    <p className={s.status} role="status" aria-live="polite" aria-atomic="true">
      {colors.region.name} occupies {state.share} percent in both fields. The strip is attached to the {state.stripSide} edge. Colors {state.swappedColors ? "swapped" : "in the initial order"}.
    </p>

    <footer className={s.footer}>
      <p>Equal area is implemented geometry, not evidence that the two regions look equally figural. Closure, compactness, perimeter and position change together.</p>
      <p>Color names, area and position are repeated in text. No response is stored.</p>
    </footer>
  </main>;
}
