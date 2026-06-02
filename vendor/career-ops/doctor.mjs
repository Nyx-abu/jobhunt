#!/usr/bin/env node

/**
 * doctor.mjs — Setup validation for career-ops
 * Checks all prerequisites and prints a pass/fail checklist.
 */

import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { configDir, jobhuntHome } from '../../scripts/paths.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = jobhuntHome();

// ANSI colors (only on TTY)
const isTTY = process.stdout.isTTY;
const green = (s) => isTTY ? `\x1b[32m${s}\x1b[0m` : s;
const red = (s) => isTTY ? `\x1b[31m${s}\x1b[0m` : s;
const dim = (s) => isTTY ? `\x1b[2m${s}\x1b[0m` : s;

function checkNodeVersion() {
  const major = parseInt(process.versions.node.split('.')[0]);
  if (major >= 18) {
    return { pass: true, label: `Node.js >= 18 (v${process.versions.node})` };
  }
  return {
    pass: false,
    label: `Node.js >= 18 (found v${process.versions.node})`,
    fix: 'Install Node.js 18 or later from https://nodejs.org',
  };
}

function checkDependencies() {
  // node_modules ships with the package, not in $JOBHUNT_HOME
  const pkgRoot = join(__dirname, '..', '..');
  if (existsSync(join(pkgRoot, 'node_modules'))) {
    return { pass: true, label: 'Dependencies installed' };
  }
  return {
    pass: false,
    label: 'Dependencies not installed',
    fix: 'Run: npm install',
  };
}

async function checkPlaywright() {
  try {
    const { chromium } = await import('playwright');
    const execPath = chromium.executablePath();
    if (existsSync(execPath)) {
      return { pass: true, label: 'Playwright chromium installed' };
    }
    return {
      pass: false,
      label: 'Playwright chromium not installed',
      fix: 'Run: npx playwright install chromium',
    };
  } catch {
    return {
      pass: false,
      label: 'Playwright chromium not installed',
      fix: 'Run: npx playwright install chromium',
    };
  }
}

function checkCv() {
  if (existsSync(join(configDir(), 'cv.md'))) {
    return { pass: true, label: 'cv.md found' };
  }
  return {
    pass: false,
    label: 'cv.md not found',
    fix: [
      'Run: /jobhunt setup',
      'Or create $JOBHUNT_HOME/cv.md with your CV in markdown',
    ],
  };
}

function checkProfile() {
  if (existsSync(join(configDir(), 'profile.yml'))) {
    return { pass: true, label: 'profile.yml found' };
  }
  return {
    pass: false,
    label: 'profile.yml not found',
    fix: [
      'Run: /jobhunt setup',
      'Or copy config/profile.example.yml to $JOBHUNT_HOME/profile.yml and edit',
    ],
  };
}

function checkPortals() {
  if (existsSync(join(configDir(), 'portals.yml'))) {
    return { pass: true, label: 'portals.yml found' };
  }
  return {
    pass: false,
    label: 'portals.yml not found',
    fix: [
      'Run: /jobhunt setup',
      'Or copy config/portals.example.yml to $JOBHUNT_HOME/portals.yml',
    ],
  };
}

function checkFonts() {
  // fonts/ ships with the package next to vendor/
  const fontsDir = join(__dirname, '..', '..', 'fonts');
  if (!existsSync(fontsDir)) {
    return {
      pass: false,
      label: 'fonts/ directory not found',
      fix: 'The fonts/ directory is required for PDF generation',
    };
  }
  try {
    const files = readdirSync(fontsDir);
    if (files.length === 0) {
      return {
        pass: false,
        label: 'fonts/ directory is empty',
        fix: 'The fonts/ directory must contain font files for PDF generation',
      };
    }
  } catch {
    return {
      pass: false,
      label: 'fonts/ directory not readable',
      fix: 'Check permissions on the fonts/ directory',
    };
  }
  return { pass: true, label: 'Fonts directory ready' };
}

function checkAutoDir(name) {
  const dirPath = join(projectRoot, name);
  if (existsSync(dirPath)) {
    return { pass: true, label: `${name}/ directory ready` };
  }
  try {
    mkdirSync(dirPath, { recursive: true });
    return { pass: true, label: `${name}/ directory ready (auto-created)` };
  } catch {
    return {
      pass: false,
      label: `${name}/ directory could not be created`,
      fix: `Run: mkdir ${name}`,
    };
  }
}

async function main() {
  console.log('\ncareer-ops doctor');
  console.log('================\n');

  const checks = [
    checkNodeVersion(),
    checkDependencies(),
    await checkPlaywright(),
    checkCv(),
    checkProfile(),
    checkPortals(),
    checkFonts(),
    checkAutoDir('data'),
    checkAutoDir('output'),
    checkAutoDir('reports'),
  ];

  let failures = 0;

  for (const result of checks) {
    if (result.pass) {
      console.log(`${green('✓')} ${result.label}`);
    } else {
      failures++;
      console.log(`${red('✗')} ${result.label}`);
      const fixes = Array.isArray(result.fix) ? result.fix : [result.fix];
      for (const hint of fixes) {
        console.log(`  ${dim('→ ' + hint)}`);
      }
    }
  }

  console.log('');
  if (failures > 0) {
    console.log(`Result: ${failures} issue${failures === 1 ? '' : 's'} found. Fix them and run \`npm run doctor\` again.`);
    process.exit(1);
  } else {
    console.log('Result: All checks passed. You\'re ready to go! Run `claude` to start.');
    console.log('');
    console.log('Join the community: https://discord.gg/8pRpHETxa4');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('doctor.mjs failed:', err.message);
  process.exit(1);
});
