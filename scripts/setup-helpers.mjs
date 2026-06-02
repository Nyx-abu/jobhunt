import { execSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const SKILLS_DIR = path.join(os.homedir(), '.claude', 'skills');

export function isSkillInstalled(name) {
  return fs.existsSync(path.join(SKILLS_DIR, name));
}

export function hasGhCli() {
  try {
    execSync('gh --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function detectCvFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.pdf') return 'pdf';
  if (ext === '.docx') return 'docx';
  return null;
}

// CLI: setup-helpers.mjs check-skill <name>  → exits 0 if installed, 1 if not
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('setup-helpers.mjs')) {
  const cmd = process.argv[2];
  const arg = process.argv[3];
  if (cmd === 'check-skill') {
    process.exit(isSkillInstalled(arg) ? 0 : 1);
  } else if (cmd === 'has-gh') {
    console.log(hasGhCli() ? 'yes' : 'no');
  } else {
    console.error('Usage: setup-helpers.mjs check-skill <name> | has-gh');
    process.exit(2);
  }
}
