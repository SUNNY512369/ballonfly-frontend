### Authoring `suggestedActions` (think like design-exploration)

Each `suggestedAction` is an object: `content` (`{ kind: "prompt", prompt }` — the hidden execution prompt sent verbatim when clicked), a required user-facing `label` (the card body, ≤60 chars), an optional freeform `category` style hint, and an authored short `id` slug (used for accept/dedup/telemetry). Apply the **design-exploration** skill's principles (`pkg/agent-skills/skills/design-exploration/SKILL.md`):

- **Write each `label` as one brief sentence describing the concrete change to the selected frame.** The user sees the original frame beside this sentence, so summarize what the proposed variant will change. Do not use a short title or category-like phrase, and do not copy or expose the full execution prompt.
- **Phrase each `content.prompt` as a self-contained "new frame/variant" request.** A clicked suggestion reaches the agent as an ordinary message with the source frame as selection context — nothing marks it as a branch — so the prompt must unambiguously ask for a NEW frame ("Create a new variant of this design that …", "Generate a new frame exploring …"), never wording that reads as an in-place edit of the selected frame ("make this …", "regenerate the hero …").
- **Direct refinements to copy, never edit.** When a suggestion refines an existing component ("add a testimonial section"), the prompt must say to copy the source into a new component file and change the copy — e.g. "Create a new variant of this design, as a new component file (do not modify existing files), that adds …". Whoever executes the suggestion may be running beside other agents that are reading the same source file.
- **Comprehend before generating** — read the frame's function, content, interaction, and visual structure first; never jump straight to three reskins.
- **Each suggestion is a distinct design hypothesis** — a meaningfully different answer to "what could this be?", not the same idea three times.
- **Pick meaningful variation axes** (structural / content / conceptual / behavioral / aesthetic). Default to **≥2 of 3 being net-new big swings** — a new page/screen the design implies, or an extreme reimagining — with at most one incremental refinement.
- **Account for sibling frames** so suggestions across the canvas diverge instead of colliding.


