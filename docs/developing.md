# Developing jobhunt

## Setup

```bash
git clone https://github.com/Nyx-abu/jobhunt
cd jobhunt
npm install
npx playwright install chromium --with-deps
npm test
```

## Project structure

See the top-level `README.md` for a high-level tree. Key directories:
- `skills/jobhunt/` — the SKILL.md slash command surface
- `scripts/` — our new code (paths resolver, linkedin scraper, why command, setup helpers)
- `vendor/career-ops/` — vendored fork; patches applied; sync upstream manually
- `config/` — example profile/portals/locales
- `templates/` — CV and cover-letter HTML scaffolds
- `test/` — unit + smoke tests; `test/fixtures/` for synthetic CV + fake portal server

## Adding a locale

Create `config/locales/<cc>.yml` following the schema in any existing file. Submit a PR with the file + an entry in the wizard Q1 option list (`skills/jobhunt/SKILL.md`).

## Adding a vendor patch

If you need to modify a vendored career-ops file:
1. Make the change directly in `vendor/career-ops/`
2. Update `vendor/career-ops/README.upstream.md` "Patches applied" section
3. Note whether the patch should flow upstream

## Tests

```bash
npm test                  # all unit + smoke tests
npm run test:smoke        # just smoke
node --test test/paths.test.mjs   # one file
```

CI runs on macOS, Linux, Windows × Node 18, 20 on every push.

## Releasing

1. Update `CHANGELOG.md`
2. Bump version in `package.json`
3. Tag: `git tag v1.X.Y && git push origin v1.X.Y`
4. The release workflow auto-creates a GitHub release from the tag.

## Architecture decisions

- **Why vendor career-ops?** Self-contained install, no submodule fragility, full control over Windows-path fixes. See `vendor/career-ops/README.upstream.md`.
- **Why `$JOBHUNT_HOME`?** All path handling routes through `scripts/paths.mjs`. One env var, cross-platform, easy to redirect for tests.
- **Why slash-command wizard, not browser-based?** v1 keeps install footprint small. Browser-based wizard is planned for v1.1.
