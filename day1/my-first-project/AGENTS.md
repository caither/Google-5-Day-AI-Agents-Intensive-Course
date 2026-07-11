
# Repository Engineering Notebook Guidelines

This repository treats documentation and development context as first-class assets.

The goal is not perfect categorization.

The goal is sustainable long-term engineering records.

In addition to source code, contributors and agents should continuously preserve:

- development reasoning
- architecture considerations
- debugging process
- experimental results
- technical tradeoffs
- implementation decisions
- operational knowledge

All of these are maintained as an Engineering Notebook under `notes/`.

---

# Repository Structure

```text
repo/
├── src/
├── notes/
│   ├── daily/
│   └── reference/
├── README.md
├── AGENTS.md
```

---

# Core Philosophy

## 1. Continuous Recording

Always prefer recording context over relying on memory.

Even incomplete notes are valuable.

---

## 2. Low Maintenance Cost

Avoid over-engineered documentation structures.

Favor lightweight incremental notes.

---

## 3. Progressive Refinement

Write quickly into `notes/daily/` during development.

Only move stable, reusable knowledge into `notes/reference/`.

---

## 4. Searchability

All notes should:

* use Markdown
* include YAML Frontmatter
* use clear tags

This improves usability with:

* GitHub search
* VSCode search
* ripgrep
* Obsidian
* AI/RAG indexing

---

# Directory Rules

# notes/

Engineering Notebook root.

Purpose:

* preserve development context
* improve maintainability
* support debugging and incident tracing
* retain technical knowledge
* support future contributors and AI agents

---

# notes/daily/

## Purpose

Append development activity continuously.

Agents should update daily notes whenever meaningful development work occurs.

Daily notes may contain:

* problem analysis
* debugging steps
* command experiments
* architecture thinking
* temporary findings
* TODOs
* tradeoffs
* pitfalls
* implementation notes
* benchmark results
* failed approaches

Daily notes do NOT need to be clean or complete.

Priority:

> Record quickly rather than organize perfectly.

---

## Naming Convention

```text
YYYY-MM-DD.md
```

Example:

```text
daily/
├── 2026-05-10.md
├── 2026-05-11.md
```

---

## Daily Note Format

Every daily note MUST begin with YAML Frontmatter.

Template:

```md
---
title: GDAL COG Pipeline
date: 2026-05-10
tags:
  - gdal
  - cog
  - docker
  - raster
status: testing
---

# Topic

> Current UTC time

## Background and Problem

...

## Attempted Solutions

...

## Results

...

## TODO

...
```

---

# notes/reference/

## Purpose

Store stable long-term reference knowledge.

Examples:

* SOPs
* cheatsheets
* deployment procedures
* best practices
* architecture summaries
* troubleshooting guides
* command references
* environment setup
* operational runbooks

---

## Naming Convention

Use descriptive filenames.

Examples:

```text
reference/
├── gdal-cheatsheet.md
├── docker-offline-install.md
├── ESXi-notes.md
```

---

## Reference Document Format

Reference documents MUST also use YAML Frontmatter.

Template:

```md
---
title: GDAL Cheatsheet
datetime: 2026-05-10T09:10:00Z
tags:
  - gdal
  - raster
  - geotiff
status: stable
---

# Common Commands

...

# Troubleshooting

...

# References

...
```

---

# Agent Behavior Rules

## Development Logging

When modifying code, agents SHOULD:

1. Update or append the corresponding daily note.
2. Record important reasoning and tradeoffs.
3. Preserve failed attempts if technically meaningful.
4. Keep notes concise but information-dense.

---

## Reference Promotion

If knowledge becomes stable and repeatedly useful:

* move or summarize it into `notes/reference/`
* convert temporary findings into reusable documentation

Examples:

* deployment procedures
* Docker setup
* GDAL conversion patterns
* ESXi operational notes
* performance tuning knowledge

---

## Documentation Expectations

Agents SHOULD prefer:

* short paragraphs
* bullet lists
* command examples
* reproducible steps
* explicit assumptions

Agents SHOULD avoid:

* excessive prose
* redundant explanations
* large unstructured dumps

---

# Git Commit Rules

Commit messages should remain concise.

Commits describe:

> what changed

NOT the entire development process.

---

## Recommended Commit Format

```text
feat: add COG export
fix: correct nodata handling
refactor: simplify docker pipeline
docs: update GDAL notes
test: add raster conversion tests
```

---

# Recommended Workflow

## During Development

Write directly into:

```text
notes/daily/YYYY-MM-DD.md
```

Do not block development on documentation quality.

---

## After Stabilization

Promote reusable knowledge into:

```text
notes/reference/
```

to build long-term technical documentation.

---

# Engineering Notebook Goal

Build an Engineering Notebook that is:

* maintainable
* searchable
* transferable
* collaborative
* AI-friendly
* operationally useful
* sustainable over time

---

# Preferred Documentation Style

Prefer:

* Markdown
* YAML Frontmatter
* explicit tags
* UTC timestamps where relevant
* reproducible commands
* concise technical writing

---

# AI Agent Guidance

AI agents operating in this repository should:

* preserve technical context
* avoid destructive rewrites of notes
* append rather than replace historical records
* maintain traceability of technical decisions
* prioritize clarity and future maintainability

When uncertain:

> leave lightweight notes rather than omit context entirely.

