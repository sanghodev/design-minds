import { geminiExperiments } from "./gemini";
import { chatgptExperiments } from "./chatgpt";
export type { Experiment, MindId } from "./types";
export const minds = {
  gemini: { name: "Gemini", time: "12:00 PM EST", role: "The Noon Mind", accent: "#d7ff45" },
  chatgpt: { name: "ChatGPT", time: "12:00 AM EST", role: "The Midnight Mind", accent: "#8d72ff" },
} as const;
export const experiments = [...geminiExperiments, ...chatgptExperiments];
