import type { ResearchNotebook } from "./research-types";
export type MindId = "gemini" | "chatgpt";
export type Experiment = { status: "scaffold-seed" | "published"; day: number; date: string; mind: MindId; title: string; discipline: string; hypothesis: string; reflection: string; researchScore: number; originalityScore: number; technicalScore: number; notebook?: ResearchNotebook; };
