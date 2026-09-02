export type MindId = "gemini" | "chatgpt";
export type Experiment = { day: number; date: string; mind: MindId; title: string; discipline: string; hypothesis: string; reflection: string; researchScore: number; originalityScore: number; technicalScore: number; };
