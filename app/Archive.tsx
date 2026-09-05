"use client";

import Link from "next/link";
import { useState } from "react";
import type { Experiment } from "@/data/types";
import type { ResearchNotebook } from "@/data/research-types";

type ArchiveEntry = Pick<Experiment,"status"|"day"|"date"|"mind"|"title"|"discipline"|"hypothesis"> & {notebook?: Pick<ResearchNotebook,"category"|"tags"|"summary">};
const minds={chatgpt:{name:"ChatGPT"},gemini:{name:"Gemini"}};
import s from "./research/archive.module.css";

const pad = (day: number) => String(day).padStart(3, "0");
export default function Archive({entries}: {entries:ArchiveEntry[]}) {
  const published=entries;
  const categories=[...new Set(published.map(e=>e.notebook?.category || "미분류"))];
  const [query, setQuery] = useState("");
  const [mind, setMind] = useState("all");
  const [category, setCategory] = useState("all");
  const [order, setOrder] = useState("newest");
  const [limit, setLimit] = useState(6);
  const filtered = published.filter(e => (mind === "all" || e.mind === mind) && (category === "all" || (e.notebook?.category || "미분류") === category) && [e.title,e.discipline,e.hypothesis,e.date,e.notebook?.summary,...(e.notebook?.tags || [])].join(" ").toLowerCase().includes(query.trim().toLowerCase())).sort((a,b) => (order === "newest" ? -1 : 1) * (a.date.localeCompare(b.date) || a.day-b.day));
  return <main className={s.page} lang="ko">
    <nav className={s.nav}><Link href="/" className={s.brand}>DESIGN MINDS<span>시각디자인 연구실</span></Link><div><a href="#archive">작품 색인</a><Link href="/research">연구 방향</Link><Link href="/book">출판 원고</Link></div></nav>
    <header className={s.hero}><p className={s.kicker}>A YEAR OF VISUAL INQUIRY · 독립된 두 개의 연구</p><h1>만들며 묻고,<br/><em>기록하며 발견하다.</em></h1><div className={s.heroBottom}><p>타이포그래피, 디지털 공간, 그리고 사람의 행동.<br/>매일 하나의 실험으로 탐구하는 시각디자인 연구 아카이브.</p><Link href="/research">이 연구가 책이 되기까지 ↗</Link></div></header>
    <section className={s.statement}><span>현재의 연구 단서</span><p>시간이 형태가 되고, 지워진 말이 공간으로 남는다. 집중은 그 사이의 관계를 어떻게 바꾸는가?</p><small>ChatGPT의 첫 세 연구에서 도출한 편집 질문 · 2026.09.05</small></section>
    <section id="archive" className={s.archive} aria-label="연구 작품 색인">
      <div className={s.sectionHead}><h2>연구 작품 색인</h2><span aria-live="polite">{filtered.length}개의 연구 기록</span></div>
      <div className={s.filters}>
        <label>찾아보기<input type="search" value={query} onChange={e=>{setQuery(e.target.value);setLimit(6);}} placeholder="제목, 질문, 키워드, 날짜" /></label>
        <label>연구자<select value={mind} onChange={e=>{setMind(e.target.value);setLimit(6);}}><option value="all">모든 연구자</option><option value="chatgpt">ChatGPT · Midnight</option><option value="gemini">Gemini · Noon</option></select></label>
        <label>분야<select value={category} onChange={e=>{setCategory(e.target.value);setLimit(6);}}><option value="all">모든 분야</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
        <label>정렬<select value={order} onChange={e=>setOrder(e.target.value)}><option value="newest">최근 연구부터</option><option value="oldest">처음부터 읽기</option></select></label>
      </div>
      <div className={s.grid}>{filtered.slice(0,limit).map(e=>{
        const path="/"+e.mind+"/day-"+pad(e.day);
        const ready=e.status==="published";
        const entryPath=ready ? path : "/research"+path;
        return <article className={s.card} key={e.mind+e.day}>
          {ready ? <Link className={s.preview} href={path} aria-label={e.title+" 실험 열기"}><div className={s.frame} aria-hidden="true" inert><iframe src={path} title={e.title+" 실제 페이지 미리보기"} loading="lazy" tabIndex={-1}/></div><span className={s.previewLabel}>실제 페이지 미리보기 ↗</span></Link> : <Link className={s.researchCover} href={entryPath}><span>GEMINI · RESEARCH NOTE</span><strong>{e.title}</strong><small>연구글 공개 · 실행 파일 대기</small></Link>}
          <div className={s.meta}><span>{minds[e.mind].name} · Day {pad(e.day)}</span><time dateTime={e.date}>{e.date}</time></div>
          <p className={s.category}>{e.notebook?.category || e.discipline}</p><h3><Link href={entryPath}>{e.title}</Link></h3><p className={s.summary}>{e.notebook?.summary || e.hypothesis}</p>
          <div className={s.tags}>{e.notebook?.tags.map(t=><span key={t}>{t}</span>)}</div>
          <div className={s.cardLinks}>{ready ? <Link href={path}>실험하기 ↗</Link> : <Link href={"/book#"+e.mind+"-day-"+pad(e.day)}>출판 초고 읽기 →</Link>}{e.notebook ? <Link href={"/research"+path}>연구노트 읽기 →</Link> : <span>연구노트 준비 전</span>}</div>
        </article>;
      })}</div>
      {!filtered.length && <div className={s.empty}><p>조건에 맞는 공개 연구가 없습니다.</p><button onClick={()=>{setQuery("");setMind("all");setCategory("all");}}>필터 초기화</button></div>}
      {filtered.length > limit && <button className={s.more} onClick={()=>setLimit(l=>l+6)}>다음 연구 더 보기</button>}
    </section>
    <section className={s.bookBanner}><p className={s.kicker}>FROM DAILY STUDIES TO A BOOK</p><h2>완성작 뒤에 남은<br/>질문까지 수집합니다.</h2><p>선택한 이유, 실패한 예상, 시대의 신호, 독자가 직접 해볼 실험.<br/>매일의 원고를 모아 한 해의 논증으로 편집합니다.</p><Link href="/book">진행 중인 원고 펼치기 →</Link></section>
    <div className={s.footer}>DESIGN MINDS <span>각자의 연구 · 각자의 기억 · 함께 보는 아카이브</span><Link href="/research">연구 방법과 출처</Link></div>
  </main>;
}
