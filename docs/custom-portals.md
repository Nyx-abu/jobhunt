# Customizing portals.yml

Your `~/.jobhunt/portals.yml` lists which companies and search queries jobhunt scans each morning. Edit it freely.

## Adding a tracked company

Find the company's ATS:
- Greenhouse: `https://job-boards.greenhouse.io/<slug>`
- Ashby: `https://jobs.ashbyhq.com/<slug>`
- Lever: `https://jobs.lever.co/<slug>`

Add an entry:
```yaml
tracked_companies:
  - name: My Cool Startup
    careers_url: https://jobs.ashbyhq.com/coolstartup
    notes: "Series A, fully remote, hiring junior devs"
    enabled: true
```

## Adding a search query

```yaml
search_queries:
  - name: My Custom Query
    query: 'site:jobs.lever.co "junior" "rust" remote'
    enabled: true
```

## Disabling without removing

Set `enabled: false`.

## Tier-exclusion bundles

Q6 of `/jobhunt setup` writes `company_filter.hard_exclude_slugs` based on bundle selections. To edit by hand, add/remove slugs from that list in `~/.jobhunt/profile.yml`.

## Location filter

```yaml
location_filter:
  allow:
    - "Remote"
    - "United States"
    - "Europe"
  block:
    - "On-site only"
    - "Must be located in"
```

Empty location string on a job → passes (no penalty for missing data). Any `block` keyword present → rejects. `allow` non-empty → must match at least one keyword.

## Title filter

Roles are filtered by keyword matches in the job title. At least one positive must match AND zero negatives must match (case-insensitive).
