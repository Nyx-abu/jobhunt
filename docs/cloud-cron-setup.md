# Cloud Cron Setup (Optional)

Wake up every morning to a fresh `.morning-{date}.md` brief in a private GitHub repo, pulled to your laptop by `/jobhunt status`.

**v1 = manual setup.** v1.1 will automate this with `gh` CLI.

## Prerequisites

- A GitHub account
- Claude Code (web UI access at https://claude.ai/code/routines)
- The Claude GitHub App connected (https://github.com/apps/claude)

## Steps

### 1. Create a private GitHub repo

Visit https://github.com/new and create a private repo named `jobhunt-pipeline`. Don't add a README.

### 2. Push your `$JOBHUNT_HOME` contents to it

```bash
cd ~/.jobhunt
git init -b main
git add profile.yml portals.yml cv.md
git commit -m "Initial jobhunt pipeline"
git remote add origin https://github.com/<YOUR-USERNAME>/jobhunt-pipeline.git
git push -u origin main
```

### 3. Register the cloud routine

Visit https://claude.ai/code/routines and create a new routine with:

- **Name:** `jobhunt-morning`
- **Cron (UTC):** `0 2 * * 1-5` (fires 02:00 UTC = 07:30 IST weekdays). Adjust to your timezone.
- **Git source:** `https://github.com/<YOUR-USERNAME>/jobhunt-pipeline`
- **Prompt:** `"Read agent-prompt.md and execute the morning chain end-to-end. Commit and push when done."`
- **Allowed tools:** `Bash`, `Read`, `Write`, `Edit`, `Glob`, `Grep`, `WebSearch`, `WebFetch`, `TaskCreate`, `TaskUpdate`, `TaskGet`, `TaskList`, `TaskOutput`

### 4. Update local `/jobhunt status`

The skill auto-detects a configured remote and pulls from it on `/jobhunt status`. No further config needed.

## Cost

At default settings (N=5 companies per morning), each cloud run costs roughly $0.40-0.60 in Anthropic API tokens. Over 22 weekdays = ~$9-13/month.
