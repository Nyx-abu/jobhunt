#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { dataDir } from './paths.mjs';

export function explainSkip(slug) {
  const logPath = path.join(dataDir(), 'rank-log.jsonl');
  if (!fs.existsSync(logPath)) {
    return `No rank log found at ${logPath}. Run /jobhunt morning first.`;
  }
  const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean);
  // latest entry per slug wins
  let latest = null;
  for (const line of lines) {
    let e;
    try { e = JSON.parse(line); } catch { continue; }
    if (e.slug === slug) latest = e;
  }
  if (!latest) return `Slug "${slug}" not found in rank log.`;
  if (latest.decision !== 'skip') {
    return `Slug "${slug}" was not skipped (decision: ${latest.decision}).`;
  }
  const override = `  Override: /jobhunt apply ${slug} --force`;
  switch (latest.reason) {
    case 'tier':
      return `Skipped: tier
  ${slug} matches "${latest.bundle ?? 'tier-excluded'}" in your profile.yml
${override}`;
    case 'comp':
      return `Skipped: comp
  Cached comp_bands shows starting band ${latest.band ?? 'unknown'}; below your ${latest.floor} floor.
${override}`;
    case 'experience':
      return `Skipped: experience
  Posting requires ${latest.required_level ?? 'higher'} YOE; your profile is "${latest.user_level ?? 'unknown'}".
${override}`;
    case 'fit':
      return `Skipped: low fit (${latest.score ?? '?'}/10)
  Below the 6.5 fit-gate threshold.
${override}`;
    default:
      return `Skipped: ${latest.reason}
  ${latest.detail ?? ''}
${override}`;
  }
}

// CLI entrypoint
if (process.argv[1]?.endsWith('why.mjs')) {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Usage: why.mjs <slug>');
    process.exit(2);
  }
  console.log(explainSkip(slug));
}
