import type { Experiment } from "./types";
import type { ResearchNotebook } from "./research-types";

type GeminiManifest = {
  day: number; date: string; title: string; discipline?: string; hypothesis?: string;
  reflection?: string; tags?: string[];
  scores?: { research?: number; originality?: number; technical?: number };
  researchScore?: number; originalityScore?: number; technicalScore?: number;
};

type GeminiNotebook = Partial<ResearchNotebook> & {
  date?: string;
  design_intent?: { ko?: string; en?: string };
  visual_mechanics?: { principle?: string }[];
  next_step?: string;
};

export function normalizeGeminiRecord({ manifest: rawManifest, notebook: rawNotebook, complete, executable }: {
  manifest: unknown; notebook: unknown; complete: boolean; executable: boolean;
}): Experiment {
  const manifest = rawManifest as GeminiManifest;
  const notebook = rawNotebook as GeminiNotebook;
  return {
    status: complete ? "published" : "research-only",
    executable,
    mind: "gemini",
    day: manifest.day,
    date: manifest.date,
    title: manifest.title,
    discipline: notebook.category || manifest.discipline || "",
    hypothesis: notebook.question || manifest.hypothesis || "",
    reflection: notebook.limitation || manifest.reflection || "",
    researchScore: manifest.scores?.research ?? manifest.researchScore ?? 0,
    originalityScore: manifest.scores?.originality ?? manifest.originalityScore ?? 0,
    technicalScore: manifest.scores?.technical ?? manifest.technicalScore ?? 0,
    notebook: {
      ...notebook,
      schemaVersion: notebook.schemaVersion || 1,
      recorded: notebook.recorded || notebook.date || manifest.date,
      provenance: notebook.provenance || "Gemini 원본 연구 기록 · 구현 및 관찰 미검증",
      category: notebook.category || manifest.discipline || "미분류",
      tags: notebook.tags || manifest.tags || [],
      summary: notebook.summary || notebook.design_intent?.ko || notebook.design_intent?.en || manifest.hypothesis || "",
      question: notebook.question || manifest.hypothesis || "",
      method: notebook.method || notebook.visual_mechanics?.map((item) => item.principle || "").filter(Boolean) || [],
      observation: notebook.observation || "",
      limitation: notebook.limitation || "",
      nextQuestion: notebook.nextQuestion || notebook.next_step || "",
      sources: notebook.sources || [],
      book: notebook.book || {},
    },
  };
}
