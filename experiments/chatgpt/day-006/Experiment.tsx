"use client";
import { useState } from "react";
import Link from "next/link";
import s from "./experiment.module.css";
const values = [48, 49, 48, 51, 50, 52];
export default function ScaleExperiment() {
  const [floor, setFloor] = useState(0);
  const [compare, setCompare] = useState(false);
  const ceiling = 55;
  const plot = (baseline: number, name: string) => {
    const y = (v: number) => 260 - (v - baseline) / (ceiling - baseline) * 230;
    return <svg viewBox="0 0 620 310" fill="currentColor" role="img" aria-label={`${name}. Vertical range ${baseline} to 55. Values 48, 49, 48, 51, 50, 52. Net change 4 units.`}>
      {[baseline, (baseline + ceiling) / 2, ceiling].map(t => <g key={t}><line x1="48" x2="590" y1={y(t)} y2={y(t)} stroke="currentColor" opacity=".25"/><text x="38" y={y(t) + 5} textAnchor="end">{Number(t.toFixed(1))}</text></g>)}
      <polyline fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" points={values.map((v,i)=>`${60+i*104},${y(v)}`).join(" ")}/>
      {values.map((v,i)=><g key={i}><circle cx={60+i*104} cy={y(v)} r="5" fill="currentColor"/><text x={60+i*104} y={y(v)-14} textAnchor="middle">{v}</text><text x={60+i*104} y="292" textAnchor="middle">{String.fromCharCode(65+i)}</text></g>)}
    </svg>;
  };
  return <main className={s.page}>
    <nav className={s.nav}><Link href="/">Design Minds</Link><Link href="/research/chatgpt/day-006">Research notes</Link></nav>
    <header className={s.heading}><h1>The Scale<br/>of a Claim</h1><p>One sequence. A changing frame.<br/><strong>Synthetic data, not measured results.</strong></p></header>
    <section className={s.instrument} aria-label="Axis range experiment">
      <div className={s.chart}><div className={s.caption}><span>ADJUSTABLE VIEW</span><span>Units · {floor}–55</span></div>{plot(floor,"Adjustable line chart")}</div>
      <div className={s.controls}><label htmlFor="axis-floor">Lower axis bound <output>{floor} units</output></label><input id="axis-floor" type="range" min="0" max="47" step="1" value={floor} onChange={e=>setFloor(Number(e.target.value))}/><div className={s.buttons}><button onClick={()=>setFloor(47)}>Inspect small changes</button><button onClick={()=>{setFloor(0);setCompare(false);}}>Reset</button></div><label className={s.check}><input type="checkbox" checked={compare} onChange={e=>setCompare(e.target.checked)}/> Show zero-based reference</label></div>
      {compare && <div className={s.reference}><div className={s.caption}><span>FIXED REFERENCE</span><span>Units · 0–55</span></div>{plot(0,"Fixed reference line chart")}</div>}
    </section>
    <p className={s.statement} role="status">The values have not changed. A to F: <strong>+4 units</strong>. The visible range is {ceiling-floor} units.</p>
    <details className={s.data}><summary>Read the data and limits</summary><table><caption>Authored teaching sequence; equally spaced steps, not dates.</caption><thead><tr><th scope="col">Step</th><th scope="col">Units</th></tr></thead><tbody>{values.map((v,i)=><tr key={i}><th scope="row">{String.fromCharCode(65+i)}</th><td>{v}</td></tr>)}</tbody></table><p>A nonzero axis is not automatically dishonest for a line chart. It can expose small differences. This work tests the visibility of the framing choice, not whether viewers are deceived. No participant study has been conducted.</p></details>
  </main>;
}
