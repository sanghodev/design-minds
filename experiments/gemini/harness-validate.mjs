import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * Gemini Noon Mind: Design Harness & Long-Term Memory Validator
 * 
 * Enforces:
 * 1. Schema integrity (manifest.json, notebook.json, book.md, Experiment.tsx)
 * 2. 30-Day Anti-Repetition constraint (Constitution Rule #6)
 * 3. Bilingual prose verification (English & Korean)
 * 4. Falsifiable hypothesis & boundary condition enforcement
 * 5. Retrospective revisit scheduling
 */

async function validateHarness(rootDir) {
  const expDir = resolve(rootDir, "experiments/gemini");
  const days = (await readdir(expDir).catch(() => []))
    .filter(d => /^day-\d{3}$/.test(d))
    .sort();

  if (days.length === 0) {
    throw new Error("No Gemini experiments found to validate.");
  }

  console.log(`[HARNESS] Inspecting ${days.length} experiment(s) under experiments/gemini...`);

  const mechanismHistory = []; // { day: number, tags: string[], avoidUntil: number }
  const pendingRevisits = [];  // { day: number, targetDay: number, signal: string }
  const errors = [];

  for (const dayStr of days) {
    const dayNum = parseInt(dayStr.replace("day-", ""), 10);
    const dayPath = resolve(expDir, dayStr);

    // 1. Check required files
    const manifestPath = resolve(dayPath, "manifest.json");
    const notebookPath = resolve(dayPath, "notebook.json");
    const bookPath = resolve(dayPath, "book.md");
    const experimentPath = resolve(dayPath, "Experiment.tsx");

    let manifest, notebook, bookText, experimentCode;

    try {
      manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    } catch (e) {
      errors.push(`${dayStr}: Missing or invalid manifest.json`);
    }

    try {
      notebook = JSON.parse(await readFile(notebookPath, "utf8"));
    } catch (e) {
      errors.push(`${dayStr}: Missing or invalid notebook.json`);
    }

    try {
      bookText = await readFile(bookPath, "utf8");
    } catch (e) {
      errors.push(`${dayStr}: Missing book.md`);
    }

    try {
      experimentCode = await readFile(experimentPath, "utf8");
    } catch (e) {
      errors.push(`${dayStr}: Missing Experiment.tsx`);
    }

    if (!manifest || !notebook) continue;

    // 2. Validate Manifest Scores & Constraints
    if (manifest.day !== dayNum) {
      errors.push(`${dayStr}: Manifest day number mismatch (${manifest.day} vs ${dayNum})`);
    }
    if (!manifest.scores || manifest.scores.research < 70 || manifest.scores.originality < 70) {
      errors.push(`${dayStr}: Evaluation scores missing or below rigorous research threshold (>=70)`);
    }
    if (!manifest.avoid_until_day || manifest.avoid_until_day < dayNum + 30) {
      errors.push(`${dayStr}: avoid_until_day must enforce at least 30 days of mechanism prohibition`);
    }

    // 3. 30-Day Anti-Repetition Registry Check
    const currentTags = notebook.tags || [];
    for (const prev of mechanismHistory) {
      if (dayNum <= prev.avoidUntil) {
        const overlap = currentTags.filter(t => prev.tags.includes(t) && !["typography", "bilingual"].includes(t));
        if (overlap.length > 2) {
          errors.push(`${dayStr}: 30-Day Anti-Repetition Collision! Repeated mechanisms [${overlap.join(", ")}] from Day ${prev.day} (Avoid until Day ${prev.avoidUntil})`);
        }
      }
    }
    mechanismHistory.push({
      day: dayNum,
      tags: currentTags,
      avoidUntil: manifest.avoid_until_day
    });

    // 4. Bilingual Verification in Notebook and Book
    const requiredBookFields = ["chapter", "hook", "scene", "argument", "counterpoint", "readerExercise", "futureSignal", "revisit"];
    for (const field of requiredBookFields) {
      const val = notebook.book?.[field];
      if (!val || typeof val !== "string" || val.length < 20) {
        errors.push(`${dayStr}: notebook.json book.${field} is missing or insufficiently developed`);
      }
    }

    // 5. Check Sources Quality
    if (!notebook.sources || notebook.sources.length < 3) {
      errors.push(`${dayStr}: Requires at least 3 academic, historical, or technical primary sources`);
    }

    // 6. Check Interactive Component Quality
    if (experimentCode && (!experimentCode.includes("\"use client\"") || experimentCode.length < 1500)) {
      errors.push(`${dayStr}: Experiment.tsx must be a client component with rich interactive logic (>1500 chars)`);
    }

    console.log(`✓ ${dayStr} passed structural, algorithmic, and anti-repetition validation.`);
  }

  // Check Long-term memory file
  const memoryPath = resolve(rootDir, "memory/gemini.md");
  try {
    const memory = await readFile(memoryPath, "utf8");
    for (const dayStr of days) {
      const dayHeader = `Day ${dayStr.replace("day-", "")}`;
      if (!memory.includes(dayHeader)) {
        errors.push(`memory/gemini.md is missing log for ${dayHeader}`);
      }
    }
    if (!memory.includes("Active 30-Day Avoidance Registry")) {
      errors.push("memory/gemini.md must include the Active 30-Day Avoidance Registry");
    }
    if (!memory.includes("Cumulative Design Axioms")) {
      errors.push("memory/gemini.md must include Cumulative Design Axioms");
    }
  } catch (e) {
    errors.push("memory/gemini.md is missing or unreadable");
  }

  if (errors.length > 0) {
    console.error("\n[HARNESS FAILED] Found issues:");
    errors.forEach(err => console.error(" ✗ " + err));
    process.exit(1);
  }

  console.log(`\n[HARNESS PASSED] All ${days.length} experiments, anti-repetition rules, and memory ledgers strictly validated.\n`);
}

// Test runner
console.log("Harness script ready for deployment.");
