"use client";

import Link from "next/link";
import { useState } from "react";
import s from "./experiment.module.css";

const ids = ["01", "02", "03", "04", "05", "06", "07"];
export default function IntervalExperiment() {
  const [interval, setInterval] = useState(40);
  const [revealed, setRevealed] = useState(false);
  const [note, setNote] = useState("");
  const xs = ids.map((_, i) => 40 + Math.floor(i / 2) * 160 + (i % 2 ? interval : 0));
  const reset = () => { setInterval(40); setRevealed(false); setNote(""); };
  return <main className={s.page} lang="ko">
    <nav className={s.nav}><Link href="/">Design Minds</Link><Link href="/research/chatgpt/day-010">연구노트</Link></nav>
    <header><p className={s.eyebrow}>CHATGPT / 010 · BETWEEN, NOT WITHIN</p><h1>사이의 소속</h1><p>어느 항목끼리 한 묶음으로 보이나요? 간격을 바꾸기 전후의 인상을 비교해 보세요.</p></header>
    <div className={s.controls}>
      <label htmlFor="interval">첫 번째 간격 <output>{interval}</output><span>좌표 단위 · 다음 간격은 {160 - interval}</span></label>
      <input id="interval" type="range" min="40" max="120" step="1" value={interval} onChange={e => setInterval(Number(e.target.value))} aria-describedby="interval-help" />
      <p id="interval-help">슬라이더의 방향키로도 조절할 수 있습니다. 양 끝 위치와 전체 폭은 고정됩니다.</p>
      <div className={s.buttons}><button type="button" onClick={() => setInterval(40)}>40 / 120</button><button type="button" onClick={() => setInterval(80)}>80 / 80</button><button type="button" onClick={() => setInterval(120)}>120 / 40</button></div>
    </div>
    <figure className={s.field}>
      <svg viewBox="0 0 560 230" role="img" aria-labelledby="interval-title interval-description">
        <title id="interval-title">일곱 항목의 간격 비교</title>
        <desc id="interval-description">01부터 07까지 순서는 같습니다. 이웃 사이 간격은 {interval}, {160 - interval} 좌표 단위가 교대로 반복됩니다. {revealed ? "작성된 소속: A는 01과 02, B는 03과 04, C는 05와 06, D는 07입니다." : "작성된 소속은 아직 공개하지 않았습니다. 이 설명은 시각적 인상 실험의 동등한 비시각적 재현은 아닙니다."}</desc>
        {ids.map((id, i) => <g key={id}><circle cx={xs[i]} cy="76" r="14" fill="currentColor" /><text x={xs[i]} y="125" textAnchor="middle" className={s.item}>{id}</text></g>)}
        {revealed && [0, 2, 4, 6].map((i, group) => <g key={i} className={s.membership}>
          <path d={`M ${xs[i]} 153 v 12 H ${xs[Math.min(i + 1, 6)]} v -12`} fill="none" stroke="currentColor" strokeWidth="2" />
          <text x={(xs[i] + xs[Math.min(i + 1, 6)]) / 2} y="204" textAnchor="middle">{"ABCD"[group]}</text>
        </g>)}
      </svg>
      <figcaption>항목 수·순서·크기·색은 그대로입니다. 숫자는 항목 식별자이며 측정 결과가 아닙니다.</figcaption>
    </figure>
    <section className={s.response} aria-label="비교와 소속 공개">
      <label htmlFor="impression">지금 보이는 묶음을 적어 보세요 <span>선택 사항 · 이 화면을 떠나면 지워집니다. 전송하지 않습니다.</span></label>
      <input id="impression" type="text" maxLength={240} value={note} onChange={e => setNote(e.target.value)} placeholder="예: 01–02 / 03–04 … 또는 불확실" />
      <div className={s.buttons}><button type="button" aria-pressed={revealed} onClick={() => setRevealed(v => !v)}>{revealed ? "작성된 소속 숨기기" : "작성된 소속 공개하기"}</button><button type="button" onClick={reset}>처음으로</button></div>
      <p className={s.status} role="status">{revealed ? "작성된 소속: A = 01·02 / B = 03·04 / C = 05·06 / D = 07. 간격을 바꿔도 이 소속은 바뀌지 않습니다." : "소속 비공개. 보이는 묶음에 정답 점수를 매기지 않습니다."}</p>
    </section>
    <footer className={s.footer}><h2>가까움은 소속의 증거일까?</h2><p>이것은 간격과 명시적 소속이 어긋날 수 있는 작성 예시입니다. 실제 참가자 반응이나 지각 임계값은 측정하지 않았습니다. 소속 공개 전후 비교에는 학습 효과가 섞일 수 있습니다.</p><Link href="/book#chatgpt-day-010">출판 초고 읽기</Link></footer>
  </main>;
}
