# Recipe: An opinionated jobhunt stack

A worked example of how one real user configured jobhunt for an early-career remote-global search in mid-2026. Not a recommendation — just a concrete data point.

## Context

- Experience level: junior (2 YOE)
- Location: India, open to foreign remote
- Comp floor: $40K USD base (foreign-remote) OR 10 LPA (India)
- Target: Series A-C startups making real revenue or actively hiring

## Why exclude astronomical-tier companies

Frontier AI labs and decacorns are roughly **1000 applicants for every junior role**. The probability-weighted ROI is poor at early career stages. Spending the same effort on Series A-C startups yields ~10-50x higher per-application conversion based on community reports.

## The tier-exclusion bundles

The wizard's Q6 offers these bundles. Each maps to a slug list:

### Frontier AI labs (10 slugs)
anthropic · openai · mistral · mistral-ai · cohere · hugging-face · black-forest-labs · stability-ai · isomorphic-labs · wayve

### Decacorns (16 slugs)
salesforce · spotify · twilio · vercel · perplexity · synthesia · celonis · hellofresh · n26 · trade-republic · sumup · getyourguide · vinted · weights-and-biases · coreweave · glean

### Public companies (4 slugs in addition to decacorns)
intercom · liveperson · genesys · hootsuite

### Defense / clearance-required (2 slugs)
palantir · helsing

## The salary floor

Two values, OR'd:
- foreign-remote: $40K USD base / year (starting)
- India-based: 10 LPA (starting)

If a posting can't credibly clear either, skip. If the band is unknown, surface anyway with `comp_estimate: unknown` (don't pretend confidence).

## Selecting this preset

In `/jobhunt setup`, when Q6 asks "which tiers do you want to skip?", multi-select **all four** (Frontier + Decacorns + Public + Defense). The wizard writes the combined slug list into your `profile.yml > company_filter.hard_exclude_slugs`.

For the salary floor in Q5, use your local currency's default (the wizard pre-fills based on Q1 country choice).

## When to revisit

Re-run `/jobhunt setup --reset tiers` whenever:
- You add a year of experience (the ROI math shifts mid → senior)
- A specific decacorn opens a role you genuinely want (override per-slug with `/jobhunt apply <slug> --force`)
- You take a job and want to refocus the search (e.g. dial down the floor)
