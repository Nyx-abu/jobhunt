#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Find Claude config dir
const homedir = os.homedir();
const claudeSkillsDir = path.join(homedir, '.claude', 'skills');

if (!fs.existsSync(claudeSkillsDir)) {
  console.log(`[jobhunt] Creating Claude skills directory at ${claudeSkillsDir}...`);
  fs.mkdirSync(claudeSkillsDir, { recursive: true });
}

const targetDir = path.join(claudeSkillsDir, 'jobhunt');
const sourceSkillDir = path.join(projectRoot, 'skills', 'jobhunt');

console.log(`[jobhunt] Installing skill to ${targetDir}...`);

try {
  // If exists, remove old link/dir
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }

  // Create a symlink or copy
  // Attempting to copy for broader cross-platform compatibility (Windows sometimes restricts symlinks)
  fs.cpSync(sourceSkillDir, targetDir, { recursive: true });
  
  console.log(`\n✅ Success! jobhunt skill has been installed to ${targetDir}`);
  console.log(`\nTo get started, open Claude Code and run:\n  /jobhunt setup`);
} catch (err) {
  console.error(`\n❌ Failed to install skill: ${err.message}`);
  process.exit(1);
}
