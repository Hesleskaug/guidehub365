/**
 * take-screenshots.js — GuideHub365 Real M365 Screenshot Automation
 * =================================================================
 * Captures real Microsoft 365 screenshots for every guide step.
 *
 * For each step:
 *   1. Navigates to the correct M365 URL
 *   2. Waits for the page and target element to load
 *   3. Takes a 1280×800 screenshot
 *   4. Captures the bounding box of the click-target element
 *   5. Saves screenshot to public/screenshots/<guideId>/<name>.png
 *   6. Saves coordinates to public/screenshots/<guideId>/<name>.coords.json
 *
 * The .coords.json files are then used by annotate.py to draw arrows
 * at verified, real coordinates — no guessing.
 *
 * Usage:
 *   npm install playwright
 *   npx playwright install chromium
 *
 *   # Set credentials (locally via .env, in CI via GitHub Actions secrets)
 *   export M365_EMAIL="user@domain.com"
 *   export M365_PASSWORD="password"
 *
 *   node scripts/take-screenshots.js              # all guides
 *   GUIDE_ID=out-of-office node scripts/take-screenshots.js  # one guide
 *
 * File naming: must match exactly what App.jsx references
 *   (screenshot: "steg-1-innstillinger", guideId: "out-of-office")
 *   → public/screenshots/out-of-office/steg-1-innstillinger.png
 *
 * HOW TO ADD A NEW GUIDE:
 *   1. Add a block to GUIDES below with id, steps array
 *   2. Each step needs: name, url, waitFor, clickSelector
 *   3. Run: GUIDE_ID=<id> node scripts/take-screenshots.js
 *   4. Check screenshots, then run: python scripts/annotate.py --guide <id>
 *   5. Commit: git add public/screenshots && git commit -m "Add screenshots for <guide>"
 */

import { chromium } from 'playwright';
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT       = path.join(__dirname, '..');
const SCREENSHOT_BASE = path.join(REPO_ROOT, 'public', 'screenshots');
const SESSION_FILE    = path.join(REPO_ROOT, 'data', 'session.json');

const EMAIL    = process.env.M365_EMAIL;
const PASSWORD = process.env.M365_PASSWORD;
const VIEWPORT = { width: 1280, height: 800 };

if (!EMAIL || !PASSWORD) {
  console.error('ERROR: Set M365_EMAIL and M365_PASSWORD environment variables.');
  process.exit(1);
}

// ─── Guide definitions ───────────────────────────────────────────────────────
// name:          matches App.jsx step screenshot field exactly
// url:           M365 URL to navigate to for this step
// waitFor:       CSS selector to wait for before screenshotting (confirms page loaded)
// clickSelector: element the user clicks in this step — we capture its bounding box
// preAction:     optional async fn(page) to run before screenshot (open menus etc.)
// ─────────────────────────────────────────────────────────────────────────────
const GUIDES = [

  {
    id: 'out-of-office',
    steps: [
      {
        name:          'steg-1-innstillinger',
        url:           'https://outlook.office.com/mail/inbox',
        waitFor:       '[aria-label="Settings"]',
        clickSelector: '[aria-label="Settings"]',
      },
      {
        name:          'steg-2-automatiske-svar',
        url:           'https://outlook.office.com/mail/options/mail/automaticReplies',
        waitFor:       'h1',
        clickSelector: 'h1',
      },
      {
        name:          'steg-3-slaa-paa',
        url:           'https://outlook.office.com/mail/options/mail/automaticReplies',
        waitFor:       '[aria-label="Send automatic replies"]',
        clickSelector: '[aria-label="Send automatic replies"]',
      },
      {
        name:          'steg-4-skriv-melding',
        url:           'https://outlook.office.com/mail/options/mail/automaticReplies',
        waitFor:       '.ms-TextField-field',
        clickSelector: '.ms-TextField-field',
      },
      {
        name:          'steg-5-lagre',
        url:           'https://outlook.office.com/mail/options/mail/automaticReplies',
        waitFor:       '[aria-label="Save"]',
        clickSelector: '[aria-label="Save"]',
      },
    ],
  },

  {
    id: 'email-signature',
    steps: [
      {
        name:          'steg-1-innstillinger',
        url:           'https://outlook.office.com/mail/inbox',
        waitFor:       '[aria-label="Settings"]',
        clickSelector: '[aria-label="Settings"]',
      },
      {
        name:          'steg-2-skriv-og-svar',
        url:           'https://outlook.office.com/mail/options/mail/messageContent',
        waitFor:       'h1',
        clickSelector: 'h1',
      },
      {
        name:          'steg-3-skriv-signatur',
        url:           'https://outlook.office.com/mail/options/mail/messageContent',
        waitFor:       '[aria-label="New signature"]',
        clickSelector: '[aria-label="New signature"]',
      },
      {
        name:          'steg-4-aktiver',
        url:           'https://outlook.office.com/mail/options/mail/messageContent',
        waitFor:       '[aria-label="For new messages"]',
        clickSelector: '[aria-label="For new messages"]',
      },
      {
        name:          'steg-5-lagre',
        url:           'https://outlook.office.com/mail/options/mail/messageContent',
        waitFor:       '[aria-label="Save"]',
        clickSelector: '[aria-label="Save"]',
      },
    ],
  },

  {
    id: 'shared-mailbox',
    steps: [
      {
        name:          'steg-1-outlook-innboks',
        url:           'https://outlook.office.com/mail/inbox',
        waitFor:       '[aria-label="Mail"]',
        clickSelector: '[aria-label="Mail"]',
      },
      {
        name:          'steg-2-hoyreklikk',
        url:           'https://outlook.office.com/mail/inbox',
        waitFor:       '[aria-label="Folders"]',
        clickSelector: '[aria-label="Folders"]',
        preAction: async (page) => {
          // Right-click on the folder pane to surface the "Add shared folder" option
          const el = await page.$('[aria-label="Folders"]');
          if (el) await el.click({ button: 'right' });
          await page.waitForTimeout(800);
        },
      },
      {
        name:          'steg-3-legg-til',
        url:           'https://outlook.office.com/mail/inbox',
        waitFor:       '[aria-label="Folders"]',
        clickSelector: 'button:has-text("Add shared folder")',
        preAction: async (page) => {
          const el = await page.$('[aria-label="Folders"]');
          if (el) await el.click({ button: 'right' });
          await page.waitForTimeout(800);
        },
      },
      {
        name:          'steg-4-sok-postkasse',
        url:           'https://outlook.office.com/mail/inbox',
        waitFor:       'input[placeholder*="Search"]',
        clickSelector: 'input[placeholder*="Search"]',
        preAction: async (page) => {
          const el = await page.$('[aria-label="Folders"]');
          if (el) await el.click({ button: 'right' });
          await page.waitForTimeout(600);
          const addBtn = await page.$('button:has-text("Add shared folder")');
          if (addBtn) { await addBtn.click(); await page.waitForTimeout(800); }
        },
      },
      {
        name:          'steg-5-ferdig',
        url:           'https://outlook.office.com/mail/inbox',
        waitFor:       '[aria-label="Mail"]',
        clickSelector: '[aria-label="Mail"]',
      },
    ],
  },

  {
    id: 'install-office',
    steps: [
      {
        name:          'steg-1-portal',
        url:           'https://www.microsoft365.com/',
        waitFor:       '[aria-label="Install apps"]',
        clickSelector: '[aria-label="Install apps"]',
      },
      {
        name:          'steg-2-installer-knapp',
        url:           'https://www.microsoft365.com/',
        waitFor:       '[aria-label="Install apps"]',
        clickSelector: '[aria-label="Install apps"]',
      },
      {
        name:          'steg-3-nedlasting',
        url:           'https://portal.office.com/account/#installs',
        waitFor:       'h1',
        clickSelector: 'a:has-text("Install")',
      },
      {
        name:          'steg-4-installer',
        url:           'https://portal.office.com/account/#installs',
        waitFor:       'h1',
        clickSelector: 'h1',
      },
      {
        name:          'steg-5-aktiver',
        url:           'https://www.microsoft365.com/',
        waitFor:       'main',
        clickSelector: 'main',
      },
    ],
  },

  {
    id: 'password-reset',
    steps: [
      {
        name:          'steg-1-sspr',
        url:           'https://passwordreset.microsoftonline.com/',
        waitFor:       'input[type="email"]',
        clickSelector: 'input[type="email"]',
      },
      {
        name:          'steg-2-epost',
        url:           'https://passwordreset.microsoftonline.com/',
        waitFor:       'input[type="email"]',
        clickSelector: 'input[type="submit"]',
      },
      {
        name:          'steg-3-bekreft-metode',
        url:           'https://passwordreset.microsoftonline.com/',
        waitFor:       'input[type="email"]',
        clickSelector: 'input[type="submit"]',
        preAction: async (page) => {
          await page.fill('input[type="email"]', EMAIL).catch(() => {});
          await page.click('input[id="iCancel"]').catch(() => {});
          await page.waitForTimeout(600);
        },
      },
      {
        name:          'steg-4-skriv-kode',
        url:           'https://passwordreset.microsoftonline.com/',
        waitFor:       'input[type="email"]',
        clickSelector: 'input[type="email"]',
      },
      {
        name:          'steg-5-nytt-passord',
        url:           'https://passwordreset.microsoftonline.com/',
        waitFor:       'input[type="email"]',
        clickSelector: 'input[type="email"]',
      },
      {
        name:          'steg-6-ferdig',
        url:           'https://passwordreset.microsoftonline.com/',
        waitFor:       'input[type="email"]',
        clickSelector: 'input[type="submit"]',
      },
    ],
  },

  {
    id: 'onedrive-sync',
    steps: [
      {
        name:          'steg-1-aapne',
        url:           'https://onedrive.live.com/',
        waitFor:       'main',
        clickSelector: '[aria-label="Files"]',
      },
      {
        name:          'steg-2-logg-inn',
        url:           'https://login.microsoftonline.com/',
        waitFor:       'input[type="email"]',
        clickSelector: 'input[type="submit"]',
      },
      {
        name:          'steg-3-velg-mappe',
        url:           'https://onedrive.live.com/',
        waitFor:       'main',
        clickSelector: 'main',
      },
      {
        name:          'steg-4-synkroniserer',
        url:           'https://onedrive.live.com/',
        waitFor:       'main',
        clickSelector: '[aria-label="Sync"]',
      },
      {
        name:          'steg-5-utforsker',
        url:           'https://onedrive.live.com/',
        waitFor:       '[aria-label="Files"]',
        clickSelector: '[aria-label="Files"]',
      },
    ],
  },

  {
    id: 'teams-first-meeting',
    steps: [
      {
        name:          'steg-1-aapne-teams',
        url:           'https://teams.microsoft.com/_#/calendarv2',
        waitFor:       '[data-tid="left-rail-calendar-tab"]',
        clickSelector: '[data-tid="left-rail-calendar-tab"]',
      },
      {
        name:          'steg-2-se-motedetaljer',
        url:           'https://teams.microsoft.com/_#/calendarv2',
        waitFor:       '[aria-label*="New meeting"]',
        clickSelector: '[aria-label*="New meeting"]',
      },
      {
        name:          'steg-3-delta-klikk',
        url:           'https://teams.microsoft.com/_#/calendarv2',
        waitFor:       'main',
        clickSelector: '[aria-label*="New meeting"]',
      },
      {
        name:          'steg-4-sjekk-lyd-video',
        url:           'https://teams.microsoft.com/_#/calendarv2',
        waitFor:       'main',
        clickSelector: 'main',
      },
      {
        name:          'steg-5-inne-i-motet',
        url:           'https://teams.microsoft.com/_#/calendarv2',
        waitFor:       'main',
        clickSelector: 'main',
      },
    ],
  },

  {
    id: 'onedrive-save',
    steps: [
      {
        name:          'steg-1-systemtray',
        url:           'https://onedrive.live.com/',
        waitFor:       'main',
        clickSelector: '[aria-label="Files"]',
      },
      {
        name:          'steg-2-onedrive-mappe',
        url:           'https://onedrive.live.com/',
        waitFor:       '[aria-label="Files"]',
        clickSelector: '[aria-label="Files"]',
      },
      {
        name:          'steg-3-dra-fil',
        url:           'https://onedrive.live.com/',
        waitFor:       '[aria-label="Files"]',
        clickSelector: '[aria-label="Upload"]',
      },
      {
        name:          'steg-4-synkroniserer',
        url:           'https://onedrive.live.com/',
        waitFor:       'main',
        clickSelector: 'main',
      },
      {
        name:          'steg-5-ferdig-synkronisert',
        url:           'https://onedrive.live.com/',
        waitFor:       'main',
        clickSelector: 'main',
      },
    ],
  },

  {
    id: 'outlook-setup-pc',
    steps: [
      {
        name:          'steg-1-portal',
        url:           'https://www.microsoft365.com/',
        waitFor:       'main',
        clickSelector: '[aria-label="Install apps"]',
      },
      {
        name:          'steg-2-kjor-installasjon',
        url:           'https://portal.office.com/account/#installs',
        waitFor:       'h1',
        clickSelector: 'h1',
      },
      {
        name:          'steg-3-installerer',
        url:           'https://portal.office.com/account/#installs',
        waitFor:       'main',
        clickSelector: 'main',
      },
      {
        name:          'steg-4-legg-til-konto',
        url:           'https://outlook.office.com/mail/inbox',
        waitFor:       '[aria-label="Mail"]',
        clickSelector: '[aria-label="Mail"]',
      },
      {
        name:          'steg-5-logg-inn',
        url:           'https://outlook.office.com/mail/inbox',
        waitFor:       '[aria-label="Mail"]',
        clickSelector: '[aria-label="Mail"]',
      },
      {
        name:          'steg-6-ferdig-innboks',
        url:           'https://outlook.office.com/mail/inbox',
        waitFor:       '[aria-label="Mail"]',
        clickSelector: '[aria-label="Mail"]',
      },
    ],
  },

  {
    id: 'mfa-setup',
    steps: [
      {
        name:          'steg-1-epost',
        url:           'https://mysignins.microsoft.com/security-info',
        waitFor:       'h1',
        clickSelector: 'h1',
      },
      {
        name:          'steg-2-passord',
        url:           'https://mysignins.microsoft.com/security-info',
        waitFor:       'main',
        clickSelector: 'main',
      },
      {
        name:          'steg-3-sikre-konto',
        url:           'https://mysignins.microsoft.com/security-info',
        waitFor:       'h1',
        clickSelector: 'h1',
      },
      {
        name:          'steg-4-installer-authenticator',
        url:           'https://mysignins.microsoft.com/security-info',
        waitFor:       'main',
        clickSelector: '[aria-label="Add sign-in method"]',
      },
      {
        name:          'steg-5-qr-kode',
        url:           'https://mysignins.microsoft.com/security-info',
        waitFor:       'main',
        clickSelector: 'main',
      },
      {
        name:          'steg-6-godkjenn-varsel',
        url:           'https://mysignins.microsoft.com/security-info',
        waitFor:       'main',
        clickSelector: 'main',
      },
      {
        name:          'steg-7-fullfort',
        url:           'https://mysignins.microsoft.com/security-info',
        waitFor:       'h1',
        clickSelector: 'h1',
      },
    ],
  },
];


// ─── Session helpers ─────────────────────────────────────────────────────────

function loadSession() {
  try {
    if (!fs.existsSync(SESSION_FILE)) return null;
    const s = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
    const ageH = (Date.now() - s.savedAt) / 3600000;
    if (ageH < 20) { console.log('  Reusing saved session'); return s.cookies; }
  } catch {}
  return null;
}

function saveSession(cookies) {
  fs.mkdirSync(path.dirname(SESSION_FILE), { recursive: true });
  fs.writeFileSync(SESSION_FILE, JSON.stringify({ savedAt: Date.now(), cookies }, null, 2));
}


// ─── Login ───────────────────────────────────────────────────────────────────

async function login(page) {
  console.log('  Logging in to M365...');
  await page.goto('https://login.microsoftonline.com/', { waitUntil: 'domcontentloaded' });

  await page.fill('input[type="email"]', EMAIL);
  await page.click('input[type="submit"]');
  await page.waitForTimeout(1500);

  await page.fill('input[type="password"]', PASSWORD);
  await page.click('input[type="submit"]');
  await page.waitForTimeout(2000);

  // "Stay signed in?" prompt
  const stayBtn = page.locator('#idSIButton9, input[value="Yes"]');
  if (await stayBtn.count() > 0) {
    await stayBtn.first().click();
    await page.waitForTimeout(1500);
  }

  // Wait up to 45s for MFA if needed (Authenticator app approval)
  console.log('  Waiting for MFA approval (up to 45s)...');
  try {
    await page.waitForURL(/microsoft365|office\.com|outlook\.office|teams\.microsoft/, { timeout: 45000 });
  } catch {
    console.log('  MFA timeout — continuing anyway');
  }

  const url = page.url();
  const ok = !url.includes('login.microsoftonline.com');
  console.log(ok ? '  Login OK' : '  Login may have failed — URL: ' + url);
  return ok;
}


// ─── Screenshot capture ───────────────────────────────────────────────────────

async function captureStep(page, guideId, step) {
  const outDir  = path.join(SCREENSHOT_BASE, guideId);
  fs.mkdirSync(outDir, { recursive: true });

  const imgPath    = path.join(outDir, step.name + '.png');
  const coordsPath = path.join(outDir, step.name + '.coords.json');

  console.log(`    ${step.name}`);

  try {
    await page.goto(step.url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Wait for the key element
    if (step.waitFor) {
      await page.waitForSelector(step.waitFor, { timeout: 12000 }).catch(() =>
        console.log(`      waitFor "${step.waitFor}" timed out — screenshotting anyway`));
    }

    // Run any pre-action (open menus etc.)
    if (step.preAction) {
      await step.preAction(page);
      await page.waitForTimeout(800);
    }

    // Take screenshot
    await page.screenshot({ path: imgPath, clip: { x: 0, y: 0, ...VIEWPORT } });

    // Capture click-target bounding box
    let coords = null;
    if (step.clickSelector) {
      const el = page.locator(step.clickSelector).first();
      if (await el.count() > 0) {
        const bb = await el.boundingBox();
        if (bb) {
          coords = {
            x: Math.round(bb.x + bb.width / 2),
            y: Math.round(bb.y + bb.height / 2),
            box: { x: Math.round(bb.x), y: Math.round(bb.y), w: Math.round(bb.width), h: Math.round(bb.height) },
            selector: step.clickSelector,
            capturedAt: new Date().toISOString(),
          };
          fs.writeFileSync(coordsPath, JSON.stringify(coords, null, 2));
        }
      }
    }

    const coordStr = coords ? ` → click at (${coords.x}, ${coords.y})` : ' → no coords';
    console.log(`      ✓ saved${coordStr}`);
    return { success: true, coords };

  } catch (err) {
    console.log(`      ✗ failed: ${err.message}`);
    return { success: false, error: err.message };
  }
}


// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const targetId = process.env.GUIDE_ID || null;
  const toRun    = targetId ? GUIDES.filter(g => g.id === targetId) : GUIDES;

  if (toRun.length === 0) {
    console.error(`No guide found with id "${targetId}"`);
    console.error('Available: ' + GUIDES.map(g => g.id).join(', '));
    process.exit(1);
  }

  console.log(`GuideHub365 Screenshot Bot — ${new Date().toISOString()}`);
  console.log(`Guides: ${toRun.map(g => g.id).join(', ')}`);
  console.log(`Output: ${SCREENSHOT_BASE}`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    locale: 'nb-NO',
    timezoneId: 'Europe/Oslo',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
               '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  // Try saved session first
  let authenticated = false;
  const savedCookies = loadSession();
  if (savedCookies) {
    await context.addCookies(savedCookies);
    await page.goto('https://www.microsoft365.com/', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
    authenticated = !page.url().includes('login.microsoftonline.com');
  }

  if (!authenticated) {
    authenticated = await login(page);
    if (authenticated) {
      const cookies = await context.cookies();
      saveSession(cookies);
    }
  }

  if (!authenticated) {
    console.error('Authentication failed. Check M365_EMAIL and M365_PASSWORD.');
    await browser.close();
    process.exit(1);
  }

  let ok = 0, fail = 0;

  for (const guide of toRun) {
    console.log(`\n[${guide.id}]`);
    for (const step of guide.steps) {
      const result = await captureStep(page, guide.id, step);
      result.success ? ok++ : fail++;
    }
  }

  await browser.close();
  console.log(`\nDone: ${ok} OK, ${fail} failed`);
  if (ok === 0) process.exit(1);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
