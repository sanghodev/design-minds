# Design Minds — research and publication protocol

The owner's goal is a rigorous, visually compelling year of design inquiry and an eventual book. Read research-framework.json for the Korean editorial framework. This protocol is shared methodology, never permission to read another mind's creative work.

## Daily output contract

Create exactly one next experiment under experiments/<own-mind>/day-NNN/. Before implementation, record a question, one variable to change, constants, and an observation that would challenge the claim. Consult your own unresolved questions and revisit dates. Do not equate shipping with proving the hypothesis.

Research a current signal, a historical precedent, and a technical/accessibility basis using original works, institutional collections, creator documentation, or primary research where accessible. Aim for at least three substantive sources of different kinds. Log actual publication and access dates; use unknown when unavailable. State blocked or unverified sources honestly. A supplier's trend report is not representative evidence of all designers.

Generate at least ten hypotheses with reasoned internal selection scores for originality, visual necessity, interaction meaning, and feasibility. Do not publish decorative scores or fabricated metrics. Explain the chosen hypothesis and strongest rejected alternative.

Implement responsive, keyboard, touch, reduced-motion, and performance support. Preserve stable routes and existing works. Test the real interaction when supported; label untested conditions. Capture initial, active, and reset states of your own work where supported; keep alt text, viewport, input method, version and caption with each capture. Do not substitute invented visuals for documentation.

Before implementation, pass a research-led form gate: explain how today's question and attributed research lead to the layout, color, typography, spatial model and interaction. Do not refill an inherited page shell or change dimensions merely to appear different. Earlier studies supply lessons about failure, ineffective design and unresolved questions, not a required visual lineage. Related forms require a current research rationale. Notebook structure and manuscript fields may stay consistent without prescribing the live experiment's form.

## Media selection, generation and publication resources

Owner direction, recorded 2026-09-11: experiments must not be constrained to HTML/JavaScript. Consider generated still images and video, photography, scans, illustration, sound, 3D and code-native graphics as research materials. Select the medium because of today's question, not a media quota or a need to look different. A code-only work remains appropriate when its research warrants it; generated media should contribute to perception, interaction, meaning or the variable being examined.

Before production, add a media rationale to the notebook's method: which perceptual property is needed, which medium supports it, how the resource participates in the interaction, and why the strongest alternative was rejected. Where media are useful, write a concrete asset brief and actually produce or obtain the resources with available authorized tools. Keep generation attempts, selections and meaningful edits as process evidence. A proposed video, a poster image or a mockup is not a generated playable video; if a tool or source is unavailable, record the missing deliverable and the implemented alternative accurately.

Store resources under the owning experiment's assets directory where bundling supports it; if static serving is required, use a clearly own-mind/day-scoped public asset directory and preserve relative references. Never overwrite another mind's assets. Include all required assets in the reviewed source and full-site publication. Avoid expiring generation URLs as the sole source of a published work.

For days using media, keep asset-ledger.json beside notebook.json. Record each asset's stable ID, file path, role, origin (generated, self-made, licensed or other), creator/source URL where applicable, actual creation/access date, known tool/model, prompt or reproducible brief, selected variant, edits, license/terms reference and verification status, attribution, caption/alt text, and intended web/book use. Use unknown rather than inventing metadata. Link the ledger in validation.md and summarize it in notebook method and book.rights so the exported manuscript retains the relevant provenance. Generated content does not automatically establish publication rights; distinguish verified permissions from unresolved rights without claiming legal certainty.

Test media as part of the work: responsive dimensions and reserved layout space, appropriate compression, deferred loading, playback errors and a meaningful fallback. Give informative images useful text alternatives; provide captions/transcripts when speech or essential audio information requires them. Video needs accessible play/pause controls, a useful poster or static reduced-motion alternative, and no unsolicited audio. Record actual asset sizes and performed playback/input checks in validation.md, not decorative performance scores. State unavailable codecs, device tests or tools as gaps.

For the book, retain original useful-resolution masters where feasible, the displayed derivative, and a figure plan explaining what each contributes to the argument. For moving works, plan a captioned frame sequence with timestamps and a stable link to the interactive work. Keep generated design materials distinct from screenshots documenting implementation and from actual participant observations. Never present generated people, scenes or reactions as research evidence. Existing completed days need media only when a documented revision question justifies it; preserve their original records.

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

Validation must include a short "research-led form" note linking design decisions to today's sources and hypothesis. Record a relevant prior mistake or limitation, the improvement attempted, what was actually tested and what remains uncertain. Carry this evidence into the notebook's method, critique and book argument; do not equate a new appearance with progress. When a lesson changes a reusable procedure or check, record its scope and evidence in own instructions or memory without imposing a visual template.

Every seventh own research day, write synthesis-week-NNN.md in the current own experiment directory: recurring question, changed judgment, a failure, one comparison to make next. Every thirtieth own day, also write chapter-draft-NNN.md with an argument across own studies and a gaps ledger. At the start of every run inspect own pending revisits (including the 30/90-day future-signal review). Do not create another scheduler; these steps run inside the daily task. The book page indexes daily work; synthesis files are manuscript sources retained in Git for later editing.

## Publication gates

Confirm main before changes. Validate notebook structure, regenerate exports, inspect the diff and confirm no other-mind path changed. Run the available build, tests and lint. Test new and old experiment routes, research routes, and downloads. Never claim browser, assistive-technology, or user validation unless performed. Do not hide failing gates.

Commit with chatgpt(day-NNN): title (or the corresponding own-mind prefix), push without force. If main moved, rebase once, rebuild and abort on remaining conflicts. Publish the updated site through the available authorized hosting workflow; GitHub push is not evidence that the live site updated. If hosting or capture is unavailable, retain the completed source and report that exact missing step.

Return the work and notebook links, manuscript location, research sources, verification result, remaining gaps, and the memory lesson. Report what exists, not what the system merely intends to do.
