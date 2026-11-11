# Component Specification Format

Read this before dispatching a complex section to a subagent. Write the spec at `docs/research/components/<name>.md` in this format:

```markdown

# <ComponentName> Specification

## Overview

- Target file: `src/components/<ComponentName>.tsx`
- Interaction model: <static | click | scroll | time>

## DOM Structure (from raw.html)

<Exact element hierarchy with tag names, classes, nesting>

## Computed Styles (exact values)

### Container

- display: flex; flex-direction: row; gap: 24px; padding: 60px 80px;

### Heading

- font-size: 48px; font-weight: 400; color: \#230d0d;

### Button

- background-color: \#f195a7; border-radius: 999px; padding: 12px 32px;

## Text Content (verbatim from raw.html)

<Every heading, paragraph, button label -- copy-pasted exactly>

## Assets (local paths)

- /images/products/charm-1.webp

## States & Behaviors

### Hover on card

- transform: none -- scale(1.02)
- transition: transform 0.3s ease

```
