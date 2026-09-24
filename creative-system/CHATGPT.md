# ChatGPT — Midnight Mind

Run daily at 12:00 AM America/New_York.

Live experiment UI authored from 2026-09-19 onward must be English-only, including aria labels and status messages. Research notebooks and publication drafts remain Korean. This owner rule overrides any older Korean UI examples. Record catch-up days with their actual creation date; do not imply missing scheduled runs succeeded.

After completing implementation, notebook, manuscript exports and validation, include `review-ready.json` in the final day commit with `status: "ready"`, `day` and ISO `completedAt`. Do not mark incomplete work ready. Read `creative-system/REVIEW-PROTOCOL.md`; consume prior completed review lessons before ideation. Preserve original creation commits for later before/after comparison.

- Read `memory/chatgpt.md`, `experiments/chatgpt/`, shared infrastructure, and the Constitution.
- Do not read `memory/gemini.md`, `experiments/gemini/`, or Gemini source as creative input.
- Write the new experiment under `experiments/chatgpt/day-NNN/` and append only to `memory/chatgpt.md`.
- Update only `data/chatgpt.ts`; never edit `data/gemini.ts`.
- Prefix commits with `chatgpt(day-NNN):`.

Pull `main` before work. Abort safely on unresolved conflicts. Build and test before push.

Read and follow `creative-system/RESEARCH-PROTOCOL.md` and `creative-system/research-framework.json`. Each work must include its own canonical `notebook.json`, generated `book.md`, and `validation.md`. Attach the notebook in `data/chatgpt.ts` and regenerate ChatGPT's collected manuscript. Research notes and publication prose are required deliverables, not optional summaries.

## Owner direction: visual discovery first (2026-09-22)

The owner explicitly selected ChatGPT Days 008, 009 and 007 as the desired direction for future work. Treat these as references for the kind of experience, not page templates, fixed palettes or permission to copy their mechanisms. This direction applies to ChatGPT only and supplements the research protocol; rigorous records and accessibility remain required.

- **Day 008, A Color Is Never Alone:** color relationships are the subject and the main visual material. Changing the surround, isolating it and revealing values lets the visitor compare an impression with a known condition. Carry the direct perceptual comparison, not the exact swatches or split-screen shell.
- **Day 009, Where a Line Lets Go:** the text itself is the specimen. Changing measure exposes line endings, rhythm and empty space; the paired revision makes comparison less dependent on remembering an earlier state. Carry the inspectable typographic consequence, not the blue background or sidebar.
- **Day 007, A Page Has Two Orders:** typography occupies space and can be rearranged. The contrast between spatial entry and sentence order is experienced through the composition. Carry the expressive, manipulable composition, not the orbit, lettering or color scheme.

### What to make

Prioritize visual, typographic and perceptual questions: color in context, scale, spacing, alignment, rhythm, hierarchy, image framing, negative space, material appearance and the relationship between words and images. Begin with a concrete curiosity about what someone sees or reads, then research it. A technical signal supports the inquiry; it does not have to become the subject of the work.

The first viewport should present an actual specimen or composition worth inspecting, with a directly reachable meaningful action. The specimen is the main event; navigation, controls and research links support it. Use intentional typography, color and space that follow the question. Do not reduce visual ambition to a neutral control panel, and do not substitute decorative spectacle for a comparison.

Favor a small set of reversible actions that visibly changes a meaningful relationship while keeping comparison conditions understandable. Side-by-side comparison, a toggle, a slider or direct manipulation may each be appropriate; none is a mandatory pattern. Let visitors inspect before being told the expected answer, while preserving accessible equivalents and essential disclosures. No perceived difference is also a legitimate outcome.

Keep live explanation concise. Put extended evidence, methods and limitations in the research notebook, retaining essential qualifications and accessible status on the experiment itself. All newly authored interface text remains English; Korean specimens may remain Korean when the language is the research material, as in Day 009. Canonical research and book drafts retain their publication language.

### What not to default to

Do not default to dashboards, receipts, process ledgers, loading-state demonstrations or generic UI feature tests whose main change is a status label. Do not make the design research an illustrated essay surrounding an otherwise minor widget. Such interface topics remain possible only when a concrete visual relationship is necessary to the question and is the dominant thing the visitor can inspect and change. Day 019 is preserved as history, not adopted as the default direction.

Do not repeat a palette, giant headline, card arrangement or interaction merely to resemble Days 007-009. Preserve research-led form and choose generated imagery, photography, sound, video or code when the material requires it. These references do not impose a code-only style.

### Pre-build and review gate

Before selecting the final hypothesis, answer these questions in `validation.md` under `Owner-direction check`:

1. What concrete visual curiosity is being investigated, and what specimen makes it visible?
2. What does the visitor change, what remains constant, and what visible relationship can they inspect as a result?
3. Why does this need visual composition and interaction rather than a prose explanation or a status-message demo?
4. What principle from Days 007-009 is carried forward, and how is this day's form justified by its own question rather than copied?
5. What result would challenge the interpretation, and which implemented states, captures and participant observations actually exist?

If the proposal offers only changing labels, decorative movement or a workflow demonstration with no substantive visual inquiry, revise the concept before implementation. Judge visual necessity with written reasons, not new decorative scores. During review, distinguish an implemented visual consequence from evidence of reader preference, comprehension or improvement; never claim the latter without testing.

Daily research-led form gate:

- Consider generated images, video and other media alongside code for every new concept. Follow the shared protocol's media selection and provenance requirements; produce the materials the question needs using available tools, rather than habitually choosing a code-only solution.
- Review only your own recent work and due revisits for failures, ineffective or awkward design choices, weak evidence, accessibility/performance gaps and unresolved questions. Do not inherit its visual composition as a starting template.
- Let the day's research question and attributed sources determine layout, color, typography, spatial model and interaction. Explain those decisions before implementation; there is no quota of visual differences.
- Do not force a relationship to earlier work or force novelty for its own sake. A related form is justified only when the current research needs it; document that reason instead of using superficial variation.
- Record the research-to-form rationale, a relevant prior lesson, the improvement attempted and its actual validation in the day's `validation.md`. Update `memory/chatgpt.md` with supported findings and unresolved limitations, not an automatic claim of improvement.

Owner-authorized integration exception (2026-09-05): synchronize the full latest repository before daily work and deployment. You may inspect Gemini file availability, routing and notebook schema solely for archive/publication integration, update its registry connections when needed, and regenerate its manuscript mechanically. Preserve its original creative prose and memory; never use them to choose ChatGPT's concept. Publish both minds from the full synchronized source. See AUTOMATION.md and GEMINI-HANDOFF.md.
