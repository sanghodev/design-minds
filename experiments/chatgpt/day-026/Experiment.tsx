"use client";

import type { CSSProperties } from "react";
import { useReducer } from "react";
import Link from "next/link";
import { ArrowLeftRight, RotateCcw, Ruler } from "lucide-react";
import s from "./experiment.module.css";
import { frameInset, frameSize, INITIAL, MAX_GAP, relationLabel, studyReducer } from "./model";

type SpecimenProps = {
  gap: number;
  label: string;
  live?: boolean;
  showConstruction: boolean;
};

function Specimen({ gap, label, live = false, showConstruction }: SpecimenProps) {
  const style = { "--frame-inset": `${frameInset(gap)}%` } as CSSProperties;
  return <figure className={`${s.specimen} ${live ? s.live : ""}`} data-gap={gap}>
    <div
      className={s.field}
      style={style}
      role="img"
      aria-label={`${label}. A fixed blue square occupies 30 percent of the field. An orange frame is ${frameSize(gap)} percent wide, leaving ${gap} percent symmetric space on each side${gap === 0 ? ", so its edges coincide with the square" : ""}.`}
    >
      <span className={s.square} data-square="fixed" />
      <span className={s.frame} data-frame="symmetric" />
      {showConstruction && <>
        <span className={s.axisX} aria-hidden="true" />
        <span className={s.axisY} aria-hidden="true" />
        <span className={s.measure} aria-hidden="true">{gap}%</span>
      </>}
    </div>
    <figcaption><strong>{label}</strong><span>{showConstruction ? `${gap}% gap · ${frameSize(gap)}% frame` : gap === 0 ? "Edges coincide" : "Edges apart"}</span></figcaption>
  </figure>;
}

export default function Day026Experiment() {
  const [state, dispatch] = useReducer(studyReducer, INITIAL);
  const anchors = [
    <Specimen key="open" gap={MAX_GAP} label="Open endpoint" showConstruction={state.showConstruction} />,
    <Specimen key="closed" gap={0} label="Coincident endpoint" showConstruction={state.showConstruction} />,
  ];
  if (state.reversedAnchors) anchors.reverse();

  return <main className={s.page} lang="en">
    <nav className={s.nav} aria-label="Experiment navigation">
      <Link href="/">← Archive</Link>
      <span>CHATGPT · DAY 026</span>
      <Link href="/research/chatgpt/day-026">Research note →</Link>
    </nav>

    <header className={s.intro}>
      <p className={s.kicker}>Boundary study</p>
      <h1>When does a frame become an <em>outline?</em></h1>
      <p>Three identical squares keep the same size and center. Only the middle frame changes its symmetric distance.</p>
    </header>

    <section className={s.comparison} aria-label="Three square and frame specimens">
      {anchors[0]}
      <Specimen gap={state.gap} label="Adjustable" live showConstruction={state.showConstruction} />
      {anchors[1]}
    </section>

    <section className={s.controls} aria-label="Frame controls">
      <div className={s.gapControl}>
        <label htmlFor="boundary-gap"><span>Boundary gap</span><output htmlFor="boundary-gap">{state.gap}%</output></label>
        <input id="boundary-gap" type="range" min="0" max={MAX_GAP} step="1" value={state.gap} onChange={(event) => dispatch({ type: "gap", value: Number(event.currentTarget.value) })} />
        <div className={s.rangeLabels} aria-hidden="true"><span>Coincident</span><span>Open</span></div>
      </div>

      <div className={s.presets} aria-label="Construction presets">
        {[18, 4, 0].map((gap) => <button key={gap} type="button" aria-pressed={state.gap === gap} onClick={() => dispatch({ type: "gap", value: gap })}>{gap === 18 ? "Open" : gap === 4 ? "Near" : "Coincide"}</button>)}
      </div>

      <div className={s.actions}>
        <button type="button" aria-pressed={state.reversedAnchors} onClick={() => dispatch({ type: "reverse-anchors" })}><ArrowLeftRight aria-hidden="true" size={18} />Reverse anchors</button>
        <button type="button" aria-pressed={state.showConstruction} onClick={() => dispatch({ type: "toggle-construction" })}><Ruler aria-hidden="true" size={18} />Show construction</button>
        <button type="button" onClick={() => dispatch({ type: "reset" })}><RotateCcw aria-hidden="true" size={17} />Reset</button>
      </div>
    </section>

    <p className={s.status} role="status" aria-live="polite" aria-atomic="true">
      Adjustable specimen: {relationLabel(state.gap)}. Anchor order {state.reversedAnchors ? "reversed" : "initial"}. Construction {state.showConstruction ? "shown" : "hidden"}.
    </p>

    <footer className={s.footer}>
      <p>Every blue square stays at 30% × 30% and at the exact center. The frame contracts equally from all four sides.</p>
      <p>Coincidence is a geometric state, not evidence that anyone sees the frame as the square’s outline. No response is stored.</p>
    </footer>
  </main>;
}
