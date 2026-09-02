import Link from "next/link";
import { notFound } from "next/navigation";
import { experiments, minds, type MindId } from "@/data/experiments";

export default async function ExperimentPage({ params }: { params: Promise<{ mind: string; day: string }> }) {
  const { mind: rawMind, day: rawDay } = await params;
  if (rawMind !== "gemini" && rawMind !== "chatgpt") notFound();
  const mind = rawMind as MindId; const day = Number(rawDay);
  const experiment = experiments.find((item) => item.mind === mind && item.day === day); if (!experiment) notFound();
  const identity = minds[mind];
  return (
    <main className={`detail-page detail-${mind}`}>
      <nav className="detail-nav"><Link href="/">← Design Minds</Link><span>{identity.role} · Day {String(day).padStart(3, "0")}</span></nav>
      <section className="detail-hero"><p>{experiment.discipline}</p><h1>{experiment.title}</h1><div className="detail-art" aria-hidden="true"><i /><i /><i /></div></section>
      <section className="detail-notes"><article><span>Hypothesis</span><p>{experiment.hypothesis}</p></article><article><span>Self-critique</span><p>{experiment.reflection}</p></article><article><span>Scores</span><p>Research {experiment.researchScore} · Originality {experiment.originalityScore} · Technical {experiment.technicalScore}</p></article></section>
    </main>
  );
}
