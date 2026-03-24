#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EMAIL = process.env.M365_EMAIL;
const PASSWORD = process.env.M365_PASSWORD;

const VIEWPORT = { width: 1280, height: 800 };
const SESSION_FILE = path.join(__dirname, '../data/session.json');

// Validate credentials
if (!EMAIL || !PASSWORD) {
  console.error('Error: M365_EMAIL and M365_PASSWORD environment variables are required');
  process.exit(1);
}

const GUIDES = [
  {
    id: 'out-of-office',
    name: 'Out of Office',
    steps: [
      {
        name: 'steg-1-innstillinger',
        url: 'https://outlook.office.com/mail/inbox',
        waitFor: '[data-icon-name="Settings"]',
        clickSelector: '[data-icon-name="Settings"]'
      },
      {
        name: 'steg-2-automatiske-svar',
        url: 'https://outlook.office.com/mail/options/mail/automaticReplies',
        waitFor: 'input[aria-label*="automatic"]',
        clickSelector: null
      },
      {
        name: 'steg-3-slaa-paa',
        url: 'https://outlook.office.com/mail/options/mail/automaticReplies',
        waitFor: 'input[type="checkbox"]',
        clickSelector: 'input[type="checkbox"]'
      },
      {
        name: 'steg-4-skriv-melding',
        url: 'https://outlook.office.com/mail/options/mail/automaticReplies',
        waitFor: 'textarea',
        clickSelector: 'textarea'
      },
      {
        name: 'steg-5-lagre',
        url: 'https://outlook.office.com/mail/options/mail/automaticReplies',
        waitFor: 'button:has-text("Save")',
        clickSelector: 'button:has-text("Save")'
      }
    ]
  },
  {
    id: 'email-signature',
    name: 'Email Signature',
    steps: [
      {
        name: 'steg-1-innstillinger',
        url: 'https://outlook.office.com/mail/inbox',
        waitFor: '[data-icon-name="Settings"]',
        clickSelector: '[data-icon-name="Settings"]'
      },
      {
        name: 'steg-2-skriv-og-svar',
        url: 'https://outlook.office.com/mail/options/mail/compose',
        waitFor: 'div:has-text("Signature")',
        clickSelector: null
      },
      {
        name: 'steg-3-skriv-signatur',
        url: 'https://outlook.office.com/mail/options/mail/compose',
        waitFor: '[contenteditable="true"]',
        clickSelector: '[contenteditable="true"]'
      },
      {
        name: 'steg-4-aktiver',
        url: 'https://outlook.office.com/mail/options/mail/compose',
        waitFor: 'input[type="checkbox"]',
        clickSelector: 'input[type="checkbox"]'
      },
      {
        name: 'steg-5-lagre',
        url: 'https://outlook.office.com/mail/options/mail/compose',
        waitFor: 'button:has-text("Save")',
        clickSelector: 'button:has-text("Save")'
      }
    ]
  },
  {
    id: 'shared-mailbox',
    name: 'Shared Mailbox',
    steps: [
      {
        name: 'steg-1-outlook-innboks',
        url: 'https://outlook.office.com/mail/inbox',
        waitFor: '.ms-nav-listItem',
        clickSelector: null
      },
      {
        name: 'steg-2-hoyreklikk',
        url: 'https://outlook.office.com/mail/inbox',
        waitFor: '.ms-nav-listItem',
        clickSelector: '.ms-nav-listItem',
        preAction: 'rightClick'
      },
      {
        name: 'steg-3-legg-til',
        url: 'https://outlook.office.com/mail/inbox',
        waitFor: 'div:has-text("Add shared mailbox")',
        clickSelector: 'div:has-text("Add shared mailbox")'
      },
      {
        name: 'steg-4-sok-postkasse',
        url: 'https://outlook.office.com/mail/inbox',
        waitFor: 'input[placeholder*="search"]',
        clickSelector: 'input[placeholder*="search"]'
      },
      {
        name: 'steg-5-ferdig',
        url: 'https://outlook.office.com/mail/inbox',
        waitFor: 'button:has-text("Add")',
        clickSelector: 'button:has-text("Add")'
      }
    ]
  },
  {
    id: 'install-office',
    name: 'Install Office',
    steps: [
      {
        name: 'steg-1-portal',
        url: 'https://www.microsoft365.com/',
        waitFor: '[data-icon-name="Install"]',
        clickSelector: null
      },
      {
        name: 'steg-2-installer-knapp',
        url: 'https://www.microsoft365.com/',
        waitFor: 'button:has-text("Install")',
        clickSelector: 'button:has-text("Install")'
      },
      {
        name: 'steg-3-nedlasting',
        url: 'https://www.microsoft365.com/',
        waitFor: 'div:has-text("Downloading")',
        clickSelector: null
      },
      {
        name: 'steg-4-installer',
        url: 'https://www.microsoft365.com/',
        waitFor: 'div:has-text("Installing")',
        clickSelector: null
      },
      {
        name: 'steg-5-aktiver',
        url: 'https://www.microsoft365.com/',
        waitFor: 'button:has-text("Activate")',
        clickSelector: 'button:has-text("Activate")'
      }
    ]
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    steps: [
      {
        name: 'steg-1-sspr',
        url: 'https://passwordreset.microsoftonline.com/',
        waitFor: 'input[name="UserID"]',
        clickSelector: 'input[name="UserID"]'
      },
      {
        name: 'steg-2-epost',
        url: 'https://passwordreset.microsoftonline.com/',
        waitFor: 'button:has-text("Next")',
        clickSelector: 'button:has-text("Next")'
      },
      {
        name: 'steg-3-bekreft-metode',
        url: 'https://passwordreset.microsoftonline.com/',
        waitFor: 'input[type="radio"]',
        clickSelector: 'input[type="radio"]'
      },
      {
        name: 'steg-4-skriv-kode',
        url: 'https://passwordreset.microsoftonline.com/',
        waitFor: 'input[name="VerificationCode"]',
        clickSelector: 'input[name="VerificationCode"]'
      },
      {
        name: 'steg-5-nytt-passord',
        url: 'https://passwordreset.microsoftonline.com/',
        waitFor: 'input[name="NewPassword"]',
        clickSelector: 'input[name="NewPassword"]'
      },
      {
        name: 'steg-6-ferdig',
        url: 'https://passwordreset.microsoftonline.com/',
        waitFor: 'button:has-text("Finish")',
        clickSelector: 'button:has-text("Finish")'
      }
    ]
  },
  {
    id: 'onedrive-sync',
    name: 'OneDrive Sync',
    steps: [
      {
        name: 'steg-1-aapne',
        url: 'https://onedrive.live.com/',
        waitFor: '.od-ButtonGroup',
        clickSelector: null
      },
      {
        name: 'steg-2-logg-inn',
        url: 'https://onedrive.live.com/',
        waitFor: 'button:has-text("Sign in")',
        clickSelector: 'button:has-text("Sign in")'
      },
      {
        name: 'steg-3-velg-mappe',
        url: 'https://onedrive.live.com/',
        waitFor: '[role="gridcell"]',
        clickSelector: '[role="gridcell"]'
      },
      {
        name: 'steg-4-synkroniserer',
        url: 'https://onedrive.live.com/',
        waitFor: '.od-SyncIcon',
        clickSelector: null
      },
      {
        name: 'steg-5-utforsker',
        url: 'https://onedrive.live.com/',
        waitFor: '.od-FileIcon',
        clickSelector: '.od-FileIcon'
      }
    ]
  },
  {
    id: 'teams-first-meeting',
    name: 'Teams First Meeting',
    steps: [
      {
        name: 'steg-1-aapne-teams',
        url: 'https://teams.microsoft.com/_#/calendarv2',
        waitFor: '[data-icon-name="Calendar"]',
        clickSelector: null
      },
      {
        name: 'steg-2-se-motedetaljer',
        url: 'https://teams.microsoft.com/_#/calendarv2',
        waitFor: '.cal-item',
        clickSelector: '.cal-item'
      },
      {
        name: 'steg-3-delta-klikk',
        url: 'https://teams.microsoft.com/_#/calendarv2',
        waitFor: 'button:has-text("Join")',
        clickSelector: 'button:has-text("Join")'
      },
      {
        name: 'steg-4-sjekk-lyd-video',
        url: 'https://teams.microsoft.com/_#/calendarv2',
        waitFor: '[data-icon-name="Microphone"]',
        clickSelector: null
      },
      {
        name: 'steg-5-inne-i-motet',
        url: 'https://teams.microsoft.com/_#/calendarv2',
        waitFor: '.call-participant',
        clickSelector: null
      }
    ]
  },
  {
    id: 'onedrive-save',
    name: 'OneDrive Save',
    steps: [
      {
        name: 'steg-1-systemtray',
        url: 'https://onedrive.live.com/',
        waitFor: '.od-AppBrand',
        clickSelector: null
      },
      {
        name: 'steg-2-onedrive-mappe',
        url: 'https://onedrive.live.com/',
        waitFor: '[role="listitem"]',
        clickSelector: '[role="listitem"]'
      },
      {
        name: 'steg-3-dra-fil',
        url: 'https://onedrive.live.com/',
        waitFor: '.od-DragHandle',
        clickSelector: null
      },
      {
        name: 'steg-4-synkroniserer',
        url: 'https://onedrive.live.com/',
        waitFor: '.od-SyncIcon',
        clickSelector: null
      },
      {
        name: 'steg-5-ferdig-synkronisert',
        url: 'https://onedrive.live.com/',
        waitFor: '.od-SyncComplete',
        clickSelector: null
      }
    ]
  },
  {
    id: 'outlook-setup-pc',
    name: 'Outlook Setup PC',
    steps: [
      {
        name: 'steg-1-portal',
        url: 'https://www.microsoft365.com/',
        waitFor: 'button:has-text("Install")',
        clickSelector: null
      },
      {
        name: 'steg-2-kjor-installasjon',
        url: 'https://www.microsoft365.com/',
        waitFor: 'button:has-text("Run")',
        clickSelector: 'button:has-text("Run")'
      },
      {
        name: 'steg-3-installerer',
        url: 'https://www.microsoft365.com/',
        waitFor: 'div:has-text("Installing")',
        clickSelector: null
      },
      {
        name: 'steg-4-legg-til-konto',
        url: 'https://outlook.office.com/mail/inbox',
        waitFor: 'button:has-text("Add account")',
        clickSelector: 'button:has-text("Add account")'
      },
      {
        name: 'steg-5-logg-inn',
        url: 'https://outlook.office.com/mail/inbox',
        waitFor: 'input[type="email"]',
        clickSelector: 'input[type="email"]'
      },
      {
        name: 'steg-6-ferdig-innboks',
        url: 'https://outlook.office.com/mail/inbox',
        waitFor: '.ms-List-cell',
        clickSelector: null
      }
    ]
  },
  {
    id: 'mfa-setup',
    name: 'MFA Setup',
    steps: [
      {
        name: 'steg-1-epost',
        url: 'https://mysignins.microsoft.com/security-info',
        waitFor: 'input[type="email"]',
        clickSelector: 'input[type="email"]'
      },
      {
        name: 'steg-2-passord',
        url: 'https://mysignins.microsoft.com/security-info',
        waitFor: 'input[type="password"]',
        clickSelector: 'input[type="password"]'
      },
      {
        name: 'steg-3-sikre-konto',
        url: 'https://mysignins.microsoft.com/security-info',
        waitFor: 'button:has-text("Secure")',
        clickSelector: 'button:has-text("Secure")'
      },
      {
        name: 'steg-4-installer-authenticator',
        url: 'https://mysignins.microsoft.com/security-info',
        waitFor: 'button:has-text("Authenticator")',
        clickSelector: 'button:has-text("Authenticator")'
      },
      {
        name: 'steg-5-qr-kode',
        url: 'https://mysignins.microsoft.com/security-info',
        waitFor: '.qr-code',
        clickSelector: null
      },
      {
        name: 'steg-6-godkjenn-varsel',
        url: 'https://mysignins.microsoft.com/security-info',
        waitFor: 'button:has-text("Approve")',
        clickSelector: 'button:has-text("Approve")'
      },
      {
        name: 'steg-7-fullfort',
        url: 'https://mysignins.microsoft.com/security-info',
        waitFor: 'div:has-text("Complete")',
        clickSelector: null
      }
    ]
  }
];

/**
 * Load session data (auth cookies, storage, etc.)
 */
function loadSession() {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      const data = fs.readFileSync(SESSION_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Warning: Could not load session file:', err.message);
  }
  return {};
}

/**
 * Save session data
 */
function saveSession(data) {
  try {
    const dir = path.dirname(SESSION_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving session:', err.message);
  }
}

/**
 * Get an access token via ROPC (Resource Owner Password Credentials).
 * This is a direct API call — no browser needed, bypasses Microsoft's
 * headless-browser detection entirely.
 */
async function getAccessToken() {
  const TENANT_ID = process.env.M365_TENANT_ID || 'zfjyk.onmicrosoft.com';
  const CLIENT_ID = process.env.M365_CLIENT_ID || '04b07795-8ddb-461a-bbee-02f9e1bf7b46';
  const CLIENT_SECRET = process.env.M365_CLIENT_SECRET;

  console.log(`[ROPC] Requesting token from tenant: ${TENANT_ID}`);

  const params = new URLSearchParams({
    grant_type: 'password',
    client_id: CLIENT_ID,
    username: EMAIL,
    password: PASSWORD,
    resource: 'https://outlook.office365.com/',
    scope: 'openid'
  });
  if (CLIENT_SECRET) params.set('client_secret', CLIENT_SECRET);

  const resp = await fetch(
    `https://login.microsoftonline.com/${TENANT_ID}/oauth2/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    }
  );

  const data = await resp.json();

  if (data.error) {
    throw new Error(`[ROPC] Token error: ${data.error} — ${(data.error_description || '').substring(0, 300)}`);
  }

  console.log('[ROPC] Access token obtained successfully');
  return data.access_token;
}

/**
 * Login to Microsoft 365 via ROPC token — no browser login page needed.
 * Microsoft blocks headless Chromium from rendering their login page in CI,
 * so we authenticate via direct API call instead.
 */
async function login(page) {
  // Step 1: get access token via ROPC (pure HTTP, no browser)
  const accessToken = await getAccessToken();

  // Step 2: try OWA legacy token URL (sets session cookies in browser)
  console.log('[AUTH] Navigating to OWA with bearer token...');
  await page.goto(
    `https://outlook.office365.com/owa/?authtoken=${encodeURIComponent(accessToken)}&type=2`,
    { waitUntil: 'domcontentloaded', timeout: 30000 }
  );

  let currentUrl = page.url();
  console.log('[AUTH] URL after token nav:', currentUrl);

  // Step 3: if authtoken URL didn't work, try outlook.office.com with token header
  if (currentUrl.includes('login.microsoftonline.com') || currentUrl.includes('login.microsoft.com')) {
    console.log('[AUTH] authtoken URL redirected to login — trying header approach...');
    await page.setExtraHTTPHeaders({ 'Authorization': `Bearer ${accessToken}` });
    await page.goto('https://outlook.office.com/mail/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    currentUrl = page.url();
    console.log('[AUTH] URL after header nav:', currentUrl);
  }

  // Step 4: verify we landed somewhere useful
  if (currentUrl.includes('login.microsoftonline.com') || currentUrl.includes('login.microsoft.com')) {
    throw new Error(`[AUTH] All login methods failed — still on login page: ${currentUrl}`);
  }

  // Step 5: wait for inbox to confirm login
  try {
    await page.waitForSelector('[aria-label="Mail"], .ms-List, [data-app-section], .ms-FocusZone', {
      timeout: 30000
    });
    console.log('[AUTH] Login confirmed — inbox loaded. URL:', page.url());
  } catch {
    console.log('[AUTH] Warning: could not confirm inbox. URL:', page.url());
  }

  // Save session cookies for potential reuse
  const cookies = await page.context().cookies();
  saveSession({ cookies });
  console.log(`[AUTH] Session saved (${cookies.length} cookies)`);
}

/**
 * Capture a screenshot step
 */
async function captureStep(page, guide, step, screenshotsRoot) {
  try {
    console.log(`  Capturing: ${guide.id} / ${step.name}`);

    // Create per-guide subfolder: public/screenshots/<guide-id>/
    const guideDir = path.join(screenshotsRoot, guide.id);
    if (!fs.existsSync(guideDir)) {
      fs.mkdirSync(guideDir, { recursive: true });
    }

    // Navigate to step URL
    await page.goto(step.url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for element
    if (step.waitFor) {
      await page.waitForSelector(step.waitFor, { timeout: 10000 });
    }

    // Execute pre-action if any
    if (step.preAction === 'rightClick' && step.clickSelector) {
      const bbox = await page.locator(step.clickSelector).boundingBox();
      if (bbox) {
        await page.click(step.clickSelector, { button: 'right' });
        await page.waitForTimeout(500);
      }
    } else if (step.clickSelector) {
      // Don't click for regular capture, just wait for element to be visible
      await page.waitForSelector(step.clickSelector, { state: 'visible', timeout: 5000 });
    }

    // Take screenshot — saved as public/screenshots/<guide-id>/<step-name>.png
    const filepath = path.join(guideDir, `${step.name}.png`);
    await page.screenshot({ path: filepath, fullPage: false });
    console.log(`    → Saved: ${filepath}`);

    // Capture bounding box of the clicked element
    if (step.clickSelector) {
      const bbox = await page.locator(step.clickSelector).boundingBox();
      if (bbox) {
        const coordsFile = path.join(guideDir, `${step.name}.coords.json`);
        fs.writeFileSync(coordsFile, JSON.stringify({
          x: Math.round(bbox.x + bbox.width / 2),
          y: Math.round(bbox.y + bbox.height / 2),
          width: Math.round(bbox.width),
          height: Math.round(bbox.height)
        }, null, 2));
        console.log(`    → Saved coords: ${coordsFile}`);
      }
    }
  } catch (err) {
    console.error(`  ERROR capturing ${guide.id}/${step.name}:`, err.message);
  }
}

/**
 * Main function
 */
async function main() {
  // CI-friendly Chromium flags — critical for GitHub Actions / Docker environments
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',       // Prevents crashes in low-memory CI environments
      '--disable-gpu',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-blink-features=AutomationControlled',  // Hide automation
    ]
  });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    // Realistic Windows Chrome user agent
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  });

  // Remove webdriver fingerprint
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  const page = await context.newPage();

  // Create output directory
  const outputDir = path.join(__dirname, '../public/screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Login once
    await login(page);

    // Filter guides by GUIDE_ID env var (set from workflow_dispatch input)
    const guideIdFilter = process.env.GUIDE_ID || '';
    const guidesToProcess = guideIdFilter
      ? GUIDES.filter(g => g.id === guideIdFilter)
      : GUIDES;

    if (guideIdFilter && guidesToProcess.length === 0) {
      console.error(`Error: No guide found with id "${guideIdFilter}"`);
      process.exit(1);
    }

    console.log(`Processing ${guidesToProcess.length} guide(s)...`);

    // Capture all steps for all guides
    for (const guide of guidesToProcess) {
      console.log(`\nProcessing guide: ${guide.name}`);
      for (const step of guide.steps) {
        await captureStep(page, guide, step, outputDir);
      }
    }

    console.log('\n✓ Screenshot capture complete');
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch(err => {
  console.error('=== FATAL ERROR ===');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});
