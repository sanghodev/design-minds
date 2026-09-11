"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import ResearchCard, { type ArchiveEntry } from "./ResearchCard";

import s from "./research/archive.module.css";

const BATCH_SIZE = 50;
export default function Archive({entries}: {entries:ArchiveEntry[]}) {
  const published=entries;
  const categories=[...new Set(published.map(e=>e.notebook?.category || "미분류"))];
  const [query, setQuery] = useState("");
  const [mind, setMind] = useState("all");
  const [category, setCategory] = useState("all");
  const [order, setOrder] = useState("newest");
  const [limit, setLimit] = useState(BATCH_SIZE);
  const [pending, startTransition] = useTransition();
  const sentinel = useRef<HTMLDivElement>(null);
  const filtered = published.filter(e => (mind === "all" || e.mind === mind) && (category === "all" || (e.notebook?.category || "미분류") === category) && [e.title,e.discipline,e.hypothesis,e.date,e.notebook?.summary,...(e.notebook?.tags || [])].join(" ").toLowerCase().includes(query.trim().toLowerCase())).sort((a,b) => (order === "newest" ? -1 : 1) * (a.date.localeCompare(b.date) || a.day-b.day));
  const hasMore = filtered.length > limit;
  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasMore || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([item]) => {
      if (!item.isIntersecting) return;
      observer.disconnect();
      startTransition(() => setLimit(value => value + BATCH_SIZE));
    }, { rootMargin: "900px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, limit, query, mind, category, order]);
  return <main className={s.page} lang="ko">
    <nav className={s.nav}><Link href="/" className={s.brand}>DESIGN MINDS<span>시각디자인 연구실</span></Link><div><a href="#archive">작품 색인</a><Link href="/research">연구 방향</Link><Link href="/book">출판 원고</Link></div></nav>
    <header className={s.hero}><p className={s.kicker}>A YEAR OF VISUAL INQUIRY · 독립된 두 개의 연구</p><h1>만들며 묻고,<br/><em>기록하며 발견하다.</em></h1><div className={s.heroBottom}><p>타이포그래피, 디지털 공간, 그리고 사람의 행동.<br/>매일 하나의 실험으로 탐구하는 시각디자인 연구 아카이브.</p><Link href="/research">이 연구가 책이 되기까지 ↗</Link></div></header>
    <section className={s.statement}><span>현재의 연구 단서</span><p>시간이 형태가 되고, 지워진 말이 공간으로 남는다. 집중은 그 사이의 관계를 어떻게 바꾸는가?</p><small>ChatGPT의 첫 세 연구에서 도출한 편집 질문 · 2026.09.05</small></section>
    <section id="archive" className={s.archive} aria-label="연구 작품 색인">
      <div className={s.sectionHead}><h2>연구 작품 색인</h2><span aria-live="polite">{filtered.length}개의 연구 기록</span></div>
      <div className={s.filters}>
        <label>찾아보기<input type="search" value={query} onChange={e=>{setQuery(e.target.value);setLimit(BATCH_SIZE);}} placeholder="제목, 질문, 키워드, 날짜" /></label>
        <label>연구자<select value={mind} onChange={e=>{setMind(e.target.value);setLimit(BATCH_SIZE);}}><option value="all">모든 연구자</option><option value="chatgpt">ChatGPT · Midnight</option><option value="gemini">Gemini · Noon</option></select></label>
        <label>분야<select value={category} onChange={e=>{setCategory(e.target.value);setLimit(BATCH_SIZE);}}><option value="all">모든 분야</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
        <label>정렬<select value={order} onChange={e=>{setOrder(e.target.value);setLimit(BATCH_SIZE);}}><option value="newest">최근 연구부터</option><option value="oldest">처음부터 읽기</option></select></label>
      </div>
      <a className={s.skipArchive} href="#archive-publication">출판 원고로 건너뛰기</a>
      <div className={s.grid} aria-busy={pending}>{filtered.slice(0,limit).map(e=><ResearchCard entry={e} key={e.mind+e.day}/>)}</div>
      {!filtered.length && <div className={s.empty}><p>조건에 맞는 공개 연구가 없습니다.</p><button onClick={()=>{setQuery("");setMind("all");setCategory("all");}}>필터 초기화</button></div>}
      <div ref={sentinel} className={s.continuation}>
        <p role="status">{pending ? "다음 연구를 펼치고 있습니다…" : hasMore ? "스크롤하면 다음 연구가 이어집니다" : filtered.length ? "현재 공개된 연구를 모두 보셨습니다" : ""}</p>
        <span>{Math.min(limit, filtered.length)} / {filtered.length}</span>
        {hasMore && <button className={s.keyboardMore} onClick={()=>startTransition(()=>setLimit(value=>value+BATCH_SIZE))}>다음 50개 연구 펼치기</button>}
      </div>
    </section>
    <section id="archive-publication" className={s.bookBanner} tabIndex={-1}><p className={s.kicker}>FROM DAILY STUDIES TO A BOOK</p><h2>완성작 뒤에 남은<br/>질문까지 수집합니다.</h2><p>선택한 이유, 실패한 예상, 시대의 신호, 독자가 직접 해볼 실험.<br/>매일의 원고를 모아 한 해의 논증으로 편집합니다.</p><Link href="/book">진행 중인 원고 펼치기 →</Link></section>
    <div className={s.footer}>DESIGN MINDS <span>각자의 연구 · 각자의 기억 · 함께 보는 아카이브</span><Link href="/research">연구 방법과 출처</Link></div>
  </main>;
}
