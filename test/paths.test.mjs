import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { jobhuntHome, companyDir, cacheDir, configDir, dataDir } from '../scripts/paths.mjs';

test('jobhuntHome defaults to ~/.jobhunt when JOBHUNT_HOME unset', () => {
  delete process.env.JOBHUNT_HOME;
  assert.equal(jobhuntHome(), path.join(os.homedir(), '.jobhunt'));
});

test('jobhuntHome honors JOBHUNT_HOME env var', () => {
  process.env.JOBHUNT_HOME = '/tmp/custom-jobhunt';
  assert.equal(jobhuntHome(), '/tmp/custom-jobhunt');
  delete process.env.JOBHUNT_HOME;
});

test('companyDir is jobhuntHome/company', () => {
  process.env.JOBHUNT_HOME = '/tmp/h';
  assert.equal(companyDir(), path.join('/tmp/h', 'company'));
  delete process.env.JOBHUNT_HOME;
});

test('cacheDir is jobhuntHome/.cache', () => {
  process.env.JOBHUNT_HOME = '/tmp/h';
  assert.equal(cacheDir(), path.join('/tmp/h', '.cache'));
  delete process.env.JOBHUNT_HOME;
});

test('configDir is jobhuntHome (top-level config files live here)', () => {
  process.env.JOBHUNT_HOME = '/tmp/h';
  assert.equal(configDir(), '/tmp/h');
  delete process.env.JOBHUNT_HOME;
});

test('dataDir is jobhuntHome/data', () => {
  process.env.JOBHUNT_HOME = '/tmp/h';
  assert.equal(dataDir(), path.join('/tmp/h', 'data'));
  delete process.env.JOBHUNT_HOME;
});
