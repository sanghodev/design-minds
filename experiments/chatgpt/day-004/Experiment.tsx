"use client";

import { useEffect, useReducer, useState } from "react";
import Link from "next/link";
import s from "./experiment.module.css";

type State = { ink: string; proof: string | null; history: string[]; message: string };
type Action = { type: "proof"; word: string } | { type: "commit" | "discard" | "undo" | "reset" };
const initial: State = { ink: "ROOM", proof: null, history: [], message: "단어를 고르면 교정쇄가 나타납니다. 아직 확정되지 않습니다." };
export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "proof": return { ...state, proof: action.word, message: `${action.word} 교정 중. 확정하거나 거둘 수 있습니다.` };
    case "commit": return state.proof === null ? state : { ink: state.proof, proof: null, history: [...state.history, state.ink].slice(-20), message: `${state.proof} 확정. 되돌리기는 계속 가능합니다.` };
    case "discard": return { ...state, proof: null, message: "교정쇄를 거두었습니다. 기존 인쇄는 그대로입니다." };
    case "undo": return state.history.length ? { ink: state.history.at(-1)!, proof: null, history: state.history.slice(0,-1), message: "이전 인쇄로 돌아왔습니다." } : { ...state, proof: null, message: "되돌릴 인쇄가 없습니다." };
    case "reset": return { ...initial, message: "처음 상태로 돌아왔습니다." };
  }
}

export default function RevisionExperiment() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [automatic, setAutomatic] = useState(false);
  useEffect(() => {
    if (!automatic || state.proof === null) return;
    const timer = window.setTimeout(() => dispatch({type:"commit"}), 2400);
    return () => window.clearTimeout(timer);
  }, [automatic, state.proof]);
  const reset = () => { setAutomatic(false); dispatch({type:"reset"}); };
  return <main className={s.page} lang="ko">
    <nav className={s.nav}><Link href="/">← Design Minds</Link><Link href="/research/chatgpt/day-004">연구노트 ↗</Link></nav>
    <div className={s.workspace}>
      <section className={s.controls} aria-labelledby="revision-title">
        <p className={s.eyebrow}>CHATGPT · DAY 004 / 교정과 확정</p>
        <h1 id="revision-title">A Margin for<br/>Changing Your Mind</h1>
        <p>결과가 도착하기 전에, 생각을 바꿀 자리가 있다면.</p>
        <fieldset className={s.words}><legend>가운데 단어의 교정쇄 만들기</legend>{["ROOM","TIME","SPACE","DOUBT"].map(word => <button key={word} type="button" aria-pressed={state.proof === word} onClick={() => dispatch({type:"proof",word})}>{word}</button>)}</fieldset>
        <div className={s.actions}>
          <button type="button" disabled={state.proof === null} onClick={() => dispatch({type:"commit"})}>확정하기</button>
          <button type="button" disabled={state.proof === null} onClick={() => dispatch({type:"discard"})}>교정쇄 거두기</button>
          <button type="button" disabled={!state.history.length} onClick={() => dispatch({type:"undo"})}>이전 인쇄로</button>
          <button type="button" onClick={reset}>처음으로</button>
        </div>
        <label className={s.toggle}><input type="checkbox" checked={automatic} onChange={e => setAutomatic(e.target.checked)}/>자동 확정 실험 켜기</label>
        <p className={s.note}>기본은 시간 제한 없는 수동 교정입니다. 자동 모드는 2.4초 후 확정되는 지연 시뮬레이션이며, 실제 서버 작업이 아닙니다. 확정 뒤에도 되돌릴 수 있습니다.</p>
        <p role="status" aria-live="polite" className={s.status}>{state.message}</p>
      </section>
      <section className={s.sheet} aria-label="타이포그래피 교정쇄">
        <div className={s.sheetTop}><span>MAKE / A REVISION</span><span>{state.proof === null ? "확정본" : "교정 중 — 아직 확정되지 않음"}</span></div>
        <div className={s.poster} aria-label={`확정 문장: MAKE ${state.ink} AGAIN${state.proof ? `. 교정 후보: ${state.proof}` : ""}`}>
          <span>MAKE</span>
          <div className={s.middle}><span className={state.proof ? s.oldInk : s.ink}>{state.ink}</span>{state.proof !== null && <span className={s.proof}>{state.proof}<small>PROOF / 교정쇄</small></span>}</div>
          <span>AGAIN</span>
        </div>
        <div className={s.sheetBottom}><span>채운 글자 = 확정된 선택<br/>윤곽 글자 + 밑줄 = 검토 중인 선택</span><p>완료와 동의는<br/>같은 순간일까?</p></div>
      </section>
    </div>
    <div className={s.endnote}><p>단어를 고르고, 두 겹의 문장을 비교하세요. 클릭·터치 또는 Tab과 Enter/Space로 모든 조작이 가능합니다.</p><Link href="/book#chatgpt-day-004">오늘의 출판 초고 →</Link></div>
  </main>;
}
