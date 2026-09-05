export type ResearchSource = { title: string; publisher: string; url: string; accessed: string; kind: string; use: string; limitation: string };
export type ResearchNotebook = {
  schemaVersion: number; recorded: string; provenance: string; category: string; tags: string[];
  summary: string; question: string; method: string[]; observation: string; limitation: string;
  nextQuestion: string; sources: ResearchSource[];
  book: { chapter: string; hook: string; scene: string; argument: string; counterpoint: string; readerExercise: string; futureSignal: string; revisit: string; figurePlan: string; rights: string; status: string };
};
