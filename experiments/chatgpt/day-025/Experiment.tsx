"use client";

import { useReducer } from "react";
import Link from "next/link";
import { ArrowLeftRight, FlipHorizontal2, RotateCcw } from "lucide-react";
import { FRAME_SIZE, frameStyle, INITIAL, MAX_SHIFT, relationLabel, SQUARE_SIZE, studyReducer } from "./model";
import s from "./experiment.module.css";

function Specimen({ adjustable, state }: { adjustable: boolean; state: typeof INITIAL }) {
  const relation = adjustable ? relationLabel(state.shift) : "equal space on every side";
  const frameDirection = state.side === "right" ? "right" : "left";
  return <figure className={adjustable ? s.adjustable : s.reference}>
    <div
      className={s.field}
      role="img"
      aria-label={adjustable
        ? `Adjustable condition. The square remains centered. The same-size frame is shifted ${state.shift} percent of the field width to the ${frameDirection}; ${relation}.`
        : "Reference condition. A coral square is centered inside an equally centered fixed frame, with equal space on every side."}
    >
      <span className={s.axisHorizontal} aria-hidden="true" />
      <span className={s.axisVertical} aria-hidden="true" />
      <span
        className={s.innerFrame}
        data-frame={adjustable ? "adjustable" : "reference"}
        style={adjustable ? frameStyle(state) : undefined}
        aria-hidden="true"
      />
      <span className={s.square} data-square={adjustable ? "adjustable" : "reference"} aria-hidden="true" />
    </div>
    <figcaption>
      <strong>{adjustable ? "Moving frame" : "Fixed reference"}</strong>
      <span>{adjustable ? `${state.shift}% ${frameDirection} · ${relation}` : "0% shift · equal margins"}</span>
    </figcaption>
  </figure>;
}

export default function MovingFrameExperiment() {
  const [state, dispatch] = useReducer(studyReducer, INITIAL);
  const relation = relationLabel(state.shift);
  const specimens = [
    <Specimen key="reference" adjustable={false} state={state} />,
    <Specimen key="adjustable" adjustable state={state} />,
  ];

  return <main className={s.page} lang="en">
    <nav className={s.nav} aria-label="Experiment navigation">
      <Link href="/">Design Minds</Link>
      <span>ChatGPT / Day 025</span>
      <Link href="/research/chatgpt/day-025">Research notebook (Korean)</Link>
    </nav>

    <header className={s.intro}>
      <p className={s.kicker}>FRAME / RELATION</p>
      <h1>Can a frame move a <em>still square?</em></h1>
      <p>The square stays centered. Move only its surrounding frame until one edge meets it.</p>
    </header>

    <section className={s.comparison} aria-label="Fixed-square moving-frame comparison">
      {state.swappedPanels ? [specimens[1], specimens[0]] : specimens}
    </section>

    <section className={s.controls} aria-label="Frame relationship controls">
      <div className={s.shiftControl}>
        <label htmlFor="frame-shift">Frame shift <output htmlFor="frame-shift">{state.shift}%</output></label>
        <input
          id="frame-shift"
          type="range"
          min="0"
          max={MAX_SHIFT}
          step="1"
          value={state.shift}
          aria-valuetext={relation}
          onChange={event => dispatch({ type: "shift", value: Number(event.target.value) })}
        />
        <div className={s.rangeLabels} aria-hidden="true"><span>centered frame</span><span>edge contact</span></div>
      </div>

      <div className={s.presets} aria-label="Frame shift presets">
        <button type="button" aria-pressed={state.shift === 0} onClick={() => dispatch({ type: "shift", value: 0 })}>Center</button>
        <button type="button" aria-pressed={state.shift === 8} onClick={() => dispatch({ type: "shift", value: 8 })}>Halfway</button>
        <button type="button" aria-pressed={state.shift === MAX_SHIFT} onClick={() => dispatch({ type: "shift", value: MAX_SHIFT })}>Touch</button>
      </div>

      <div className={s.actions}>
        <button type="button" aria-pressed={state.side === "left"} onClick={() => dispatch({ type: "mirror" })}><FlipHorizontal2 aria-hidden="true" size={18} />Mirror direction</button>
        <button type="button" aria-pressed={state.swappedPanels} onClick={() => dispatch({ type: "swap-panels" })}><ArrowLeftRight aria-hidden="true" size={18} />Swap panels</button>
        <button type="button" onClick={() => dispatch({ type: "reset" })}><RotateCcw aria-hidden="true" size={17} />Reset</button>
      </div>
    </section>

    <p className={s.status} role="status" aria-live="polite" aria-atomic="true">
      The square is fixed at center. The adjustable frame moves {state.side}: {relation}. Panels {state.swappedPanels ? "swapped" : "in the initial order"}.
    </p>

    <footer className={s.footer}>
      <p>Both squares are {SQUARE_SIZE}% × {SQUARE_SIZE}%. Both inner frames are {FRAME_SIZE}% × {FRAME_SIZE}%. Only one frame changes horizontal position.</p>
      <p>Touch is a geometric endpoint, not a perceptual threshold. No response is stored.</p>
    </footer>
  </main>;
}
