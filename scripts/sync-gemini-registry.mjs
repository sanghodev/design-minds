import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const geminiRoot = join(root, "experiments", "gemini");
const generatedDataPath = join(root, "data", "gemini.generated.ts");
const generatedRoutesPath = join(root, "app", "gemini-experiments.generated.tsx");

const dayPattern = /^day-(\d{3})$/;
const days = existsSync(geminiRoot)
  ? readdirSync(geminiRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && dayPattern.test(entry.name))
      .map((entry) => entry.name)
      .sort()
  : [];

const completeDays = days.filter((day) => {
  const dir = join(geminiRoot, day);
  return (
    existsSync(join(dir, "manifest.json")) &&
    existsSync(join(dir, "notebook.json")) &&
    existsSync(join(dir, "Experiment.tsx"))
  );
});

const dataImports = completeDays
  .map((day, index) => {
    const id = String(index + 1).padStart(3, "0");
    return [
      `import notebook${id} from "@/experiments/gemini/${day}/notebook.json";`,
      `import manifest${id} from "@/experiments/gemini/${day}/manifest.json";`,
    ].join("\n");
  })
  .join("\n");

const dataEntries = completeDays
  .map((_, index) => {
    const id = String(index + 1).padStart(3, "0");
    return `  { manifest: manifest${id}, notebook: notebook${id} },`;
  })
  .join("\n");

writeFileSync(
  generatedDataPath,
  `import type { Experiment } from "./types";\n${dataImports}\n\nexport const generatedGeminiExperiments: Experiment[] = [\n${dataEntries}\n].map(({ manifest, notebook }) => ({\n  status: "published",\n  mind: "gemini",\n  day: manifest.day,\n  date: manifest.date,\n  title: manifest.title,\n  discipline: notebook.category,\n  hypothesis: notebook.question,\n  reflection: notebook.limitation,\n  researchScore: manifest.scores?.research ?? 0,\n  originalityScore: manifest.scores?.originality ?? 0,\n  technicalScore: manifest.scores?.technical ?? 0,\n  notebook,\n}));\n`,
);

const routeImports = completeDays
  .map((day, index) => `import GeminiDay${String(index + 1).padStart(3, "0")} from "@/experiments/gemini/${day}/Experiment";`)
  .join("\n");

const routeEntries = completeDays
  .map((day, index) => {
    const manifest = JSON.parse(readFileSync(join(geminiRoot, day, "manifest.json"), "utf8"));
    return `  ${manifest.day}: GeminiDay${String(index + 1).padStart(3, "0")},`;
  })
  .join("\n");

writeFileSync(
  generatedRoutesPath,
  `${routeImports}\n\nexport const geminiExperimentComponents = {\n${routeEntries}\n};\n`,
);

console.log(`Gemini registry synced: ${completeDays.length} published experiment component(s).`);
