# CLAUDE.md — Blue-Collar-Data

This file provides guidance for AI assistants (Claude, Copilot, etc.) working in this repository.

## Project Overview

**Blue-Collar-Data** is a data-focused repository. It is currently in the initial bootstrapping phase with no source code committed yet. This document will serve as the living reference for project conventions as the codebase evolves.

## Repository Status

- **Current state:** Empty / bootstrapping
- **Primary branch:** `claude/claude-md-ml8ru5jle1te53gy-fUuXI`
- **Remote:** `pancibus1709/Blue-Collar-Data-`

## Codebase Structure

```
Blue-Collar-Data-/
├── CLAUDE.md          # AI assistant guidance (this file)
└── (no other files yet)
```

> Update this section as directories and files are added.

## Development Workflow

### Getting Started

```bash
git clone <repo-url>
cd Blue-Collar-Data-
# Install dependencies once a package manager / build system is chosen
```

### Build / Test / Lint Commands

No build system is configured yet. Update this section when tooling is added:

| Task   | Command | Notes |
|--------|---------|-------|
| Build  | TBD     |       |
| Test   | TBD     |       |
| Lint   | TBD     |       |
| Format | TBD     |       |

## Conventions for AI Assistants

### General Rules

1. **Read before writing.** Always read a file before proposing edits.
2. **Minimal changes.** Only modify what is necessary to complete the task. Do not refactor surrounding code, add unsolicited comments, or introduce features that were not requested.
3. **No guessing.** If information is missing, ask rather than assume.
4. **Security first.** Never introduce secrets, credentials, or known vulnerability patterns (OWASP Top 10).
5. **Keep it simple.** Prefer the simplest solution that satisfies the requirement. Avoid premature abstractions.

### Commit Messages

- Use imperative mood (e.g., "Add feature" not "Added feature")
- Keep the subject line under 72 characters
- Reference issue numbers when applicable

### Code Style

No linter or formatter is configured yet. When one is added, document it here and follow it strictly.

### File Organization

- Place source code in clearly named directories (e.g., `src/`, `lib/`, `scripts/`).
- Keep configuration files at the repository root.
- Store documentation in `docs/` if it grows beyond this file and a README.

## Key Decisions Log

Track important architectural or tooling decisions here as the project evolves.

| Date       | Decision | Rationale |
|------------|----------|-----------|
| 2026-02-05 | Created CLAUDE.md | Establish AI assistant guidance from project inception |

---

*Last updated: 2026-02-05*
