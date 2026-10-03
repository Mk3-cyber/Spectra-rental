# SPECTRA RENTAL — Universal Cross-Device Workflow

## Architecture

**Canonical code:** private remote Git repository  
**Cloud execution:** Codex Cloud  
**Desktop development:** VS Code + Codex  
**Strategy / requirements:** ChatGPT  
**Mobile / web continuation:** the same published Codex Cloud environment and the same remote repository

The rule is simple: no important change may exist only on one device.

## One-time setup

1. Put the current SPECTRA RENTAL project under Git source control.
2. Create a private remote repository for it.
3. Push the current stable version.
4. Place `AGENTS.md` at the repository root.
5. In Codex on desktop or web, create a Codex Cloud environment connected to that repository.
6. Publish the environment.
7. On mobile, use the published cloud environment for coding tasks rather than relying on local-only files.
8. Keep `main` as the stable branch and use task branches for modifications.

## Universal task format

Use this same structure from ChatGPT web, desktop, or mobile:

PROJECT: SPECTRA RENTAL
TASK: <what must change>
SCOPE: <page, component, or whole site>
PRESERVE: <what must not change>
ACCEPTANCE:
- <observable requirement 1>
- <observable requirement 2>
- <observable requirement 3>
DELIVERY:
- implement the change
- run available checks
- summarize changed files
- keep the work in source control
- do not merge to main without explicit approval

You do not need to use terminal syntax from mobile. The instruction itself is the cross-platform command.

## Standard commands in natural language

### AUDIT
`SPECTRA — AUDIT: Review <scope>. Do not modify files. Return problems grouped by severity, affected files, and recommended fixes.`

### IMPLEMENT
`SPECTRA — IMPLEMENT: Implement <change>. Preserve <constraints>. Run available checks. Keep the change on a separate branch and report changed files.`

### FIX
`SPECTRA — FIX: Diagnose and correct <bug>. Reproduce it first when possible, make the smallest coherent fix, run checks, and report the cause.`

### RESPONSIVE
`SPECTRA — RESPONSIVE: Audit and correct <page/component> for desktop, tablet, and mobile. Preserve the visual identity and functionality.`

### SEO
`SPECTRA — SEO: Audit and implement the requested technical SEO changes for <scope>. Preserve visible design unless a change is necessary.`

### FORM
`SPECTRA — FORM: Implement or modify <form>. Validate fields, error/success states, mobile usability, accessibility, and data-handling behavior.`

### REVIEW CHANGES
`SPECTRA — REVIEW: Review the current branch against main. Look for regressions, broken links/assets, responsive problems, runtime errors, and requirement mismatches. Do not merge.`

### PREPARE RELEASE
`SPECTRA — RELEASE CHECK: Validate the current candidate for release. Run available tests/builds and return blockers, warnings, and manual checks. Do not deploy or merge unless explicitly instructed.`

## Device switching rule

Before changing devices, important work must be committed/pushed or otherwise saved in the active Codex Cloud task.

Local uncommitted VS Code work is not considered synchronized.

## Merge rule

Codex may prepare a branch, commit, and pull request when configured to do so, but `main` should not be merged automatically unless explicitly requested.

## What is not universal

Terminal commands, local file paths, VS Code-specific UI actions, and Windows-only operations cannot literally run on iPhone or the web.

When such an operation is required, convert it into a cloud-executable task whenever possible. If it genuinely requires the local Windows machine, label it clearly as **DESKTOP-ONLY** and provide the cross-platform alternative if one exists.
