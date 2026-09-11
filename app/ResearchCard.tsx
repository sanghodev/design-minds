"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Experiment } from "@/data/types";
import type { ResearchNotebook } from "@/data/research-types";
import s from "./research/archive.module.css";

export type ArchiveEntry = Pick<Experiment, "status" | "day" | "date" | "mind" | "title" | "discipline" | "hypothesis"> & {
  notebook?: Pick<ResearchNotebook, "category" | "tags" | "summary">;
};

export default function ResearchCard({ entry: e }: { entry: ArchiveEntry }) {
  const card = useRef<HTMLElement>(null);
  const [nearby, setNearby] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const day = String(e.day).padStart(3, "0");
  const path = "/" + e.mind + "/day-" + day;
  const ready = e.status === "published";
  const entryPath = ready ? path : "/research" + path;

  useEffect(() => {
    const node = card.current;
    if (!node || !("IntersectionObserver" in window)) return;
    // Keep only nearby live experiments mounted. Offscreen cards retain their
    // dimensions and text, so unloading an animation never moves the page.
    const preview = new IntersectionObserver(([item]) => {
      setNearby(item.isIntersecting);
      if (!item.isIntersecting) setLoaded(false);
    }, { rootMargin: "240px 0px" });
    preview.observe(node);
    // Content stays visible without JS/observer support; hide only offscreen
    // cards after enhancement and reveal each once when it enters the viewport.
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reveal = new IntersectionObserver(([item]) => {
      if (item.isIntersecting) {
        node.dataset.reveal = "visible";
        reveal.unobserve(node);
      }
    }, { threshold: 0.01 });
    if (!motion.matches && node.getBoundingClientRect().top > window.innerHeight) {
      node.dataset.reveal = "waiting";
      reveal.observe(node);
    }
    return () => { preview.disconnect(); reveal.disconnect(); delete node.dataset.reveal; };
  }, []);

  return <article ref={card} className={s.card}>
    {ready ? <Link prefetch={false} className={s.preview} href={path} aria-label={e.title + " 실험 열기"}>
      <div className={s.previewPlaceholder} aria-hidden="true">
        <span>{e.mind === "chatgpt" ? "ChatGPT" : "Gemini"} · Day {day}</span>
        <strong>{e.title}</strong>
        <small>{nearby ? "미리보기 불러오는 중" : "실험 미리보기"}</small>
      </div>
      <div className={s.frame} aria-hidden="true" inert data-loaded={loaded}>
        {nearby && <iframe src={path} title={e.title + " 실제 페이지 미리보기"} loading="lazy" tabIndex={-1} onLoad={() => setLoaded(true)} />}
      </div>
      <span className={s.previewLabel}>실험 열기 ↗</span>
    </Link> : <Link prefetch={false} className={s.researchCover} href={entryPath}>
      <span>{e.mind.toUpperCase()} · RESEARCH NOTE</span><strong>{e.title}</strong><small>연구글 공개 · 실행 파일 대기</small>
    </Link>}
    <div className={s.meta}><span>{e.mind === "chatgpt" ? "ChatGPT" : "Gemini"} · Day {day}</span><time dateTime={e.date}>{e.date}</time></div>
    <p className={s.category}>{e.notebook?.category || e.discipline}</p>
    <h3><Link prefetch={false} href={entryPath}>{e.title}</Link></h3>
    <p className={s.summary}>{e.notebook?.summary || e.hypothesis}</p>
    <div className={s.tags}>{e.notebook?.tags.map(t => <span key={t}>{t}</span>)}</div>
    <div className={s.cardLinks}>
      {ready ? <Link prefetch={false} href={path}>실험하기 ↗</Link> : <Link prefetch={false} href={"/book#" + e.mind + "-day-" + day}>출판 초고 읽기 →</Link>}
      {e.notebook ? <Link prefetch={false} href={"/research" + path}>연구노트 읽기 →</Link> : <span>연구노트 준비 전</span>}
    </div>
  </article>;
}
