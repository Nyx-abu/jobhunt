import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { explainSkip } from '../scripts/why.mjs';

const TMP = path.join(os.tmpdir(), 'jobhunt-why-test');

function setupRankLog(entries) {
  if (fs.existsSync(TMP)) fs.rmSync(TMP, { recursive: true });
  fs.mkdirSync(path.join(TMP, 'data'), { recursive: true });
  const lines = entries.map(e => JSON.stringify(e)).join('\n');
  fs.writeFileSync(path.join(TMP, 'data', 'rank-log.jsonl'), lines);
  process.env.JOBHUNT_HOME = TMP;
}

test('explainSkip returns tier reason with bundle name', () => {
  setupRankLog([
    { slug: 'anthropic-eng', decision: 'skip', reason: 'tier', bundle: 'frontier-labs' },
  ]);
  const out = explainSkip('anthropic-eng');
  assert.match(out, /tier/i);
  assert.match(out, /frontier-labs/);
  assert.match(out, /--force/);
});

test('explainSkip returns comp reason with band', () => {
  setupRankLog([
    { slug: 'tiny-startup', decision: 'skip', reason: 'comp', band: '$28-35K', floor: 40000 },
  ]);
  const out = explainSkip('tiny-startup');
  assert.match(out, /comp/i);
  assert.match(out, /\$28-35K/);
  assert.match(out, /40000/);
});

test('explainSkip returns experience reason', () => {
  setupRankLog([
    { slug: 'senior-role', decision: 'skip', reason: 'experience', required_level: '5+ YOE', user_level: 'junior' },
  ]);
  const out = explainSkip('senior-role');
  assert.match(out, /experience/i);
  assert.match(out, /5\+ YOE/);
  assert.match(out, /junior/);
});

test('explainSkip returns fit reason with score', () => {
  setupRankLog([
    { slug: 'low-fit', decision: 'skip', reason: 'fit', score: 5.3 },
  ]);
  const out = explainSkip('low-fit');
  assert.match(out, /low fit/i);
  assert.match(out, /5\.3/);
});

test('explainSkip returns "not found" for unknown slug', () => {
  setupRankLog([]);
  const out = explainSkip('not-here');
  assert.match(out, /not found/i);
});

test('explainSkip reads only the latest entry per slug', () => {
  setupRankLog([
    { slug: 'foo', decision: 'skip', reason: 'tier', bundle: 'frontier-labs' },
    { slug: 'foo', decision: 'skip', reason: 'comp', band: '$20K', floor: 40000 },
  ]);
  const out = explainSkip('foo');
  assert.match(out, /comp/);
  assert.doesNotMatch(out, /tier/);
});

test('explainSkip handles missing log file gracefully', () => {
  if (fs.existsSync(TMP)) fs.rmSync(TMP, { recursive: true });
  fs.mkdirSync(path.join(TMP, 'data'), { recursive: true });
  process.env.JOBHUNT_HOME = TMP;
  const out = explainSkip('anything');
  assert.match(out, /No rank log found/);
});
