"use client";
import { useState } from "react";
import Link from "next/link";
import s from "./experiment.module.css";

const sentence = "문장을 좁히면 생각도 좁아질까. 줄은 바뀌어도 말은 사라지지 않는다.";

export default function LinebreakExperiment() {
  const [measure, setMeasure] = useState(11);
  const [balance, setBalance] = useState(false);
  const reset = () => { setMeasure(11); setBalance(false); };
  const sample = (mode: "word" | "character") => (
    <article className={s.sample} aria-label={mode === "word" ? "Word-based line breaks" : "Character-based line breaks"}>
      <p className={s.sampleLabel}>{mode === "word" ? "WORD-BASED" : "CHARACTER-BASED"}</p>
      <p className={s.specimen} lang="ko" style={{width:`${measure}em`,wordBreak:mode === "word" ? "keep-all" : "normal",textWrap:balance ? "balance" : "wrap"}}>{sentence}</p>
    </article>
  );
  return <main className={s.page} lang="en">
    <nav className={s.nav}><Link href="/">← Design Minds</Link><Link href="/research/chatgpt/day-009">Research notebook (Korean) ↗</Link></nav>
    <header className={s.header}><h1>Where a Line Lets Go</h1><p>Hangul line-breaking study</p></header>
    <section className={s.workspace} aria-label="Hangul line-break comparison">
      <aside className={s.console}>
        <p className={s.prompt}>Same sentence.<br />Two break rules.</p>
        <label className={s.rangeLabel} htmlFor="line-measure">Requested measure <output htmlFor="line-measure">{measure} em</output></label>
        <input id="line-measure" type="range" min="6" max="16" step="0.5" value={measure} onChange={e => setMeasure(Number(e.target.value))} aria-describedby="measure-note" />
        <p id="measure-note" className={s.hint}>The requested measure is capped by the available viewport width. Compare both samples at the same setting.</p>
        <label className={s.balance}><input type="checkbox" checked={balance} onChange={e => setBalance(e.target.checked)} /> Request balanced wrapping</label>
        <p className={s.hint}>Balance is browser-dependent and does not understand Korean meaning. It is a secondary condition, not evidence of readability.</p>
        <button type="button" onClick={reset}>Reset conditions</button>
      </aside>
      <div className={s.stage}>
        <div className={s.topline}><span>One sentence · one requested measure</span><span aria-hidden="true">↔</span></div>
        <div className={s.pair}>{sample("word")}{sample("character")}</div>
        <p className={s.stageNote}>The Korean sentence is identical in both samples. Inspect line endings and unused space; do not treat a tidier silhouette as proof of easier reading.</p>
      </div>
    </section>
    <p role="status" className={s.status}>Requested measure {measure} em · paired word/character comparison · {balance ? "balance requested" : "normal wrapping"}</p>
    <footer className={s.footer}><p>Change only the measure first. Then, if useful, request balanced wrapping as a separate secondary condition. The paired view keeps the line-break rule visible without relying on memory between toggles.</p><p>Hangul can be broken on character or word boundaries. This page does not establish a universally preferable rule. Typeface, browser, viewport, language proficiency and sentence structure can change the result.</p></footer>
  </main>;
}
