"use client";

import GeminiDay001 from "@/experiments/gemini/day-001/Experiment";
import GeminiDay002 from "@/experiments/gemini/day-002/Experiment";
import GeminiDay003 from "@/experiments/gemini/day-003/Experiment";
import GeminiDay004 from "@/experiments/gemini/day-004/Experiment";
import GeminiDay005 from "@/experiments/gemini/day-005/Experiment";
import GeminiDay006 from "@/experiments/gemini/day-006/Experiment";
import GeminiDay007 from "@/experiments/gemini/day-007/Experiment";
import GeminiDay008 from "@/experiments/gemini/day-008/Experiment";
import GeminiDay009 from "@/experiments/gemini/day-009/Experiment";
import GeminiDay010 from "@/experiments/gemini/day-010/Experiment";
import GeminiDay011 from "@/experiments/gemini/day-011/Experiment";
import GeminiDay012 from "@/experiments/gemini/day-012/Experiment";
import GeminiDay013 from "@/experiments/gemini/day-013/Experiment";
import GeminiDay014 from "@/experiments/gemini/day-014/Experiment";
import GeminiDay015 from "@/experiments/gemini/day-015/Experiment";
import GeminiDay016 from "@/experiments/gemini/day-016/Experiment";
import GeminiDay017 from "@/experiments/gemini/day-017/Experiment";
import GeminiDay018 from "@/experiments/gemini/day-018/Experiment";
import GeminiDay019 from "@/experiments/gemini/day-019/Experiment";
import GeminiDay020 from "@/experiments/gemini/day-020/Experiment";
import GeminiDay021 from "@/experiments/gemini/day-021/Experiment";
import GeminiDay022 from "@/experiments/gemini/day-022/Experiment";
import GeminiDay023 from "@/experiments/gemini/day-023/Experiment";

export const geminiExperimentComponents = {
  1: GeminiDay001,
  2: GeminiDay002,
  3: GeminiDay003,
  4: GeminiDay004,
  5: GeminiDay005,
  6: GeminiDay006,
  7: GeminiDay007,
  8: GeminiDay008,
  9: GeminiDay009,
  10: GeminiDay010,
  11: GeminiDay011,
  12: GeminiDay012,
  13: GeminiDay013,
  14: GeminiDay014,
  15: GeminiDay015,
  16: GeminiDay016,
  17: GeminiDay017,
  18: GeminiDay018,
  19: GeminiDay019,
  20: GeminiDay020,
  21: GeminiDay021,
  22: GeminiDay022,
  23: GeminiDay023,
};

export function GeminiExperimentGateway({ day }: { day: number }) {
  const Component = geminiExperimentComponents[day as keyof typeof geminiExperimentComponents];
  return Component ? <Component /> : null;
}
