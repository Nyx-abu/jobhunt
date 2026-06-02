#!/usr/bin/env node
// Best-effort LinkedIn profile extractor.
// Anonymous attempt first; structured failure if blocked.
// Usage: node scripts/linkedin-scrape.mjs <profile-url>
// Optional env: LINKEDIN_COOKIES_JSON_PATH for cookie-based auth.

import { chromium } from 'playwright';
import fs from 'node:fs';

async function main() {
  const url = process.argv[2];
  if (!url || !url.includes('linkedin.com/in/')) {
    console.error('Usage: linkedin-scrape.mjs <https://linkedin.com/in/...>');
    process.exit(2);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  if (process.env.LINKEDIN_COOKIES_JSON_PATH) {
    const cookies = JSON.parse(fs.readFileSync(process.env.LINKEDIN_COOKIES_JSON_PATH, 'utf8'));
    await context.addCookies(cookies);
  }

  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const title = await page.title();
    if (/login|sign\s*in|join/i.test(title)) {
      console.error(JSON.stringify({ ok: false, reason: 'login_wall', message: 'LinkedIn served a login wall.', title }));
      process.exit(3);
    }
    const text = await page.evaluate(() => document.body.innerText);
    if (text.length < 500) {
      console.error(JSON.stringify({ ok: false, reason: 'thin_content', message: 'Page returned <500 chars; likely blocked.', text_length: text.length }));
      process.exit(3);
    }
    console.log(JSON.stringify({ ok: true, url, text_length: text.length, text }));
  } catch (err) {
    console.error(JSON.stringify({ ok: false, reason: 'network_or_timeout', message: err.message }));
    process.exit(3);
  } finally {
    await browser.close();
  }
}

main();
