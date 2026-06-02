---
name: jobhunt
description: Scan job portals, rank against your CV, and build tailored application packages (CV + cover letter + interview prep) for the top matches each morning. Use when the user wants to find jobs, tailor a resume, prep for interviews, or run their morning job hunt routine.
user-invocable: true
argument-hint: "[setup | morning | apply <slug-or-url> | status | why <slug> | scan | diagnose]"
---

# jobhunt — Automated Job Application Pipeline

A token-thrifty job-hunting skill: scans portals, ranks against your CV, builds 5 tailored application folders each morning. ~$0.40-0.60 per morning at default settings.

**Quickstart:**
```bash
npx skills add github.com/Nyx-abu/jobhunt
/jobhunt setup       # 7 questions, ~2 minutes
/jobhunt morning     # 5 folders ready in ~/.jobhunt/company/
```

## Mode router

Parse `$ARGUMENTS` (first token = mode):

| Arg | Mode | What it does |
|-----|------|--------------|
| (empty) / "what's ready" | `status` | Today's queue + next-best action |
| `setup` | `setup` | 7-question conversational wizard; writes profile.yml + portals.yml |
| `setup --reset <field>` | `setup` (repair) | Re-ask just one question (country, cv, roles, experience, salary, tiers, cloud) |
| `morning` | `morning` | Full chain: scan → rank → build top 5 packages |
| `apply <slug-or-url>` | `apply` | One-off package for a specific company |
| `apply <slug> --force` | `apply` | Override tier/comp/fit gates |
| `why <slug>` | `why` | Explain why a slug was skipped (zero LLM) |
| `scan` | `scan` | Scan only, no rank/build |
| `diagnose` | `diagnose` | ATS audit of cv.md |

---

## Mode: setup — 7-question conversational wizard

When the user invokes `/jobhunt setup`, follow this flow. Each question is one message; use AskUserQuestion for multiple-choice; wait for the answer before proceeding.

### Q1 — Country

Ask via AskUserQuestion (14 options): "What country are you in / job-hunting from?"

Options: **US · UK · EU · CA · AU · SG · IN · BR · DE · NL · IE · UAE · MX · other**

On answer:
- Read `config/locales/{country_code_lowercase}.yml` into memory using `js-yaml`.
- If `other`: ask one follow-up — "What currency? (e.g. USD, EUR)" — and create a minimal locale dict: `{currency: <answer>, pdf_format: "a4", date_format: "MMM YYYY", language: "en", salary_floor: null}`.
- Hold the locale dict for Q5.

### Q2 — CV input

Ask via AskUserQuestion (3 options): "How do we get your CV?"

Options:
1. **File path** — PDF or DOCX (recommended)
2. **LinkedIn URL** — fallback, may be incomplete
3. **Skip** — create cv.md template; fill in by hand

#### Branch 1: File path

Ask for the path. Then:

1. Detect extension. `.pdf` → needs `pdf` skill. `.docx` → needs `docx` skill. Other → reject, retry.
2. Check installed via `node scripts/setup-helpers.mjs check-skill <pdf|docx>`. If absent, ask user: *"This needs the `<X>` skill. Install via `npx skills add ...`? (y/N)"*. On 'y': run the install command. On 'N': abort.
3. Invoke the `pdf` or `docx` skill to extract text from the file.
4. ONE LLM call to structure the extracted text into YAML with these keys: `headline, years_experience, top_skills, hero_proof_points, keywords_owned, gaps_known, employers, education, links`. Write the structured YAML to `$JOBHUNT_HOME/.cache/cv-summary.yml`. Write a markdown version to `$JOBHUNT_HOME/cv.md`.
5. Print: *"CV extracted to `$JOBHUNT_HOME/cv.md`. Review it before your first morning run — PDF extraction is sometimes lossy. Continuing setup..."*

#### Branch 2: LinkedIn URL

Ask for the URL. Then:

1. Run `node scripts/linkedin-scrape.mjs <url>`. Script outputs JSON on stdout (success) or stderr (failure).
2. On `{ok: true, text}`: same extraction LLM call as Branch 1 #4.
3. On `{ok: false, reason: "login_wall"}`: print *"⚠️ LinkedIn served a login wall (anonymous scraping blocked). Two options: (a) Install `setup-browser-cookies` skill, export your cookies, retry. (b) Upload a PDF or DOCX instead (recommended). Which? (a/b)"* — branch on answer.
4. On `{ok: false, reason: "thin_content" | "network_or_timeout"}`: print failure reason, ask user to upload a PDF/DOCX instead.
5. After ANY successful LinkedIn extraction, ALWAYS print: *"⚠️ Auto-extracted from LinkedIn. Data may be incomplete or inaccurate due to LinkedIn's anti-scraping measures. For best results, upload your real CV (PDF or DOCX) by re-running `/jobhunt setup --reset cv`."*

#### Branch 3: Skip

Write `$JOBHUNT_HOME/cv.md` with this template:
```markdown
# [Your Name]

[Headline — one line describing your role/level]

## Summary
[2-3 sentences: who you are, what you do, what you're looking for]

## Experience
### [Company A] — [Role A] — [Dates]
- Accomplished X, measured by Y, by doing Z

## Education
- [Degree, School, Year]

## Skills
[Comma-separated keywords]

## Links
- GitHub: [url]
- LinkedIn: [url]
```

Print: *"Template written to $JOBHUNT_HOME/cv.md. Edit it, then re-run `/jobhunt setup --reset cv` when ready. Continuing setup for now..."*

### Q3 — Target roles (open-text)

Ask: *"What roles are you targeting? Give a one-liner — e.g. 'junior backend, AI engineer' or 'frontend, React/Next.js'."*

Store split-by-comma into `target_roles.primary`.

### Q4 — Experience level

Ask via AskUserQuestion (3 options): "What's your experience level?"

Options: **junior (0-2 YOE) · mid (3-6 YOE) · senior (7+ YOE)**

Store as `experience_level`. The rank step in `/jobhunt morning` uses this to filter incompatible postings:
- junior → drop Senior/Staff/Principal postings
- mid → drop Junior/Principal postings
- senior → drop Junior postings

### Q5 — Minimum salary

Read locale dict from Q1. Pre-fill from `salary_floor`.

Ask via AskUserQuestion (3 options): *"What's the minimum starting salary you'll consider? Default for {country_name}: {currency} {salary_floor}."*

Options: **Use locale default · Lower it · Raise it**

On "Lower"/"Raise": ask for the new number via follow-up. For "other" locale where `salary_floor` is null: directly ask for the number.

Store as `compensation.salary_floor_{currency_lowercase}` and update derived `compensation.minimum` + `compensation.target_range` strings.

### Q6 — Skip company tiers

Ask via AskUserQuestion with `multiSelect: true`: "Which company tiers do you want to skip? (Multi-select; default = nothing)"

Options:
- **None** — surface everything (recommended for first run)
- **Frontier AI labs** (Anthropic, OpenAI, Mistral, Cohere, etc.) — 1000:1 odds
- **Decacorns** ($10B+ valuations) — applicant flood
- **Public companies** — slower hiring loops
- **Defense / clearance-required** — visa/citizenship gates

Bundle slug mappings (see `docs/recipes/abdurs-stack.md` for full rationale):

- **Frontier:** `anthropic openai mistral mistral-ai cohere hugging-face black-forest-labs stability-ai isomorphic-labs wayve`
- **Decacorns:** `salesforce spotify twilio vercel perplexity synthesia celonis hellofresh n26 trade-republic sumup getyourguide vinted weights-and-biases coreweave glean`
- **Public:** (decacorns subset plus) `intercom liveperson genesys hootsuite`
- **Defense:** `palantir helsing`

Concatenate selected bundle slug lists into `company_filter.hard_exclude_slugs`.

### Q7 — Cloud cron setup

Ask via AskUserQuestion: *"Want the cloud cron 'wake up to ready folders' setup? Requires GitHub account + Claude routines access. v1 = manual setup; v1.1 will automate it."*

Options: **No, local-only (recommended) · Yes (manual setup) · Later**

For "Yes": detect `gh` via `node -e "import('./scripts/setup-helpers.mjs').then(m => console.log(m.hasGhCli()))"`. Then print `docs/cloud-cron-setup.md` contents inline. If `gh` detected, prepend: *"ℹ️ Detected `gh` CLI — v1.1 will automate the steps below. For now, here are the manual instructions:"*.

### After Q7 — write configs

Write three files:

1. **`$JOBHUNT_HOME/profile.yml`** — start from `config/profile.example.yml`, then patch with Q1-Q7 answers (candidate identity from CV extraction, target_roles from Q3, experience_level from Q4, compensation from Q5+locale, company_filter.hard_exclude_slugs from Q6, location.country from Q1).
2. **`$JOBHUNT_HOME/portals.yml`** — start from `config/portals.example.yml`. Patch: `title_filter.positive` += keywords from Q3; `title_filter.negative` += seniority terms from Q4; set `enabled: false` on `tracked_companies` whose slug matches Q6 exclusions.
3. **`$JOBHUNT_HOME/.cache/cv-summary.yml`** — already written in Q2 Branch 1/2; skip if Branch 3 was taken.

Print completion:
```
Setup complete.

Files written:
  ~/.jobhunt/profile.yml
  ~/.jobhunt/portals.yml
  ~/.jobhunt/cv.md
  ~/.jobhunt/.cache/cv-summary.yml

Next step:
  /jobhunt morning      # ~15 min, builds 5 application folders
```

### `/jobhunt setup --reset <field>` repair mode

If `$ARGUMENTS == "setup --reset <field>"`:
- Read current `$JOBHUNT_HOME/profile.yml` (and portals.yml).
- Jump directly to the question for that field; skip all others.
- Valid fields: `country`, `cv`, `roles`, `experience`, `salary`, `tiers`, `cloud`.
- Update only that field; preserve all others.

---

## Mode: morning

The full chain runs locally (default) or in the cloud (if opted in during Q7).

**Hard rules:**
- Never auto-submit applications. Produce artifacts; user submits.
- Never invent skills, metrics, employers, or interview-question sources. Honest about gaps.
- Score-gate: skip if fit < 6.5/10 (after CV match).
- Tier-gate: skip if slug in `company_filter.hard_exclude_slugs` (zero LLM tokens).
- Salary-floor gate: skip if cached `comp_bands` lower bound < user's salary floor.
- Each skip writes a JSON line to `$JOBHUNT_HOME/data/rank-log.jsonl` so `/jobhunt why <slug>` can explain it.

**Step 1 — Scan (zero LLM tokens):**
```bash
node vendor/career-ops/scan.mjs --verify
```

**Step 2 — Build/refresh CV summary cache.** Hash `$JOBHUNT_HOME/cv.md`. If unchanged + `.cache/cv-summary.yml` exists, skip. Otherwise one LLM call to rebuild.

**Step 3 — Rank** — One LLM call. Inputs: cv-summary + pending entries + cached comp_bands. Outputs table to `$JOBHUNT_HOME/data/pipeline.md` with columns: Rank · Slug · Role · Location · Fit/10 · Comp est · Why. Top 5 by Fit are the morning's apply queue. Anything < 6.5 stays in pipeline for tomorrow's re-rank.

**Step 4 — Parallel apply workers (N=5)** — Use Task tool with `subagent_type=general-purpose` and `run_in_background=true`. Each worker has a 30K token budget. Worker steps (inline this verbatim per worker):
  - Step 0: tier-gate (zero LLM). Skip if slug in `hard_exclude_slugs`.
  - Step 1: resolve JD via WebFetch.
  - Step 2: extract 15-20 keywords (one LLM call, budget 2.5K in / 400 out).
  - Step 3: score + 3-gap report + comp estimate (one LLM call, budget 1.5K in / 300 out). Skip if fit < 6.5 OR comp < floor.
  - Step 4: tailor CV (bundled LLM call, budget 6K in / 2.5K out). Render to PDF via `node vendor/career-ops/generate-pdf.mjs`.
  - Step 5: cover letter (one LLM call, budget 3K in / 600 out). Render to PDF.
  - Step 6: apply-links.txt.
  - Step 7: mock-interview pack — cache lookup → 3 WebSearch queries if uncached → one bundled LLM call (8K in / 3K out). Render to PDF.

**Step 5 — Morning brief.** Write `$JOBHUNT_HOME/company/.morning-{YYYY-MM-DD}.md` with the ranked queue, skip reasons, run stats.

**Token budget:** ~50K input + 20K output total ≈ $0.40-0.60 at Sonnet 4.6 rates.

---

## Mode: apply <slug-or-url>

On-demand one-off. Same chain as one morning worker. Honors `--force` flag to bypass tier+comp+fit gates.

```bash
node vendor/career-ops/scan.mjs --company <slug>   # if URL not given
# Then worker steps 0-7 from morning mode
```

---

## Mode: why <slug>

Zero-LLM lookup. Run:
```bash
node scripts/why.mjs <slug>
```
Print output directly. No further processing.

---

## Mode: status

No-args default. Steps:

1. **Auto-pull** (silent unless something changed): if `$JOBHUNT_HOME` is a git repo with a remote, run `git fetch origin main && [behind?] git pull --rebase origin main`.
2. **Read today's brief** if `$JOBHUNT_HOME/company/.morning-{YYYY-MM-DD}.md` exists. Render the queue at the top.
3. **Render status block:** today's brief presence, cloud routine status, last commit, CV mtime, profile/portals validity, pending offers, processed lifetime, next-best action.

Trigger phrases routing to status: "what's ready", "show me today's queue", "morning brief", "anything new".

---

## Mode: scan

Local zero-LLM scan, appends to `$JOBHUNT_HOME/data/pipeline.md`. No ranking, no LLM calls.

```bash
node vendor/career-ops/scan.mjs --verify
```

---

## Mode: diagnose

One LLM call ATS audit of `$JOBHUNT_HOME/cv.md` + target role from profile.yml. Output to `$JOBHUNT_HOME/diagnose-{YYYY-MM-DD}.md`. Combines: ATS-killer formatting flags, section-by-section weakness, top-5 fixes by impact, keyword research vs job market.

---

## Hard rules (preserved from v0)

- Never auto-submit applications. Stop at "ready to apply."
- Never invent skills, metrics, employers, or interview-question sources.
- Cite every sourced interview question (Glassdoor/Blind URL); tag inferred ones `[inferred from JD]`.
- Liveness-check JD URLs before tailoring; skip stale.
- Location filter enforced both at scan and at apply.
- Score-gate is honest, not optimistic.

---

## File layout (under `$JOBHUNT_HOME`, default `~/.jobhunt`)

```
$JOBHUNT_HOME/
├── profile.yml                 # user's profile (written by /jobhunt setup)
├── portals.yml                 # user's portal config (written by /jobhunt setup)
├── cv.md                       # user's CV (markdown source)
├── data/
│   ├── pipeline.md             # ranked pending offers
│   ├── applications.md         # historical tracker
│   ├── scan-history.tsv        # raw scan log
│   └── rank-log.jsonl          # /jobhunt why source
├── .cache/
│   ├── cv-summary.yml          # built once per cv.md change
│   ├── cv-summary.hash         # md5 of cv.md
│   └── research/{slug}__{role-family}.yml
└── company/
    ├── .morning-{YYYY-MM-DD}.md
    └── {slug}/                 # one folder per processed company
        ├── cv.{html,pdf}
        ├── cover-letter.{html,pdf}
        ├── mock-interview.{html,pdf}
        ├── apply-links.txt
        ├── jd.md
        ├── keywords.yml
        └── report.md
```
