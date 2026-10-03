# AGENTS.md — SPECTRA RENTAL

## Purpose
This repository is the single source of truth for the SPECTRA RENTAL website and related web development.

## Cross-device rule
All development must remain recoverable and continuable from ChatGPT/Codex on desktop, web, and mobile through Codex Cloud and source control.

Never assume that local, uncommitted files on one computer will be available from another device.

## Source control
- Treat the remote Git repository as the canonical source of truth.
- Start every task from the latest remote state.
- Never work directly on `main` for a substantive change.
- Create a descriptive branch for each task.
- Do not merge into `main` automatically unless the user explicitly requests it.
- Do not overwrite unrelated changes.
- Before finishing a task, leave the working tree understandable and report any uncommitted work.
- Important completed work must be committed so it is not trapped inside an isolated task environment.

## Change policy
- Preserve the existing visual identity unless the user explicitly requests a redesign.
- Do not remove working functionality unless requested or required to fix a defect.
- Avoid placeholder copy, placeholder images, fake links, and fabricated business data.
- Keep navigation, forms, CTAs, metadata, and internal links consistent across pages.
- Prefer reusable components/styles over duplicated code.
- Make the smallest coherent change that fully satisfies the request.

## Responsive requirements
Every implementation must be checked for:
- desktop
- tablet
- mobile

Avoid horizontal overflow, clipped text, overlapping elements, broken menus, unreadable typography, and touch targets that are too small.

## Quality checks
Before declaring a coding task complete:
1. Inspect the files changed.
2. Run the project's available build, lint, test, or validation commands when they exist.
3. Check for broken local links and missing assets when relevant.
4. Check browser console/runtime errors when browser tooling is available.
5. Verify responsive behavior when the change affects layout.
6. State clearly what was changed, what was tested, and anything that still requires manual review.

## Security
- Never commit passwords, API keys, tokens, private credentials, or secrets.
- Use environment variables or the configured secrets mechanism.
- Do not expose private configuration in client-side code.
- Do not weaken security controls merely to make a feature work.

## Communication
For every completed task, report:
- objective completed
- files changed
- tests/checks performed
- remaining risks or manual checks
- branch/commit/PR status, when applicable

If a request is ambiguous but a safe, reversible interpretation is available, implement the most conservative coherent interpretation and state the assumption.

## OpenAI/Codex-specific work
When OpenAI, ChatGPT, Codex, plugins, or OpenAI APIs are involved, use current official OpenAI documentation rather than relying on stale assumptions.
