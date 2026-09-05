import type { Experiment } from "./types";
import day001 from "@/experiments/gemini/day-001/notebook.json";
import day002 from "@/experiments/gemini/day-002/notebook.json";
import day003 from "@/experiments/gemini/day-003/notebook.json";
import manifest001 from "@/experiments/gemini/day-001/manifest.json";
import manifest002 from "@/experiments/gemini/day-002/manifest.json";
import manifest003 from "@/experiments/gemini/day-003/manifest.json";

// Integration status: notebooks exist; Experiment.tsx.gdoc is a document shortcut,
// not executable source. Promote each entry only after its real component is wired.
export const geminiExperiments: Experiment[] = [
  {manifest:manifest001, notebook:day001},
  {manifest:manifest002, notebook:day002},
  {manifest:manifest003, notebook:day003},
].map(({manifest,notebook})=>({
  status:"research-only", mind:"gemini", day:manifest.day, date:manifest.date,
  title:manifest.title, discipline:notebook.category, hypothesis:notebook.question,
  reflection:notebook.limitation, researchScore:manifest.scores.research,
  originalityScore:manifest.scores.originality,technicalScore:manifest.scores.technical, notebook
}));
