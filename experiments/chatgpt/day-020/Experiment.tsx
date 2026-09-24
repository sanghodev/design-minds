"use client";

import { useReducer } from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown, RotateCcw } from "lucide-react";
import { BAR_THICKNESS, CAP_HEIGHT, CAP_TOP, crossbarCenter, INITIAL, MAX_HEIGHT, MIN_HEIGHT, studyReducer, type Letter } from "./model";
import s from "./experiment.module.css";

function Specimen({ letter, height, guides, reference }: { letter: Letter; height: number; guides: boolean; reference: boolean }) {
  const center = crossbarCenter(height);
  return <figure className={s.specimen} data-specimen={reference ? "reference" : "adjustable"}>
    <figcaption><span>{reference ? "Fixed reference" : "Your setting"}</span><span>{height}% from top</span></figcaption>
    <svg viewBox="0 0 320 420" role="img" aria-label={`${reference ? "Reference" : "Adjustable"} geometric ${letter}. Crossbar center ${height} percent down the cap height.`}>
      <g className={s.ink}>
        <rect x="70" y={CAP_TOP} width="36" height={CAP_HEIGHT} />
        {letter === "H" ? <rect x="214" y={CAP_TOP} width="36" height={CAP_HEIGHT} /> : <>
          <rect x="106" y={CAP_TOP} width="144" height={BAR_THICKNESS} />
          <rect x="106" y={CAP_TOP + CAP_HEIGHT - BAR_THICKNESS} width="144" height={BAR_THICKNESS} />
        </>}
        <rect data-crossbar="true" x="106" y={center - BAR_THICKNESS / 2} width={letter === "H" ? 108 : 112} height={BAR_THICKNESS} />
      </g>
      {guides && <g className={s.guide} aria-hidden="true">
        <rect x="70" y={CAP_TOP} width="180" height={CAP_HEIGHT} strokeDasharray="4 5" />
        <path d="M35 210 H285" strokeDasharray="3 4" />
        <path d={`M35 ${center} H62 M258 ${center} H285`} />
        <circle cx="285" cy={center} r="4" />
      </g>}
    </svg>
  </figure>;
}

export default function MiddleExperiment() {
  const [state, dispatch] = useReducer(studyReducer, INITIAL);
  const adjustable = <Specimen key="adjustable" letter={state.letter} height={state.height} guides={state.guides} reference={false} />;
  const reference = <Specimen key="reference" letter={state.letter} height={50} guides={state.guides} reference />;
  return <main className={s.page} lang="en">
    <nav className={s.nav} aria-label="Experiment navigation"><Link href="/">Design Minds</Link><span>ChatGPT / Day 020</span><Link href="/research/chatgpt/day-020">Research notebook (Korean)</Link></nav>
    <header className={s.heading}>
      <h1>Where is<br /><em>the middle?</em></h1>
      <div className={s.question}><p>Set the crossbar where the letter feels balanced.</p><fieldset className={s.letters}><legend>Letter specimen</legend>{(["H", "E"] as const).map(letter => <label key={letter}><input type="radio" name="letter" checked={state.letter === letter} onChange={() => dispatch({ type: "letter", value: letter })} /><span>{letter}</span></label>)}</fieldset></div>
    </header>
    <section className={s.pair} aria-label="Equal-size crossbar comparison">{state.swapped ? [adjustable, reference] : [reference, adjustable]}</section>
    <section className={s.controls} aria-label="Crossbar controls">
      <div className={s.heightControl}>
        <label htmlFor="crossbar-height">Crossbar center <output htmlFor="crossbar-height">{state.height}%</output></label>
        <div className={s.sliderRow}>
          <button type="button" title="Raise crossbar by one percentage point" aria-label="Raise crossbar by one percentage point" disabled={state.height === MIN_HEIGHT} onClick={() => dispatch({ type: "height", value: state.height - 1 })}><ArrowUp aria-hidden="true" size={20} /></button>
          <input id="crossbar-height" type="range" min={MIN_HEIGHT} max={MAX_HEIGHT} step="1" value={state.height} aria-valuetext={`${state.height} percent from the top of the letter`} aria-describedby="coordinate-note" onChange={e => dispatch({ type: "height", value: Number(e.target.value) })} />
          <button type="button" title="Lower crossbar by one percentage point" aria-label="Lower crossbar by one percentage point" disabled={state.height === MAX_HEIGHT} onClick={() => dispatch({ type: "height", value: state.height + 1 })}><ArrowDown aria-hidden="true" size={20} /></button>
        </div>
      </div>
      <div className={s.actions}>
        <label className={s.guideToggle}><input type="checkbox" checked={state.guides} onChange={() => dispatch({ type: "guides" })} />Construction lines</label>
        <button type="button" aria-pressed={state.swapped} onClick={() => dispatch({ type: "swap" })}>Swap sides</button>
        <button type="button" onClick={() => dispatch({ type: "height", value: 50 })}>Set to 50%</button>
        <button type="button" onClick={() => dispatch({ type: "reset" })}><RotateCcw aria-hidden="true" size={17} />Reset</button>
      </div>
    </section>
    <div className={s.notes}>
      <p id="coordinate-note">Measured from the top of the fixed cap height. The reference stays at 50%. Construction lines mark geometry, not a correct visual answer.</p>
      <p className={s.status} role="status" aria-live="polite" aria-atomic="true">{state.letter} / Your setting {state.height}% / {state.guides ? "Construction lines visible" : "Construction lines hidden"} / Reference on the {state.swapped ? "right" : "left"}.</p>
    </div>
    <footer className={s.footer}><p>These are drawn letter skeletons, not a typeface. A preferred position is not proof of better reading. Starting at 50% and showing a reference can influence your judgment. Reset restores the page, not your first impression.</p></footer>
  </main>;
}
