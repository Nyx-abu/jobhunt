# Quickstart — Local mode (no GitHub required)

The simplest jobhunt setup. Zero external accounts beyond Claude Code itself.

## 1. Install

```bash
npx skills add github.com/Nyx-abu/jobhunt
```

This drops jobhunt into your Claude Code skills directory.

## 2. Run setup

```bash
/jobhunt setup
```

Answer 7 questions:
1. **Country** (US/UK/EU/CA/AU/SG/IN/BR/DE/NL/IE/UAE/MX/other)
2. **CV file path** (PDF or DOCX) — or LinkedIn URL — or "skip"
3. **Target roles** (1 line)
4. **Experience level** (junior/mid/senior)
5. **Minimum salary** (locale-defaulted)
6. **Tiers to skip** (default: none)
7. **Cloud cron?** (pick "later" for the simplest setup)

Setup writes:
- `~/.jobhunt/profile.yml`
- `~/.jobhunt/portals.yml`
- `~/.jobhunt/cv.md`

## 3. Run the morning

```bash
/jobhunt morning
```

This takes ~15 minutes. When it finishes, 5 folders are ready in `~/.jobhunt/company/`. Each has:
- Tailored CV (PDF + HTML)
- Cover letter (PDF + HTML)
- Mock interview pack (PDF + HTML)
- Apply links text file

Review each, edit the CV by hand if needed, then submit through whatever portal the company uses.

## 4. Daily flow

After day 1, just run `/jobhunt morning` whenever you want a fresh batch. Or set up the [cloud cron](cloud-cron-setup.md) if you'd rather wake up to ready folders.

## Troubleshooting

- **Playwright install fails on Windows**: try `npx playwright install chromium` (no `--with-deps`). The `--verify` flag in scan gracefully degrades if Chromium is unavailable.
- **PDF skill not installed**: the wizard prompts to install it. Accept (`y`).
- **LinkedIn fetch blocks**: switch to a PDF or DOCX — that's the reliable path.
- **Setup wizard re-run**: `/jobhunt setup --reset <field>` re-asks just one question (country, cv, roles, experience, salary, tiers, or cloud).
