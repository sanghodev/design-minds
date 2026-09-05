import Link from "next/link";
import { notFound } from "next/navigation";
import { experiments, minds, type MindId } from "@/data/experiments";
import PauseExperiment from "@/experiments/chatgpt/day-001/Experiment";
import RemovalExperiment from "@/experiments/chatgpt/day-002/Experiment";
import s from "@/app/research/archive.module.css";
import FocusRoomExperiment from "@/experiments/chatgpt/day-003/Experiment";

export default async function ExperimentPage({ params }: { params: Promise<{ mind: string; day: string }> }) {
  const { mind: rawMind, day: rawDay } = await params;
  if (rawMind !== "gemini" && rawMind !== "chatgpt") notFound();
  if (!/^day-\d{3}$/.test(rawDay)) notFound();
  const mind = rawMind as MindId; const day = Number(rawDay.slice(4));
  const experiment = experiments.find((item) => item.mind === mind && item.day === day && item.status !== "scaffold-seed"); if (!experiment) notFound();
  if (experiment.status === "research-only") return <main className={s.page} lang="ko"><article className={s.document}><Link href="/">← Design Minds</Link><p className={s.kicker}>GEMINI · DAY {String(day).padStart(3,"0")}</p><h1>{experiment.title}</h1><p className={s.lede}>연구글 공개 · 실행 파일 대기</p><p>이 연구의 노트와 출판 초고를 먼저 읽을 수 있습니다. 인터랙티브 작품은 실행 가능한 원본 파일이 연결되면 공개합니다.</p><div className={s.actions}><Link href={"/research/"+mind+"/"+rawDay}>연구노트 읽기 →</Link><Link href={"/book#"+mind+"-"+rawDay}>출판 초고 읽기 →</Link></div></article></main>;
  if (mind === "chatgpt" && day === 1) return <PauseExperiment />;
  if (mind === "chatgpt" && day === 2) return <RemovalExperiment />;
  if (mind === "chatgpt" && day === 3) return <FocusRoomExperiment />;
  const identity = minds[mind];
  return (
    <main className={`detail-page detail-${mind}`}>
      <nav className="detail-nav"><Link href="/">← Design Minds</Link><span>{identity.role} · Day {String(day).padStart(3, "0")}</span></nav>
      <section className="detail-hero"><p>{experiment.discipline}</p><h1>{experiment.title}</h1><div className="detail-art" aria-hidden="true"><i /><i /><i /></div></section>
      <section className="detail-notes"><article><span>Hypothesis</span><p>{experiment.hypothesis}</p></article><article><span>Self-critique</span><p>{experiment.reflection}</p></article><article><span>Scores</span><p>Research {experiment.researchScore} · Originality {experiment.originalityScore} · Technical {experiment.technicalScore}</p></article></section>
    </main>
  );
}
