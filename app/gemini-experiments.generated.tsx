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
import GeminiDay024 from "@/experiments/gemini/day-024/Experiment";
import GeminiDay025 from "@/experiments/gemini/day-025/Experiment";
import GeminiDay026 from "@/experiments/gemini/day-026/Experiment";
import GeminiDay027 from "@/experiments/gemini/day-027/Experiment";
import GeminiDay028 from "@/experiments/gemini/day-028/Experiment";
import GeminiDay029 from "@/experiments/gemini/day-029/Experiment";
import GeminiDay030 from "@/experiments/gemini/day-030/Experiment";
import GeminiDay031 from "@/experiments/gemini/day-031/Experiment";
import GeminiDay032 from "@/experiments/gemini/day-032/Experiment";
import GeminiDay033 from "@/experiments/gemini/day-033/Experiment";
import GeminiDay034 from "@/experiments/gemini/day-034/Experiment";
import GeminiDay035 from "@/experiments/gemini/day-035/Experiment";
import GeminiDay036 from "@/experiments/gemini/day-036/Experiment";
import GeminiDay037 from "@/experiments/gemini/day-037/Experiment";
import GeminiDay038 from "@/experiments/gemini/day-038/Experiment";
import GeminiDay039 from "@/experiments/gemini/day-039/Experiment";
import GeminiDay040 from "@/experiments/gemini/day-040/Experiment";
import GeminiDay041 from "@/experiments/gemini/day-041/Experiment";
import GeminiDay042 from "@/experiments/gemini/day-042/Experiment";
import GeminiDay043 from "@/experiments/gemini/day-043/Experiment";

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
  24: GeminiDay024,
  25: GeminiDay025,
  26: GeminiDay026,
  27: GeminiDay027,
  28: GeminiDay028,
  29: GeminiDay029,
  30: GeminiDay030,
  31: GeminiDay031,
  32: GeminiDay032,
  33: GeminiDay033,
  34: GeminiDay034,
  35: GeminiDay035,
  36: GeminiDay036,
  37: GeminiDay037,
  38: GeminiDay038,
  39: GeminiDay039,
  40: GeminiDay040,
  41: GeminiDay041,
  42: GeminiDay042,
  43: GeminiDay043,
};

export function GeminiExperimentGateway({ day }: { day: number }) {
  const Component = geminiExperimentComponents[day as keyof typeof geminiExperimentComponents];
  return Component ? <Component /> : null;
}
