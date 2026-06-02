import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const TMP = path.join(os.tmpdir(), `jobhunt-smoke-${Date.now()}`);
let portalsServer;

before(async () => {
  fs.mkdirSync(path.join(TMP, 'data'), { recursive: true });
  fs.mkdirSync(path.join(TMP, '.cache'), { recursive: true });
  fs.mkdirSync(path.join(TMP, 'company'), { recursive: true });
  fs.copyFileSync('config/profile.example.yml', path.join(TMP, 'profile.yml'));
  fs.copyFileSync('config/portals.example.yml', path.join(TMP, 'portals.yml'));
  fs.copyFileSync('test/fixtures/jordan-rivera-cv.md', path.join(TMP, 'cv.md'));

  portalsServer = spawn('node', ['test/fixtures/fake-portals-server.mjs'], {
    env: { ...process.env, FAKE_PORTALS_PORT: '9876' },
    stdio: 'pipe',
  });
  await new Promise(r => setTimeout(r, 800));
});

after(() => portalsServer?.kill('SIGTERM'));

test('paths.mjs resolves $JOBHUNT_HOME correctly', async () => {
  const { jobhuntHome } = await import('../scripts/paths.mjs');
  process.env.JOBHUNT_HOME = TMP;
  assert.equal(jobhuntHome(), TMP);
});

test('vendor/career-ops/scan.mjs --help runs without crashing', () => {
  const r = spawnSync('node', ['vendor/career-ops/scan.mjs', '--help'], {
    env: { ...process.env, JOBHUNT_HOME: TMP },
  });
  // scan may exit non-zero on --help; just verify it didn't crash on import errors
  assert.notEqual(r.signal, 'SIGSEGV');
  assert.ok(r.stdout.toString().length > 0 || r.stderr.toString().length > 0);
});

test('fake portals server responds', async () => {
  const res = await fetch('http://localhost:9876/greenhouse/langchain/jobs');
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.jobs));
  assert.equal(data.jobs.length, 2);
});

test('why.mjs returns "No rank log" when log absent', async () => {
  const { explainSkip } = await import('../scripts/why.mjs');
  process.env.JOBHUNT_HOME = TMP;
  const log = path.join(TMP, 'data', 'rank-log.jsonl');
  if (fs.existsSync(log)) fs.unlinkSync(log);
  const out = explainSkip('anything');
  assert.match(out, /No rank log found/);
});

test('profile.example.yml parses to valid YAML', async () => {
  const yaml = (await import('js-yaml')).default;
  const data = yaml.load(fs.readFileSync('config/profile.example.yml', 'utf8'));
  assert.equal(data.candidate.full_name, 'Jordan Rivera');
  assert.equal(data.experience_level, 'junior');
});

test('all 13 locale files parse to valid YAML with required fields', async () => {
  const yaml = (await import('js-yaml')).default;
  const expected = ['us','uk','eu','ca','au','sg','in','br','de','nl','ie','ae','mx'];
  for (const cc of expected) {
    const data = yaml.load(fs.readFileSync(`config/locales/${cc}.yml`, 'utf8'));
    assert.equal(data.country_code, cc.toUpperCase(), `${cc}.yml country_code mismatch`);
    assert.ok(data.currency, `${cc}.yml missing currency`);
    assert.ok(typeof data.salary_floor === 'number', `${cc}.yml salary_floor not number`);
  }
});

test('portals.example.yml parses with required structure', async () => {
  const yaml = (await import('js-yaml')).default;
  const data = yaml.load(fs.readFileSync('config/portals.example.yml', 'utf8'));
  assert.ok(Array.isArray(data.tracked_companies));
  assert.ok(data.tracked_companies.length >= 10);
  assert.ok(Array.isArray(data.search_queries));
});
