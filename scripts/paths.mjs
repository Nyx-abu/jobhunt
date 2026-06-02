import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export function jobhuntHome() {
  return process.env.JOBHUNT_HOME ?? path.join(os.homedir(), '.jobhunt');
}

export function configDir() {
  return jobhuntHome();
}

export function companyDir() {
  return path.join(jobhuntHome(), 'company');
}

export function cacheDir() {
  return path.join(jobhuntHome(), '.cache');
}

export function dataDir() {
  return path.join(jobhuntHome(), 'data');
}

export function templatesDir() {
  return path.join(HERE, '..', 'templates');
}

export function vendorDir() {
  return path.join(HERE, '..', 'vendor', 'career-ops');
}
