/**
 * GuideHub 365 — Automatisk M365 Web Screenshot Collector
 *
 * Bruker Playwright til å logge inn på Microsoft 365 (web)
 * og ta skjermbilder av hvert steg i guidene.
 *
 * Konfigureres via miljøvariabler (GitHub Secrets):
 *   M365_EMAIL    - e-postadresse til testkontoen
 *   M365_PASSWORD - passord til testkontoen
 *
 * Kjøres via: node scripts/take-screenshots.js
 * Eller automatisk via GitHub Actions.
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCREENSHOTS_DIR = path.join(ROOT, 'public', 'screenshots');

const EMAIL = process.env.M365_EMAIL;
const PASSWORD = process.env.M365_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error('❌ Mangler M365_EMAIL eller M365_PASSWORD miljøvariabler');
  process.exit(1);
}

// Definisjon av alle skjermbilder som skal tas
// Hvert steg har: id, url, selector (element som skal vises), beskrivelse
const SCREENSHOT_TASKS = [

  // ─── OUTLOOK WEB ───────────────────────────────────────────────────────────
  {
    guideId: 'outlook-setup-pc',
    steps: [
      {
        step: 1,
        url: 'https://outlook.office.com/mail/',
        waitFor: '[aria-label="New mail"], [aria-label="Ny e-post"]',
        selector: 'body',
        clip: null, // full page
        description: 'Outlook innboks - oversikt'
      },
      {
        step: 2,
        url: 'https://outlook.office.com/mail/',
        waitFor: '[aria-label="New mail"], [aria-label="Ny e-post"]',
        selector: '[aria-label="New mail"], [aria-label="Ny e-post"]',
        clip: null,
        description: 'Ny e-post knappen'
      }
    ]
  },

  // ─── TEAMS WEB ─────────────────────────────────────────────────────────────
  {
    guideId: 'teams-first-meeting',
    steps: [
      {
        step: 1,
        url: 'https://teams.microsoft.com/_#/calendarv2',
        waitFor: '[data-tid="calendar-new-meeting-button"], [aria-label*="New meeting"]',
        selector: 'body',
        clip: null,
        description: 'Teams kalender - oversikt'
      },
      {
        step: 2,
        url: 'https://teams.microsoft.com/_#/calendarv2',
        waitFor: '[data-tid="calendar-new-meeting-button"]',
        selector: '[data-tid="calendar-new-meeting-button"]',
        clip: null,
        description: 'Nytt møte-knappen i Teams'
      }
    ]
  },

  // ─── ONEDRIVE WEB ──────────────────────────────────────────────────────────
  {
    guideId: 'onedrive-save',
    steps: [
      {
        step: 1,
        url: 'https://onedrive.live.com/?id=root',
        waitFor: '[data-automationid="uploadCommand"]',
        selector: 'body',
        clip: null,
        description: 'OneDrive - Mine filer'
      },
      {
        step: 2,
        url: 'https://onedrive.live.com/?id=root',
        waitFor: '[data-automationid="uploadCommand"]',
        selector: '[data-automationid="uploadCommand"]',
        clip: null,
        description: 'Last opp-knappen i OneDrive'
      }
    ]
  },

  // ─── MFA SETUP ─────────────────────────────────────────────────────────────
  {
    guideId: 'mfa-setup',
    steps: [
      {
        step: 1,
        url: 'https://mysignins.microsoft.com/security-info',
        waitFor: 'main, [role="main"]',
        selector: 'body',
        clip: null,
        description: 'Sikkerhetsinformasjon-siden i Microsoft'
      }
    ]
  }
];

// Logg inn på Microsoft 365
async function login(page) {
  console.log('🔐 Logger inn på Microsoft 365...');

  await page.goto('https://login.microsoftonline.com/', { waitUntil: 'networkidle' });

  // Skriv inn e-post
  await page.fill('input[type="email"]', EMAIL);
  await page.click('input[type="submit"]');
  await page.waitForLoadState('networkidle');

  // Skriv inn passord
  try {
    await page.waitForSelector('input[type="password"]', { timeout: 8000 });
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('input[type="submit"]');
    await page.waitForLoadState('networkidle');
  } catch {
    console.warn('   ⚠️  Passord-felt ikke funnet — kan allerede være innlogget');
  }

  // Håndter "Stay signed in?" prompt
  try {
    const staySignedIn = page.locator('input[value="Yes"], input[id="idBtn_Back"]');
    if (await staySignedIn.count() > 0) {
      await staySignedIn.first().click();
      await page.waitForLoadState('networkidle');
    }
  } catch { /* ignorer */ }

  // Håndter MFA hvis påkrevd (venter maks 30 sek på manuell godkjenning)
  const url = page.url();
  if (url.includes('login') || url.includes('auth')) {
    console.log('   ⚠️  MFA kan være påkrevd. Venter 30 sekunder...');
    await page.waitForTimeout(30000);
  }

  console.log('   ✅ Innlogging fullført');
}

// Ta et enkelt skjermbilde
async function takeScreenshot(page, task, step) {
  const filename = `steg-${step.step}.png`;
  const dir = path.join(SCREENSHOTS_DIR, task.guideId);
  fs.mkdirSync(dir, { recursive: true });
  const filepath = path.join(dir, filename);

  console.log(`   📸 Steg ${step.step}: ${step.description}`);

  try {
    await page.goto(step.url, { waitUntil: 'networkidle', timeout: 30000 });

    if (step.waitFor) {
      await page.waitForSelector(step.waitFor, { timeout: 15000 }).catch(() => {
        console.log(`      ⚠️  Element ikke funnet: ${step.waitFor} — tar full screenshot`);
      });
    }

    // Vent litt ekstra for animasjoner
    await page.waitForTimeout(1500);

    if (step.selector && step.selector !== 'body') {
      try {
        const el = page.locator(step.selector).first();
        await el.screenshot({ path: filepath });
      } catch {
        // Fallback til full side
        await page.screenshot({ path: filepath, fullPage: false });
      }
    } else {
      await page.screenshot({ path: filepath, fullPage: false });
    }

    console.log(`      ✅ Lagret: ${path.relative(ROOT, filepath)}`);
    return true;
  } catch (err) {
    console.warn(`      ❌ Feilet: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('📸 GuideHub 365 — Screenshot Collector\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'nb-NO',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  // Logg inn
  await login(page);

  // Ta skjermbilder for alle guider
  let total = 0;
  let success = 0;

  for (const task of SCREENSHOT_TASKS) {
    console.log(`\n📋 Guide: ${task.guideId}`);
    for (const step of task.steps) {
      total++;
      const ok = await takeScreenshot(page, task, step);
      if (ok) success++;
    }
  }

  await browser.close();

  // Oppdater screenshot-register
  const registry = {
    lastUpdated: new Date().toISOString(),
    totalScreenshots: success,
    guides: SCREENSHOT_TASKS.map(t => ({
      guideId: t.guideId,
      steps: t.steps.map(s => ({
        step: s.step,
        file: `screenshots/${t.guideId}/steg-${s.step}.png`,
        description: s.description
      }))
    }))
  };

  fs.writeFileSync(
    path.join(ROOT, 'data', 'screenshot-registry.json'),
    JSON.stringify(registry, null, 2)
  );

  console.log(`\n✅ Ferdig! ${success}/${total} skjermbilder tatt`);
  console.log(`📄 Register oppdatert: data/screenshot-registry.json`);
}

main().catch(err => {
  console.error('❌ Kritisk feil:', err);
  process.exit(1);
});
