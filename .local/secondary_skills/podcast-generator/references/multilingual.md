# Multilingual and Localized Podcasts

When the target audience speaks a language other than English, follow these guidelines.

## Language selection

- Ask the user what language the podcast should be in during the initial questions
- If the audience is region-specific (e.g., LATAM, Brazil, France), default to the primary language of that region
- If the user doesn't specify, infer from context (e.g., "LATAM market" → Spanish)

## Model selection for non-English

- **Always use `eleven_multilingual_v2`** for non-English scripts — `eleven_turbo_v2_5` has limited language support and may produce artifacts in non-English speech
- Set `stability` slightly higher (0.50–0.55) for non-English languages to reduce mispronunciation
- Test voice IDs with a short sample in the target language before rendering the full episode — not all default voices perform equally across languages

## Voice selection by language

| Language | Recommended Approach |
|----------|---------------------|
| Spanish | Use `client.voices.search()` to find native Spanish voices. Fallback: George and Rachel handle Spanish reasonably well with `eleven_multilingual_v2` |
| Portuguese | Search for native Portuguese voices. Brazilian Portuguese and European Portuguese differ significantly — match the audience |
| French | Search for native French voices |
| Other | Always search for native voices first; multilingual fallbacks as backup |

## Script writing for non-English

- Write the entire script in the target language — do not write in English and translate
- Use natural spoken patterns of the target language, not literal translations of English idioms
- Proper nouns and brand names: keep the original spelling but add phonetic hints in parentheses if the TTS might mispronounce them
- For mixed-language audiences (e.g., Spanglish), be intentional about when and why you switch languages — it should feel natural, not random
