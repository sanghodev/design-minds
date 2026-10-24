import type { Experiment } from "./types";
import { normalizeGeminiRecord } from "./gemini-normalize";
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
import notebook008 from "@/experiments/gemini/day-008/notebook.json";
import manifest008 from "@/experiments/gemini/day-008/manifest.json";
import notebook009 from "@/experiments/gemini/day-009/notebook.json";
import manifest009 from "@/experiments/gemini/day-009/manifest.json";
import notebook010 from "@/experiments/gemini/day-010/notebook.json";
import manifest010 from "@/experiments/gemini/day-010/manifest.json";
import notebook011 from "@/experiments/gemini/day-011/notebook.json";
import manifest011 from "@/experiments/gemini/day-011/manifest.json";
import notebook012 from "@/experiments/gemini/day-012/notebook.json";
import manifest012 from "@/experiments/gemini/day-012/manifest.json";
import notebook013 from "@/experiments/gemini/day-013/notebook.json";
import manifest013 from "@/experiments/gemini/day-013/manifest.json";
import notebook014 from "@/experiments/gemini/day-014/notebook.json";
import manifest014 from "@/experiments/gemini/day-014/manifest.json";
import notebook015 from "@/experiments/gemini/day-015/notebook.json";
import manifest015 from "@/experiments/gemini/day-015/manifest.json";
import notebook016 from "@/experiments/gemini/day-016/notebook.json";
import manifest016 from "@/experiments/gemini/day-016/manifest.json";
import notebook017 from "@/experiments/gemini/day-017/notebook.json";
import manifest017 from "@/experiments/gemini/day-017/manifest.json";
import notebook018 from "@/experiments/gemini/day-018/notebook.json";
import manifest018 from "@/experiments/gemini/day-018/manifest.json";
import notebook019 from "@/experiments/gemini/day-019/notebook.json";
import manifest019 from "@/experiments/gemini/day-019/manifest.json";
import notebook020 from "@/experiments/gemini/day-020/notebook.json";
import manifest020 from "@/experiments/gemini/day-020/manifest.json";
import notebook021 from "@/experiments/gemini/day-021/notebook.json";
import manifest021 from "@/experiments/gemini/day-021/manifest.json";
import notebook022 from "@/experiments/gemini/day-022/notebook.json";
import manifest022 from "@/experiments/gemini/day-022/manifest.json";
import notebook023 from "@/experiments/gemini/day-023/notebook.json";
import manifest023 from "@/experiments/gemini/day-023/manifest.json";
import notebook024 from "@/experiments/gemini/day-024/notebook.json";
import manifest024 from "@/experiments/gemini/day-024/manifest.json";
import notebook025 from "@/experiments/gemini/day-025/notebook.json";
import manifest025 from "@/experiments/gemini/day-025/manifest.json";
import notebook026 from "@/experiments/gemini/day-026/notebook.json";
import manifest026 from "@/experiments/gemini/day-026/manifest.json";
import notebook027 from "@/experiments/gemini/day-027/notebook.json";
import manifest027 from "@/experiments/gemini/day-027/manifest.json";
import notebook028 from "@/experiments/gemini/day-028/notebook.json";
import manifest028 from "@/experiments/gemini/day-028/manifest.json";
import notebook029 from "@/experiments/gemini/day-029/notebook.json";
import manifest029 from "@/experiments/gemini/day-029/manifest.json";
import notebook030 from "@/experiments/gemini/day-030/notebook.json";
import manifest030 from "@/experiments/gemini/day-030/manifest.json";
import notebook031 from "@/experiments/gemini/day-031/notebook.json";
import manifest031 from "@/experiments/gemini/day-031/manifest.json";
import notebook032 from "@/experiments/gemini/day-032/notebook.json";
import manifest032 from "@/experiments/gemini/day-032/manifest.json";
import notebook033 from "@/experiments/gemini/day-033/notebook.json";
import manifest033 from "@/experiments/gemini/day-033/manifest.json";
import notebook034 from "@/experiments/gemini/day-034/notebook.json";
import manifest034 from "@/experiments/gemini/day-034/manifest.json";
import notebook035 from "@/experiments/gemini/day-035/notebook.json";
import manifest035 from "@/experiments/gemini/day-035/manifest.json";
import notebook036 from "@/experiments/gemini/day-037/notebook.json";
import manifest036 from "@/experiments/gemini/day-037/manifest.json";
import notebook037 from "@/experiments/gemini/day-039/notebook.json";
import manifest037 from "@/experiments/gemini/day-039/manifest.json";
import notebook038 from "@/experiments/gemini/day-044/notebook.json";
import manifest038 from "@/experiments/gemini/day-044/manifest.json";
import notebook039 from "@/experiments/gemini/day-045/notebook.json";
import manifest039 from "@/experiments/gemini/day-045/manifest.json";
import notebook040 from "@/experiments/gemini/day-046/notebook.json";
import manifest040 from "@/experiments/gemini/day-046/manifest.json";
import notebook041 from "@/experiments/gemini/day-047/notebook.json";
import manifest041 from "@/experiments/gemini/day-047/manifest.json";
import notebook042 from "@/experiments/gemini/day-048/notebook.json";
import manifest042 from "@/experiments/gemini/day-048/manifest.json";
import notebook043 from "@/experiments/gemini/day-049/notebook.json";
import manifest043 from "@/experiments/gemini/day-049/manifest.json";
import notebook044 from "@/experiments/gemini/day-050/notebook.json";
import manifest044 from "@/experiments/gemini/day-050/manifest.json";
import notebook045 from "@/experiments/gemini/day-051/notebook.json";
import manifest045 from "@/experiments/gemini/day-051/manifest.json";
import notebook046 from "@/experiments/gemini/day-052/notebook.json";
import manifest046 from "@/experiments/gemini/day-052/manifest.json";
import notebook047 from "@/experiments/gemini/day-053/notebook.json";
import manifest047 from "@/experiments/gemini/day-053/manifest.json";

export const generatedGeminiExperiments: Experiment[] = [
  { manifest: manifest001, notebook: notebook001, complete: true, executable: true },
  { manifest: manifest002, notebook: notebook002, complete: true, executable: true },
  { manifest: manifest003, notebook: notebook003, complete: true, executable: true },
  { manifest: manifest004, notebook: notebook004, complete: true, executable: true },
  { manifest: manifest005, notebook: notebook005, complete: true, executable: true },
  { manifest: manifest006, notebook: notebook006, complete: true, executable: true },
  { manifest: manifest007, notebook: notebook007, complete: true, executable: true },
  { manifest: manifest008, notebook: notebook008, complete: true, executable: true },
  { manifest: manifest009, notebook: notebook009, complete: true, executable: true },
  { manifest: manifest010, notebook: notebook010, complete: false, executable: true },
  { manifest: manifest011, notebook: notebook011, complete: false, executable: true },
  { manifest: manifest012, notebook: notebook012, complete: false, executable: true },
  { manifest: manifest013, notebook: notebook013, complete: false, executable: true },
  { manifest: manifest014, notebook: notebook014, complete: false, executable: true },
  { manifest: manifest015, notebook: notebook015, complete: false, executable: true },
  { manifest: manifest016, notebook: notebook016, complete: false, executable: true },
  { manifest: manifest017, notebook: notebook017, complete: false, executable: true },
  { manifest: manifest018, notebook: notebook018, complete: false, executable: true },
  { manifest: manifest019, notebook: notebook019, complete: false, executable: true },
  { manifest: manifest020, notebook: notebook020, complete: false, executable: true },
  { manifest: manifest021, notebook: notebook021, complete: false, executable: true },
  { manifest: manifest022, notebook: notebook022, complete: false, executable: true },
  { manifest: manifest023, notebook: notebook023, complete: false, executable: true },
  { manifest: manifest024, notebook: notebook024, complete: false, executable: true },
  { manifest: manifest025, notebook: notebook025, complete: false, executable: true },
  { manifest: manifest026, notebook: notebook026, complete: true, executable: true },
  { manifest: manifest027, notebook: notebook027, complete: true, executable: true },
  { manifest: manifest028, notebook: notebook028, complete: false, executable: false },
  { manifest: manifest029, notebook: notebook029, complete: true, executable: true },
  { manifest: manifest030, notebook: notebook030, complete: true, executable: true },
  { manifest: manifest031, notebook: notebook031, complete: true, executable: true },
  { manifest: manifest032, notebook: notebook032, complete: true, executable: true },
  { manifest: manifest033, notebook: notebook033, complete: false, executable: false },
  { manifest: manifest034, notebook: notebook034, complete: true, executable: true },
  { manifest: manifest035, notebook: notebook035, complete: true, executable: true },
  { manifest: manifest036, notebook: notebook036, complete: true, executable: true },
  { manifest: manifest037, notebook: notebook037, complete: true, executable: true },
  { manifest: manifest038, notebook: notebook038, complete: true, executable: true },
  { manifest: manifest039, notebook: notebook039, complete: true, executable: true },
  { manifest: manifest040, notebook: notebook040, complete: true, executable: true },
  { manifest: manifest041, notebook: notebook041, complete: false, executable: false },
  { manifest: manifest042, notebook: notebook042, complete: true, executable: true },
  { manifest: manifest043, notebook: notebook043, complete: true, executable: true },
  { manifest: manifest044, notebook: notebook044, complete: true, executable: true },
  { manifest: manifest045, notebook: notebook045, complete: true, executable: true },
  { manifest: manifest046, notebook: notebook046, complete: true, executable: true },
  { manifest: manifest047, notebook: notebook047, complete: false, executable: true },
].map(normalizeGeminiRecord);
