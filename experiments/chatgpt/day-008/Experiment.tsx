"use client";

import { useState } from "react";
import Link from "next/link";
import s from "./experiment.module.css";

const pairs = [
  { name: "밝음과 어둠", a: "#202b42", b: "#f0dec0" },
  { name: "차가움과 따뜻함", a: "#205d65", b: "#b64d32" },
  { name: "보라와 올리브", a: "#594573", b: "#767432" },
];
const sample = "#bfa48b";

export default function ColorContextExperiment() {
  const [pair, setPair] = useState(0);
  const [isolated, setIsolated] = useState(false);
  const [swapped, setSwapped] = useState(false);
  const [joined, setJoined] = useState(false);
  const colors = swapped ? [pairs[pair].b, pairs[pair].a] : [pairs[pair].a, pairs[pair].b];
  const reset = () => { setPair(0); setIsolated(false); setSwapped(false); setJoined(false); };
  return <main className={s.page} lang="ko">
    <nav className={s.nav}><Link href="/">← Design Minds</Link><Link href="/research/chatgpt/day-008">연구노트 ↗</Link></nav>
    <header className={s.heading}><h1>A Color Is<br /><em>Never Alone.</em></h1><p>중앙의 두 색은 같습니다.<br />주변을 바꾸면, 여전히 같아 보이나요?</p></header>
    <div className={s.controls} aria-label="색 비교 조작">
      <label>배경 조합 <select value={pair} onChange={e => setPair(Number(e.target.value))}>{pairs.map((p,i) => <option key={p.name} value={i}>{p.name}</option>)}</select></label>
      <button type="button" aria-pressed={swapped} onClick={() => setSwapped(v => !v)}>배경 맞바꾸기</button>
      <button type="button" aria-pressed={isolated} onClick={() => setIsolated(v => !v)}>배경 통일하기</button>
      <button type="button" aria-pressed={joined} onClick={() => setJoined(v => !v)}>두 색 이어 보기</button>
      <button type="button" onClick={reset}>처음으로</button>
    </div>
    <figure className={s.figure}>
      <div className={s.field} role="img" aria-label={`왼쪽과 오른쪽 표본은 모두 ${sample}. ${isolated ? "두 배경은 동일한 중간 회색입니다." : `배경은 왼쪽 ${colors[0]}, 오른쪽 ${colors[1]}입니다.`} ${joined ? "같은 색의 띠로 두 표본을 연결했습니다." : "두 표본은 떨어져 있습니다."}`}>
        {colors.map((color,i) => <div key={i} className={s.half} style={{backgroundColor: isolated ? "#888888" : color}} aria-hidden="true"><span className={s.sample} style={{backgroundColor: sample}} /></div>)}
        {joined && <span aria-hidden="true" className={s.bridge} style={{backgroundColor: sample}} />}
      </div>
      <figcaption><span>같은 표본 · <code>{sample}</code></span><span>같은 크기 · 다른 주변</span></figcaption>
    </figure>
    <p className={s.status} role="status">{pairs[pair].name} · {swapped ? "배경을 맞바꾼 상태" : "기본 배치"} · {isolated ? "회색 배경으로 통일" : "서로 다른 배경"} · {joined ? "연결 띠 표시" : "표본 분리"}</p>
    <footer className={s.footer}><p>먼저 눈으로 비교하고, 배경을 통일해 보세요. 연결 띠는 두 표본의 같은 값을 드러내는 보조 도구입니다. 띠 자체도 주변을 바꾸므로 독립된 검증은 아닙니다.</p><p>화면·조명·색 지각에 따라 인상은 달라집니다. 차이를 느끼지 않아도 실패가 아닙니다. 이 작품은 시력 검사나 사용자 연구 결과가 아닙니다.</p></footer>
  </main>;
}
