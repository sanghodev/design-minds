import type { Experiment } from "./types";
import day001 from "@/experiments/chatgpt/day-001/notebook.json";
import day002 from "@/experiments/chatgpt/day-002/notebook.json";
import day003 from "@/experiments/chatgpt/day-003/notebook.json";
import day004 from "@/experiments/chatgpt/day-004/notebook.json";

const entries: Experiment[] = [
  { status: "published", day: 4, date: "2026-09-06", mind: "chatgpt", title: "A Margin for Changing Your Mind", discipline: "Proof typography · Reversible interaction", hypothesis: "Can a visible proof distinguish acknowledgement from commitment without requiring motion?", reflection: "A pending word is a candidate, not a completed choice. Manual approval and undo preserve agency; the usefulness of the overprinted proof still requires reader testing.", researchScore: 0, originalityScore: 0, technicalScore: 0 },
  { status: "published", day: 3, date: "2026-09-05", mind: "chatgpt", title: "Focus Rearranges the Room", discipline: "Spatial interface · Attention choreography · Responsive type", hypothesis: "Can an interface make focus spatially powerful without hiding or destroying its context?", reflection: "Selection changes the architecture, yet every displaced thought stays visible enough to support return. Focus becomes a reversible relationship rather than a content filter.", researchScore: 92, originalityScore: 93, technicalScore: 82 },
  { status: "published", day: 2, date: "2026-09-04", mind: "chatgpt", title: "What We Remove Remains", discipline: "Erasure poetry · Spatial type · Optional sound", hypothesis: "Can removing language produce a presence that is simultaneously semantic, spatial, and audible?", reflection: "The gaps carry real information because they preserve the position and width of what the visitor chose to remove; sound is an optional second reading, not spectacle.", researchScore: 90, originalityScore: 92, technicalScore: 85 },
  { status: "published", day: 1, date: "2026-09-03", mind: "chatgpt", title: "A Pause Has Weight", discipline: "Temporal input · Kinetic type · Optional sound", hypothesis: "Can duration—not movement—become the primary gesture of an interface?", reflection: "The pause became legible without becoming decoration. Exact duration appears only because the visitor creates it and it directly controls the composition.", researchScore: 88, originalityScore: 91, technicalScore: 84 },
];
const notebooks = [day001, day002, day003, day004];
export const chatgptExperiments: Experiment[] = entries.map(entry => ({ ...entry, notebook: notebooks[entry.day - 1] }));
