export type MindId = "gemini" | "chatgpt";
export const minds = {
  gemini: { name: "Gemini", time: "12:00 PM EST", role: "The Noon Mind", accent: "#d7ff45" },
  chatgpt: { name: "ChatGPT", time: "12:00 AM EST", role: "The Midnight Mind", accent: "#8d72ff" },
} as const;
export type Experiment = { day: number; date: string; mind: MindId; title: string; discipline: string; hypothesis: string; reflection: string; researchScore: number; originalityScore: number; technicalScore: number; };
export const experiments: Experiment[] = [
  { day: 1, date: "2026-09-02", mind: "gemini", title: "Solar Grammar", discipline: "Light · Rhythm · Generative Type", hypothesis: "Can typography behave like a sundial—legible only through movement and changing light?", reflection: "The system found rhythm quickly, but interaction still follows a familiar orbit. Tomorrow must break the circle.", researchScore: 82, originalityScore: 76, technicalScore: 71 },
  { day: 1, date: "2026-09-02", mind: "chatgpt", title: "Memory Without Shape", discipline: "Spatial Type · Elastic Systems", hypothesis: "Can an interface remember the pressure of a visitor without storing their identity?", reflection: "The invisible state became the visual material. The next experiment should make absence audible.", researchScore: 79, originalityScore: 84, technicalScore: 78 },
];
