# Jobhunt Release Agent Handoff

> **Audience:** any AI agent picking up the remaining release work for this repository.
>
> **Purpose:** complete the public release path for `jobhunt`, including verification, GitHub publication, tagging, external PR work, and wiring the private pipeline to consume the public v1 release.

## Current State

- Repository root: `E:\interview\jobhunt`
- Public repo remote: `origin -> https://github.com/Nyx-abu/jobhunt.git`
- Current branch: `main`
- Verified locally: `npm test` passes (`20/20`)
- Current working tree note: `package-lock.json` is untracked
- Imported agent context available in Codex skill store at `C:\Users\shoto\.codex\skills\jobhunt\SKILL.md`

## What Still Needs To Happen

1. Manual end-to-end verification on macOS, Linux, and Windows.
2. Public GitHub publication and release tagging for `v1.0.0`.
3. An external PR against `awesome-list`.
4. Private pipeline wiring so `jobhunt-pipeline` consumes the public v1 release.

## Goal

Ship the public `jobhunt` package cleanly, then update the private automation so its workflow points at the released public version rather than a local or unpublished copy.

## Constraints

- Do not auto-submit anything on behalf of the user where manual review is required.
- Do not rewrite unrelated user changes.
- Prefer non-destructive commands.
- Use the existing repo structure and docs before inventing new flow.

## Verification Baseline

Before changing anything release-related, confirm the local project still behaves as expected.

```bash
npm test
f

Expected result:

- 20 tests pass
- 0 failures

If this fails, stop and fix the repo before release work continues.

## Task 29: Manual E2E

Perform a manual smoke check on all three target platforms:

- macOS
- Linux
- Windows

The check should confirm that the public package can be installed and the documented entry points still work.

Suggested validation:

```bash
npx skills add github.com/Nyx-abu/jobhunt
/jobhunt setup
/jobhunt morning
```

Acceptance criteria:

- The skill installs cleanly.
- The setup flow is understandable and completes.
- The morning flow produces the expected local artifacts or a clear, documented limitation.

If you do not have access to all three machines, record exactly which platform was not verified and why.

## Task 30: Publish And Tag

Publish the repository publicly, push the release tag, and make the release discoverable.

Canonical commands:

```bash
gh repo create Nyx-abu/jobhunt --public --source . --remote origin
git push -u origin main
git tag v1.0.0
git push origin v1.0.0
```

Important notes:

- If the GitHub repo already exists, do not recreate it.
- If `v1.0.0` already exists, inspect whether it matches the intended release state before retagging anything.
- Keep the published state aligned with the repository docs.

Acceptance criteria:

- Public repo exists and is reachable.
- `main` is pushed.
- Tag `v1.0.0` exists on the remote.

## Task 31: External PR

Open a pull request against the target `awesome-list` project after confirming the list entry is appropriate.

Required inputs before opening the PR:

- the exact target repository
- the target branch
- the list entry content
- the reason the project belongs there

If the target repository is not already known from the current context, discover it from the project’s upstream notes or release plan before taking action.

Acceptance criteria:

- PR is opened against the correct repository.
- The PR body explains the project clearly and succinctly.
- The entry matches the list’s contribution rules.

## Task 32: Wire Private Pipeline To Public V1

Update the private `jobhunt-pipeline` setup so it consumes the public v1 release rather than relying on the local development checkout.

Expected outcome:

- the private pipeline points to the released public package/source
- the private automation continues to work without depending on unpublished local files
- the workflow remains compatible with the release tag and public repo layout

Suggested checks:

- inspect the private pipeline’s install or source reference
- verify any GitHub remote URLs point to the public v1 source
- rerun the relevant private pipeline smoke path after the update

Acceptance criteria:

- private pipeline references the public release source
- no broken local-path dependency remains
- the update is documented in the private pipeline notes or handoff file

## Recommended Execution Order

1. Verify local tests again.
2. Run the manual E2E checks.
3. Publish and tag the public repo.
4. Open the external PR.
5. Repoint the private pipeline to public v1.

## Blockers To Resolve Before Continuing

- Missing GitHub auth for `gh`
- Lack of access to one or more OS targets for manual E2E
- Private pipeline repo not available on this machine
- Unknown `awesome-list` target repository

## Final Exit Criteria

The release work is complete when all of the following are true:

- local tests are green
- platform verification is recorded
- `Nyx-abu/jobhunt` is public and tagged `v1.0.0`
- the external PR is open
- the private `jobhunt-pipeline` setup consumes the public v1 release

