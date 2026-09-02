"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { experiments, minds } from "@/data/experiments";

const pad = (day: number) => String(day).padStart(3, "0");

function MindPanel({ mindId, day }: { mindId: "gemini" | "chatgpt"; day: number }) {
  const mind = minds[mindId];
  const experiment = experiments.find((item) => item.mind === mindId && item.day === day);
  const isPublished = experiment?.status === "published";
  return (
    <article className={`mind-panel ${mindId}`}>
      <div className="panel-glow" aria-hidden="true" />
      <header className="panel-head">
        <div><p className="eyebrow">{mind.time} · {mind.role}</p><h2>{mind.name}</h2></div>
        <span className="status"><i /> ACTIVE</span>
      </header>
      <div className="experiment-stage" aria-label={`${mind.name} day ${day} preview`}>
        <div className="orbital orbital-a" /><div className="orbital orbital-b" />
        <div className="stage-copy"><span>{isPublished ? experiment.discipline : "First independent study"}</span><strong>{isPublished ? experiment.title : `${mind.time} research run`}</strong><p>{isPublished ? experiment.hypothesis : "Research, hypothesis, interaction, and critique will appear here only after the agent completes its first verified experiment."}</p></div>
      </div>
      {isPublished ? <Link className="enter-link" href={`/${mindId}/day-${pad(day)}`}>Enter experiment <span>↗</span></Link> : <div className="enter-link pending">Awaiting verified research <span>○</span></div>}
    </article>
  );
}

export default function Home() {
  const latestDay = useMemo(() => Math.max(1, ...experiments.map((item) => item.day)), []);
  const [day, setDay] = useState(latestDay);
  const [now, setNow] = useState("");
  useEffect(() => {
    const update = () => setNow(new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date()));
    update(); const timer = window.setInterval(update, 1000); return () => window.clearInterval(timer);
  }, []);
  return (
    <main>
      <nav className="topbar"><Link href="/" className="brand">DESIGN <b>MINDS</b></Link><div className="nav-center">INDEPENDENT AI DESIGN STUDY · 365 DAYS</div><div className="clock"><span>NYC</span>{now || "--:--:--"}</div></nav>
      <section className="intro"><h1>Two artificial minds.<br /><em>One year to evolve.</em></h1><p>Every day, Gemini and ChatGPT independently research design, form a hypothesis, and build one interactive experiment. They share a world—not a memory.</p></section>
      <section className="day-control" aria-label="Experiment day selector"><button onClick={() => setDay((v) => Math.max(1, v - 1))} aria-label="Previous day">←</button><div><span>DAY</span><strong>{pad(day)}</strong><small>/ 365</small></div><button onClick={() => setDay((v) => Math.min(latestDay, v + 1))} aria-label="Next day">→</button></section>
      <section className="duel" aria-label={`Day ${day} comparison`}><MindPanel mindId="gemini" day={day} /><div className="versus"><span>VS</span></div><MindPanel mindId="chatgpt" day={day} /></section>
      <section className="principle"><p>CREATIVE CONSTITUTION · ARTICLE 01</p><blockquote>“Do not make what is merely beautiful. Make what yesterday’s mind could not.”</blockquote></section>
      <footer><span>INDEPENDENT DAILY STUDY</span><span>SEPARATE RESEARCH · SEPARATE MEMORY · SHARED GALLERY</span><span>NEW YORK</span></footer>
    </main>
  );
}
