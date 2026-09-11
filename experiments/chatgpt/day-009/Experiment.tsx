"use client";
import { useState } from "react";
import Link from "next/link";
import s from "./experiment.module.css";

const sentence = "문장을 좁히면 생각도 좁아질까. 줄은 바뀌어도 말은 사라지지 않는다.";
export default function LinebreakExperiment() {
  const [measure, setMeasure] = useState(11);
  const [word, setWord] = useState(true);
  const [balance, setBalance] = useState(false);
  const reset = () => { setMeasure(11); setWord(true); setBalance(false); };
  return <main className={s.page} lang="ko">
    <nav className={s.nav}><Link href="/">← Design Minds</Link><Link href="/research/chatgpt/day-009">연구노트 ↗</Link></nav>
    <header className={s.header}><h1>줄의 결정권</h1><p>Where a line lets go</p></header>
    <section className={s.workspace} aria-label="한글 줄 나눔 비교">
      <aside className={s.console}>
        <p className={s.prompt}>같은 문장.<br />다른 끊김.</p>
        <label className={s.rangeLabel} htmlFor="line-measure">글줄의 너비 <output htmlFor="line-measure">{measure} em</output></label>
        <input id="line-measure" type="range" min="6" max="16" step="0.5" value={measure} onChange={e => setMeasure(Number(e.target.value))} aria-describedby="measure-note" />
        <p id="measure-note" className={s.hint}>em은 이 글자의 크기에 비례하는 길이입니다. 작은 화면에서는 화면 너비가 상한입니다.</p>
        <fieldset><legend>줄 나눔 기준</legend><label><input type="radio" name="break-rule" checked={word} onChange={() => setWord(true)} /> 어절을 지키기</label><label><input type="radio" name="break-rule" checked={!word} onChange={() => setWord(false)} /> 글자 사이도 허용</label></fieldset>
        <label className={s.balance}><input type="checkbox" checked={balance} onChange={e => setBalance(e.target.checked)} /> 줄 길이 균형 요청</label>
        <p className={s.hint}>균형은 지원 브라우저에서만 적용됩니다. 낱말의 의미를 판단하는 기능은 아닙니다.</p>
        <button type="button" onClick={reset}>처음 조건으로</button>
      </aside>
      <div className={s.stage}>
        <div className={s.topline}><span>한 문장이 차지하는 자리</span><span aria-hidden="true">↔</span></div>
        <p className={s.specimen} style={{width:`${measure}em`,wordBreak:word?"keep-all":"normal",textWrap:balance?"balance":"wrap"}}>{sentence}</p>
        <p className={s.stageNote}>텍스트는 그대로입니다. 오른쪽의 빈 공간과 줄 끝의 낱말을 함께 보세요.</p>
      </div>
    </section>
    <p role="status" className={s.status}>설정 너비 {measure} em · {word?"어절 단위":"글자 단위 허용"} · {balance?"균형 요청 켜짐":"기본 줄 채우기"}</p>
    <footer className={s.footer}><p>먼저 너비를 고정하고 줄 나눔 기준만 바꿔 보세요. 그다음 너비를 바꾸세요. 두 조건을 동시에 바꾸면 무엇이 인상을 바꿨는지 구분하기 어렵습니다.</p><p>한글은 글자·어절 단위로 줄을 나눌 수 있습니다. 어절 보존이나 균등한 줄 길이가 언제나 더 읽기 좋다는 결론은 아닙니다. 서체와 브라우저에 따라 줄 끝이 달라질 수 있습니다.</p></footer>
  </main>;
}
