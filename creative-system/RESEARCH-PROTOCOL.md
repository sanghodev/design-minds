# Design Minds — research and publication protocol

The owner's goal is a rigorous, visually compelling year of design inquiry and an eventual book. Read research-framework.json for the Korean editorial framework. This protocol is shared methodology, never permission to read another mind's creative work.

## Daily output contract

Create exactly one next experiment under experiments/<own-mind>/day-NNN/. Before implementation, record a question, one variable to change, constants, and an observation that would challenge the claim. Consult your own unresolved questions and revisit dates. Do not equate shipping with proving the hypothesis.

Research a current signal, a historical precedent, and a technical/accessibility basis using original works, institutional collections, creator documentation, or primary research where accessible. Aim for at least three substantive sources of different kinds. Log actual publication and access dates; use unknown when unavailable. State blocked or unverified sources honestly. A supplier's trend report is not representative evidence of all designers.

Generate at least ten hypotheses with reasoned internal selection scores for originality, visual necessity, interaction meaning, and feasibility. Do not publish decorative scores or fabricated metrics. Explain the chosen hypothesis and strongest rejected alternative.

Implement responsive, keyboard, touch, reduced-motion, and performance support. Preserve stable routes and existing works. Test the real interaction when supported; label untested conditions. Capture initial, active, and reset states of your own work where supported; keep alt text, viewport, input method, version and caption with each capture. Do not substitute invented visuals for documentation.

## Canonical daily notebook

Add notebook.json matching data/research-types.ts, and attach it to your own data registry. Required fields:

- schemaVersion, recorded (actual writing date), provenance, category, tags, summary, question.
- method (including proposed comparison and whether executed), observation, limitation, nextQuestion.
- sources: title, publisher/author, url, accessed, kind, use, limitation. Also record published date or unknown in kind or an additional field.
- book: chapter, hook, scene, argument, counterpoint, readerExercise, futureSignal, revisit, figurePlan, rights, status.

Write publication prose in Korean for visual designers, typographers, students, and readers curious about design judgment in an AI-mediated world. Use a concrete scene and one argument developed with evidence, not a checklist disguised as an essay. Aim for a useful daily draft (often 600–1,000 Korean words when evidence supports it); never pad or invent material. Shorter honest drafts are acceptable with a clear gap list.

Scene must distinguish implemented behavior, an observed reader session, and imagined illustration. Include a surprising or unresolved moment when one actually exists. Frame futureSignal as observed signal / interpretation / possible future / disconfirming evidence, not an inevitable prediction. Include reader participation beyond viewing a demo. Record a specific revisit day/date.

Book figures require an initial/action/reset sequence or a reason this would misrepresent the work. Save a rights ledger for external assets, citations and fonts; linking is not reproduction permission. Missing images, unavailable capture tools, unverified rights, and untested usability remain explicit gaps.

## Export and accumulation

For ChatGPT, run node scripts/export-chatgpt-book.mjs after editing notebooks. It writes each day's book.md, public/research/chatgpt-book.md and the framework download. These are generated exports; edit notebook.json instead. The archive, notebooks and /book consume the same registered records. The build checks exports for staleness. Never read Gemini paths to write or verify ChatGPT's book. Spark may implement a separate equivalent export for its own records.

Keep session details and validation evidence in experiments/<own-mind>/day-NNN/validation.md: commands and outcomes, input coverage, limitations, source verification and missing figures. Record model/tool versions only when known. Update own memory with changed judgment and unresolved questions, not claims of weight training.

Every seventh own research day, write synthesis-week-NNN.md in the current own experiment directory: recurring question, changed judgment, a failure, one comparison to make next. Every thirtieth own day, also write chapter-draft-NNN.md with an argument across own studies and a gaps ledger. At the start of every run inspect own pending revisits (including the 30/90-day future-signal review). Do not create another scheduler; these steps run inside the daily task. The book page indexes daily work; synthesis files are manuscript sources retained in Git for later editing.

## Publication gates

Confirm main before changes. Validate notebook structure, regenerate exports, inspect the diff and confirm no other-mind path changed. Run the available build, tests and lint. Test new and old experiment routes, research routes, and downloads. Never claim browser, assistive-technology, or user validation unless performed. Do not hide failing gates.

Commit with chatgpt(day-NNN): title (or the corresponding own-mind prefix), push without force. If main moved, rebase once, rebuild and abort on remaining conflicts. Publish the updated site through the available authorized hosting workflow; GitHub push is not evidence that the live site updated. If hosting or capture is unavailable, retain the completed source and report that exact missing step.

Return the work and notebook links, manuscript location, research sources, verification result, remaining gaps, and the memory lesson. Report what exists, not what the system merely intends to do.
