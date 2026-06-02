# Attribution

jobhunt builds on the work of several open-source projects and skill patterns.

## career-ops

The Node toolchain that powers scanning, PDF rendering, and tracker management.

- Author: Santiago Fernandez
- Source: https://github.com/santifer/career-ops
- License: MIT (preserved in `vendor/career-ops/LICENSE.upstream`)
- Use here: vendored fork in `vendor/career-ops/`. Cross-platform path fixes (`$JOBHUNT_HOME` resolver) and jobhunt-specific wizard hooks live in the fork.

## Resume skill patterns

Prompt patterns from these Claude Code skills (we adapt them; we don't bundle the skills themselves):

- resume-diagnoser
- resume-recruiter
- resume-rewriter
- resume-hiring-manager

## Skill installer

The `npx skills add` machinery used by Claude Code skill marketplaces.

- Source: https://github.com/obra/superpowers
- License: MIT
- Use here: end users install jobhunt via `npx skills add github.com/Nyx-abu/jobhunt`.

## Project structure inspiration

The Claude Code skill format conventions (`SKILL.md` frontmatter, slash-command registration) follow Anthropic's published conventions.

## How to update

When adding a vendored dependency or borrowing a substantial pattern, add a section here. Be specific about license + source URL.
