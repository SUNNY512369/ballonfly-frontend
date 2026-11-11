# Podcast Formats and Script Writing

## Format selection

| Format | Description | Best For |
|--------|-------------|----------|
| **Solo explainer** | One host walks through the topic | Tutorials, news summaries, deep dives |
| **Conversational duo** | Two hosts discuss and riff | Making complex topics accessible, entertainment |
| **Interview style** | Host asks questions, expert answers | Technical topics, research papers |
| **Debate** | Two perspectives argue a topic | Controversial or nuanced subjects |
| **Narrative** | Storytelling with narration | Case studies, historical events |

## Format templates with segment timing

### Conversational Duo (recommended default)

| Segment | Duration | Word Count | Speaker Balance |
|---------|----------|------------|-----------------|
| Cold open | 15–30s | 40–75 | 50/50 |
| Setup/intro | 30–60s | 75–150 | 60/40 (Explainer leads) |
| Segment 1 | 3–5 min | 450–750 | 55/45 |
| Segment 2 | 3–5 min | 450–750 | 45/55 |
| Segment 3 | 3–5 min | 450–750 | 55/45 |
| Segment 4 (optional) | 3–5 min | 450–750 | 50/50 |
| Segment 5 (optional) | 3–5 min | 450–750 | 50/50 |
| Takeaways | 1–2 min | 150–300 | 50/50 |
| Outro | 15–30s | 40–75 | 50/50 |

Target overall speaker balance: **no host should have less than 40% of total lines.** The Questioner is not a sidekick — they drive the conversation forward.

### Solo Explainer

| Segment | Duration | Word Count |
|---------|----------|------------|
| Hook | 15–30s | 40–75 |
| Context | 1–2 min | 150–300 |
| Main body (3–4 sections) | 3–5 min each | 450–750 each |
| Summary + CTA | 1–2 min | 150–300 |

### Interview Style

| Segment | Duration | Word Count | Speaker Balance |
|---------|----------|------------|-----------------|
| Host intro | 30–60s | 75–150 | Host only |
| Guest intro | 1–2 min | 150–300 | 70/30 (Host leads) |
| Q&A blocks (4–6) | 3–5 min each | 450–750 each | 30/70 (Guest leads) |
| Rapid fire | 2–3 min | 300–450 | 50/50 |
| Closing | 30–60s | 75–150 | Host only |

## Episode length guidelines

| Content Type | Target Length | Script Word Count |
|-------------|-------------|-------------------|
| News summary | 5-10 min | 750-1,500 words |
| Topic explainer | 10-20 min | 1,500-3,000 words |
| Deep dive | 20-40 min | 3,000-6,000 words |
| Research paper review | 15-25 min | 2,250-3,750 words |

Rule of thumb: ~150 words per minute of audio.

## Script writing: NotebookLM pattern

The two-host format that works (reverse-engineered from Google's Audio Overviews):

- **Host A = "The Explainer"** — knows the material, breaks down concepts
- **Host B = "The Questioner"** — audience surrogate, asks the "wait, why?" questions
- **Dialog rhythm:** alternate short punchy lines with longer explanations. Sprinkle affirmations: "Right.", "Exactly.", "Okay so—"
- **Arc:** open with common misconception → introduce source that challenges it → unpack implications → "so what does this mean for you"
- **Transitions:** "And on that note..." / "Which brings us to..." / "Here's where it gets weird—"

### Structure (target ~150 words per minute of audio)

1. **Cold open** (15–30s) — the single most surprising finding, stated as a question or contradiction
2. **Setup** (30–60s) — what we're covering, why it matters now
3. **Segments** (3–5 × 2–4 min) — one idea each; end each with a mini-hook into the next
4. **Takeaways** (1–2 min) — 3 things to remember
5. **Outro** (15s) — sign-off

**Write for ears, not eyes:** contractions always, no semicolons, no parentheticals. If you wouldn't say it out loud, rewrite it.

**Script format** — one line per utterance, speaker tag in brackets, blank line between speakers. This is the unit you'll chunk for TTS:

```text
[ALEX]: So today we're diving into something that honestly broke my brain a little.

[SAM]: Oh no. What now.

[ALEX]: Okay — you know how everyone says [common belief]? There's this paper from [source] that basically says... the opposite.

[SAM]: Wait. The *opposite* opposite?
```

## Script-only deliverable format

When delivering a script without audio, include these production notes at the end:

```text
PRODUCTION NOTES:
- Total word count: [number]
- Estimated duration: [minutes] (at 150 wpm)
- Segment breakdown: [list segments with word counts]
- Voice recommendations: [suggested voice profiles for each host]
- Music/SFX suggestions: [intro, transitions, outro, background]
```
