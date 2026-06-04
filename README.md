# jobhunt

> Wake up to ready job applications.

A Claude Code skill that scans job portals, ranks openings against your CV, and builds tailored application packages — CV + cover letter + interview prep — for the top matches each morning.

[![CI](https://github.com/Nyx-abu/jobhunt/actions/workflows/test.yml/badge.svg)](https://github.com/Nyx-abu/jobhunt/actions/workflows/test.yml)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## What it does

Each morning, jobhunt:
1. Scans ~20 portals (Ashby, Greenhouse, Lever + cross-portal queries)
2. Ranks new openings against your CV
3. Builds the top 5 application packages — tailored CV, cover letter, mock-interview prep — in `~/.jobhunt/company/`

You wake up to 5 folders, review them, submit the ones worth submitting.

## Quickstart

There are two ways to install `jobhunt`:

### Method 1: NPM Auto-Installer (Recommended)
You can install `jobhunt` via NPM. It will automatically detect your local Claude configuration and install the skill seamlessly:
```bash
$ npm install -g jobhunt-skill
$ npx jobhunt-skill
```

### Method 2: Manual / npx skills add
If you are already familiar with the community skills manager, you can use it:
```bash
$ npx skills add github.com/Nyx-abu/jobhunt
```

After installation, run the setup wizard:
```bash
$ /jobhunt setup
  > Country? US
  > CV file path? ./resume.pdf
  > Target roles? Junior backend, AI engineer
  > Experience? junior
  > Salary floor? [40000] <enter>
  > Skip tiers? none
  > Cloud cron? later
  Setup complete. Run /jobhunt morning.

$ /jobhunt morning
  Scanning 47 portals... 38 openings found.
  Ranking top 5 against your CV...
  Building applications:
    ✓ langchain-fse-langsmith   8.1/10  ~$50-65K
    ✓ resend-platform-eng       7.9/10  ~$60-80K
    ✓ inngest-applied-ai        7.8/10  unknown
    ✓ pinecone-swe-rag          7.5/10  ~$45-60K
    ✓ supabase-edge-functions   7.4/10  ~$50-70K

  5 folders ready in ~/.jobhunt/company/. Open the top one.
```

Three commands · seven questions · one PDF · working output.

## Features

- **Cross-platform**: macOS, Linux, Windows
- **13 locales**: US, UK, EU, CA, AU, SG, IN, BR, DE, NL, IE, UAE, MX
- **Hybrid mode**: local-only by default; optional cloud cron for "wake up to ready folders"
- **Honest about skips**: `/jobhunt why <slug>` explains why each opening was skipped
- **Token-thrifty**: ~$0.40-0.60 per morning at default settings (Anthropic API)
- **Zero auto-submit**: produces artifacts; you review and submit

---

> [!TIP]
> **Cross-Agent Testing Initiative**: While `jobhunt` is battle-tested on Claude Code, we want to ensure it works across all agents (Cursor, Gemini CLI, Antigravity, Windsurf, etc.). We need testers! Check out [CONTRIBUTING.md](CONTRIBUTING.md) if you can help verify or improve cross-agent compatibility.

---

## Modes

```
/jobhunt setup              # 7-question wizard (first run)
/jobhunt morning            # full chain: scan + rank + build top 5
/jobhunt apply <slug-or-url># one-off package for a specific company
/jobhunt status             # today's queue + next-best action
/jobhunt why <slug>         # explain why a slug was skipped
/jobhunt scan               # scan only, no rank/build
/jobhunt diagnose           # ATS audit of cv.md
```

## Docs

- [Quickstart](docs/quickstart.md) — local-only flow
- [Cloud cron setup](docs/cloud-cron-setup.md) — power-user upgrade
- [Custom portals](docs/custom-portals.md) — add your own companies
- [Developing](docs/developing.md) — for contributors
- [Recipes](docs/recipes/) — opinionated configuration examples

## Requirements

- Node.js 18+
- Claude Code
- A CV in PDF or DOCX format (or a LinkedIn profile as a fallback)

## Credits

jobhunt is built on top of [career-ops](https://github.com/santifer/career-ops) by Santiago Fernandez, a comprehensive job-hunting Node toolchain released under the MIT license. We vendor and extend a fork of career-ops in `vendor/career-ops/` — see [`ATTRIBUTION.md`](ATTRIBUTION.md) for the full credits list.

Resume-tailoring prompts are adapted from the resume-diagnoser, resume-recruiter, resume-rewriter, and resume-hiring-manager skill patterns.

The skill installer machinery is from [obra/superpowers](https://github.com/obra/superpowers).

## License

MIT — see [LICENSE](LICENSE).
