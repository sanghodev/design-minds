"use client";

import { useReducer } from "react";
import Link from "next/link";
import { ArrowLeftRight, FlipHorizontal2, RotateCcw } from "lucide-react";
import { colorsFor, contactLabel, INITIAL, MAX_GAP, MIN_GAP, positionFor, SQUARE_SIZE, studyReducer } from "./model";
import s from "./experiment.module.css";

export default function MarginFigureExperiment() {
  const [state, dispatch] = useReducer(studyReducer, INITIAL);
  const colors = colorsFor(state);
  const movingStyle = {
    width: `${SQUARE_SIZE}%`,
    height: `${SQUARE_SIZE}%`,
    backgroundColor: colors.square.value,
    ...positionFor(state),
  };
  const fixedStyle = { width: `${SQUARE_SIZE}%`, height: `${SQUARE_SIZE}%`, backgroundColor: colors.square.value };
  const condition = contactLabel(state.gap);

  return <main className={s.page} lang="en">
    <nav className={s.nav} aria-label="Experiment navigation">
      <Link href="/">Design Minds</Link>
      <span>ChatGPT / Day 024</span>
      <Link href="/research/chatgpt/day-024">Research notebook (Korean)</Link>
    </nav>

    <header className={s.intro}>
      <p className={s.kicker}>MARGIN / FIGURE</p>
      <h1>How much space makes a <em>figure?</em></h1>
      <p>The square never changes. Move it away from the frame, then compare it with the centered reference.</p>
    </header>

    <section className={s.comparison} aria-label="Equal-square margin comparison">
      <figure>
        <div
          className={s.field}
          role="img"
          aria-label={`Centered reference. A ${colors.square.name} square, ${SQUARE_SIZE} percent of the field width and height, is centered inside a ${colors.field.name} field.`}
          style={{ backgroundColor: colors.field.value }}
        >
          <span className={s.referenceSquare} data-square="reference" style={fixedStyle} />
          <span className={s.centerMark} aria-hidden="true" />
        </div>
        <figcaption><strong>Centered reference</strong><span>33% margin · fixed</span></figcaption>
      </figure>

      <figure>
        <div
          className={s.field}
          role="img"
          aria-label={`Adjustable condition. The same ${colors.square.name} square is ${condition}, measured from the ${state.anchorSide} edge, inside a ${colors.field.name} field.`}
          style={{ backgroundColor: colors.field.value }}
        >
          <span className={s.movingSquare} data-square="adjustable" style={movingStyle} />
          <span className={s.centerMark} aria-hidden="true" />
        </div>
        <figcaption><strong>Adjustable margin</strong><span>{state.gap}% from {state.anchorSide} · {condition}</span></figcaption>
      </figure>
    </section>

    <section className={s.controls} aria-label="Margin comparison controls">
      <div className={s.gapControl}>
        <label htmlFor="gap">Space from frame <output htmlFor="gap">{state.gap}%</output></label>
        <input
          id="gap"
          type="range"
          min={MIN_GAP}
          max={MAX_GAP}
          step="1"
          value={state.gap}
          aria-valuetext={condition}
          onChange={event => dispatch({ type: "gap", value: Number(event.target.value) })}
        />
        <div className={s.rangeLabels} aria-hidden="true"><span>touching</span><span>centered</span></div>
      </div>

      <div className={s.presets} aria-label="Margin presets">
        <button type="button" aria-pressed={state.gap === 0} onClick={() => dispatch({ type: "gap", value: 0 })}>Touch</button>
        <button type="button" aria-pressed={state.gap === 16} onClick={() => dispatch({ type: "gap", value: 16 })}>Separate</button>
        <button type="button" aria-pressed={state.gap === MAX_GAP} onClick={() => dispatch({ type: "gap", value: MAX_GAP })}>Center</button>
      </div>

      <div className={s.actions}>
        <button type="button" aria-pressed={state.anchorSide === "right"} onClick={() => dispatch({ type: "mirror" })}><FlipHorizontal2 aria-hidden="true" size={18} />Mirror side</button>
        <button type="button" aria-pressed={state.swappedColors} onClick={() => dispatch({ type: "swap-colors" })}><ArrowLeftRight aria-hidden="true" size={18} />Swap colors</button>
        <button type="button" onClick={() => dispatch({ type: "reset" })}><RotateCcw aria-hidden="true" size={17} />Reset</button>
      </div>
    </section>

    <p className={s.status} role="status" aria-live="polite" aria-atomic="true">
      Adjustable square: {condition}, from the {state.anchorSide}. Geometry is unchanged; colors {state.swappedColors ? "swapped" : "in the initial order"}.
    </p>

    <footer className={s.footer}>
      <p>Both squares are 34% × 34% with the same color, perimeter and orientation. The interface verifies geometry, not what a viewer perceives.</p>
      <p>Moving the square changes edge contact and position together. No response is stored.</p>
    </footer>
  </main>;
}
