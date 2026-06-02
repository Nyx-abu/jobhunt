# Vendored fork of career-ops

This directory is a vendored fork of [career-ops](https://github.com/santifer/career-ops) by Santiago Fernandez, used here as the engine under jobhunt.

**License:** MIT. Original license preserved in [`LICENSE.upstream`](LICENSE.upstream).

## Why vendor?

- Self-contained install — `git clone jobhunt && npm install` works without external deps
- Cross-platform path fixes (Windows `%USERPROFILE%`, macOS/Linux `$HOME`) live in the fork
- Jobhunt-specific wizard hooks and locale handling stay isolated

## Patches applied (vs upstream)

1. All hardcoded paths replaced with `$JOBHUNT_HOME` resolver from `../../scripts/paths.mjs`.

## Upstream sync policy

General bug fixes flow upstream as PRs. Jobhunt-specific features stay in the fork.
