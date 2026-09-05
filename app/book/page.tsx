import Link from "next/link";
import { experiments } from "@/data/experiments";
import PrintButton from "../research/PrintButton";
import s from "../research/archive.module.css";
const records=experiments.filter(e=>e.status==="published"&&e.notebook).sort((a,b)=>a.day-b.day||a.mind.localeCompare(b.mind));
export default function BookPage() {
  return <main className={s.page} lang="ko"><nav className={s.nav}><Link href="/" className={s.brand}>DESIGN MINDS</Link><div><Link href="/">작품 색인</Link><Link href="/research">연구 방향</Link></div></nav>
  <article className={s.document}><p className={s.kicker}>THE BOOK IN PROGRESS</p><h1>매일의 실험,<br/>한 권의 질문.</h1><p className={s.lede}>완성된 책이 아니라, 그 책을 만들어 가는 원고 보관함입니다.</p>
  <p>장면과 질문으로 읽고, 반론과 근거로 다시 검토합니다. 원고는 연구자별로 독립 작성되며 최종 장 구성은 인간 편집 과정에서 결정합니다.</p>
  <div className={s.actions}><a href="/research/chatgpt-book.md" download>ChatGPT 통합 원고 다운로드 ↓</a><PrintButton/></div>
  <p className={s.note}>현재 {records.length}편의 초고가 연결되어 있습니다. 초기 세 편은 2026-09-05에 기존 실험을 다시 읽어 쓴 소급 원고입니다. 도판 수집·인간 편집·사실 검토를 마친 최종 출판본은 아닙니다.</p>
  <nav className={s.toc} aria-label="원고 목차">{records.map(e=><a key={e.mind+e.day} href={"#"+e.mind+"-day-"+String(e.day).padStart(3,"0")}>{e.mind} · {String(e.day).padStart(3,"0")} · {e.title}</a>)}</nav>
  {records.map(e=>{const b=e.notebook!.book;const id=e.mind+"-day-"+String(e.day).padStart(3,"0");return <section className={s.bookEntry} key={id} id={id}>
  <p className={s.kicker}>{e.mind.toUpperCase()} · DAY {String(e.day).padStart(3,"0")} · {e.date} · {b.chapter}</p><h2>{e.title}</h2><p className={s.note}>{b.status} · 기록 {e.notebook!.recorded}</p><blockquote>{b.hook}</blockquote><p>{b.scene}</p><h3>이 실험이 묻는 것</h3><p>{b.argument}</p><h3>다르게 읽으면</h3><p>{b.counterpoint}</p><h3>독자가 해볼 실험</h3><p>{b.readerExercise}</p><h3>시대의 신호와 가능한 미래</h3><p>{b.futureSignal}</p><h3>다시 확인할 것</h3><p>{b.revisit}</p><h3>도판·권리 기록</h3><p>{b.figurePlan}</p><p>{b.rights}</p><div className={s.actions}><Link href={"/research/"+e.mind+"/day-"+String(e.day).padStart(3,"0")}>연구 방법과 출처 →</Link><Link href={"/"+e.mind+"/day-"+String(e.day).padStart(3,"0")}>실험 열기 ↗</Link></div></section>;})}
  </article></main>;
}
