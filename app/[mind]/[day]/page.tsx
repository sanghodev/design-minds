import Link from "next/link";
import { notFound } from "next/navigation";
import { experiments, minds, type MindId } from "@/data/experiments";
import PauseExperiment from "@/experiments/chatgpt/day-001/Experiment";
import RemovalExperiment from "@/experiments/chatgpt/day-002/Experiment";
import s from "@/app/research/archive.module.css";
import FocusRoomExperiment from "@/experiments/chatgpt/day-003/Experiment";
import RevisionExperiment from "@/experiments/chatgpt/day-004/Experiment";
import ProvenanceExperiment from "@/experiments/chatgpt/day-005/Experiment";
import ScaleExperiment from "@/experiments/chatgpt/day-006/Experiment";
import TwoOrdersExperiment from "@/experiments/chatgpt/day-007/Experiment";
import ColorContextExperiment from "@/experiments/chatgpt/day-008/Experiment";
import LinebreakExperiment from "@/experiments/chatgpt/day-009/Experiment";
import IntervalExperiment from "@/experiments/chatgpt/day-010/Experiment";
import { GeminiExperimentGateway } from "@/app/gemini-experiments.generated";

import Day011 from "@/experiments/chatgpt/day-011/Experiment";
import Day012 from "@/experiments/chatgpt/day-012/Experiment";
import Day013 from "@/experiments/chatgpt/day-013/Experiment";
import Day014 from "@/experiments/chatgpt/day-014/Experiment";
import Day015 from "@/experiments/chatgpt/day-015/Experiment";
import Day016 from "@/experiments/chatgpt/day-016/Experiment";
import Day017 from "@/experiments/chatgpt/day-017/Experiment";
import Day018 from "@/experiments/chatgpt/day-018/Experiment";
import Day019 from "@/experiments/chatgpt/day-019/Experiment";
import Day020 from "@/experiments/chatgpt/day-020/Experiment";
import Day021 from "@/experiments/chatgpt/day-021/Experiment";
import Day022 from "@/experiments/chatgpt/day-022/Experiment";

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
  if (mind === "chatgpt" && day === 4) return <RevisionExperiment />;
  if (mind === "chatgpt" && day === 5) return <ProvenanceExperiment />;
  if (mind === "chatgpt" && day === 6) return <ScaleExperiment />;
  if (mind === "chatgpt" && day === 7) return <TwoOrdersExperiment />;
  if (mind === "chatgpt" && day === 8) return <ColorContextExperiment />;
  if (mind === "chatgpt" && day === 9) return <LinebreakExperiment />;
  if (mind === "chatgpt" && day === 10) return <IntervalExperiment />;
  if (mind === "chatgpt" && day === 11) return <Day011 />;
  if (mind === "chatgpt" && day === 12) return <Day012 />;
  if (mind === "chatgpt" && day === 13) return <Day013 />;
  if (mind === "chatgpt" && day === 14) return <Day014 />;
  if (mind === "chatgpt" && day === 15) return <Day015 />;
  if (mind === "chatgpt" && day === 16) return <Day016 />;
  if (mind === "chatgpt" && day === 17) return <Day017 />;
  if (mind === "chatgpt" && day === 18) return <Day018 />;
  if (mind === "chatgpt" && day === 19) return <Day019 />;
  if (mind === "chatgpt" && day === 20) return <Day020 />;
  if (mind === "chatgpt" && day === 21) return <Day021 />;
  if (mind === "chatgpt" && day === 22) return <Day022 />;
  if (mind === "gemini") {
    return <GeminiExperimentGateway day={day} />;
  }
  const identity = minds[mind];
  return (
    <main className={`detail-page detail-${mind}`}>
      <nav className="detail-nav"><Link href="/">← Design Minds</Link><span>{identity.role} · Day {String(day).padStart(3, "0")}</span></nav>
      <section className="detail-hero"><p>{experiment.discipline}</p><h1>{experiment.title}</h1><div className="detail-art" aria-hidden="true"><i /><i /><i /></div></section>
      <section className="detail-notes"><article><span>Hypothesis</span><p>{experiment.hypothesis}</p></article><article><span>Self-critique</span><p>{experiment.reflection}</p></article><article><span>Scores</span><p>Research {experiment.researchScore} · Originality {experiment.originalityScore} · Technical {experiment.technicalScore}</p></article></section>
    </main>
  );
}
