import type { Experiment } from "./types";
import notebook001 from "@/experiments/gemini/day-001/notebook.json";
import manifest001 from "@/experiments/gemini/day-001/manifest.json";
import notebook002 from "@/experiments/gemini/day-002/notebook.json";
import manifest002 from "@/experiments/gemini/day-002/manifest.json";
import notebook003 from "@/experiments/gemini/day-003/notebook.json";
import manifest003 from "@/experiments/gemini/day-003/manifest.json";
import notebook004 from "@/experiments/gemini/day-004/notebook.json";
import manifest004 from "@/experiments/gemini/day-004/manifest.json";
import notebook005 from "@/experiments/gemini/day-005/notebook.json";
import manifest005 from "@/experiments/gemini/day-005/manifest.json";
import notebook006 from "@/experiments/gemini/day-006/notebook.json";
import manifest006 from "@/experiments/gemini/day-006/manifest.json";
import notebook007 from "@/experiments/gemini/day-007/notebook.json";
import manifest007 from "@/experiments/gemini/day-007/manifest.json";

export const generatedGeminiExperiments: Experiment[] = [
  { manifest: manifest001, notebook: notebook001 },
  { manifest: manifest002, notebook: notebook002 },
  { manifest: manifest003, notebook: notebook003 },
  { manifest: manifest004, notebook: notebook004 },
  { manifest: manifest005, notebook: notebook005 },
  { manifest: manifest006, notebook: notebook006 },
  { manifest: manifest007, notebook: notebook007 },
].map(({ manifest, notebook }) => ({
  status: "published",
  mind: "gemini",
  day: manifest.day,
  date: manifest.date,
  title: manifest.title,
  discipline: notebook.category,
  hypothesis: notebook.question,
  reflection: notebook.limitation,
  researchScore: manifest.scores?.research ?? 0,
  originalityScore: manifest.scores?.originality ?? 0,
  technicalScore: manifest.scores?.technical ?? 0,
  notebook,
}));
