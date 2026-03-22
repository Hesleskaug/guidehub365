import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const M365_EMAIL = process.env.M365_EMAIL;
const M365_PASSWORD = process.env.M365_PASSWORD;
const M365_CLIENT_ID = process.env.M365_CLIENT_ID;
const M365_TENANT_ID = process.env.M365_TENANT_ID;
const M365_CLIENT_SECRET = process.env.M365_CLIENT_SECRET;

const SESSION_FILE = path.join(__dirname, '..', 'data', 'session-state.json');
const SCREENSHOT_BASE = path.join(__dirname, '..', 'public', 'screenshots');
const REGISTRY_FILE = path.join(__dirname, '..', 'data', 'screenshot-registry.json');

const guides = [
  {
    id: 'outlook-setup-pc',
    name: 'Sette opp Outlook paa PC',
    steps: [
      { title: 'Aapne Outlook', url: 'https://outlook.office.com/mail/', selector: '[aria-label="Mail"]', description: 'Gaa til Outlook paa nett' },
      { title: 'Innboks', url: 'https://outlook.office.com/mail/inbox', selector: '.ms-FocusZone', description: 'Din innboks i Outlook' },
      { title: 'Kalender', url: 'https://outlook.office.com/calendar/view/month', selector: '[aria-label="Calendar"]', description: 'Kalendervisning i Outlook' }
    ]
  },
  {
    id: 'teams-first-meeting',
    name: 'Delta i Teams-moete',
    steps: [
      { title: 'Aapne Teams', url: 'https://teams.microsoft.com/', selector: '[data-tid="app-bar"]', description: 'Microsoft Teams hjemskjerm' },
      { title: 'Kalender og moeter', url: 'https://teams.microsoft.com/_#/calendarv2', selector: '[data-tid="left-rail-calendar-tab"]', description: 'Moetekalender i Teams' }
    ]
  },
  {
    id: 'onedrive-save',
    name: 'Lagre filer i OneDrive',
    steps: [
      { title: 'Aapne OneDrive', url: 'https://onedrive.live.com/?authkey=&id=root', selector: '[aria-label="Files"]', description: 'OneDrive filvisning' }
    ]
  },
  {
    id: 'mfa-setup',
    name: 'Sette opp MFA',
    steps: [
      { title: 'Min konto', url: 'https://myaccount.microsoft.com/', selector: 'h1', description: 'Microsoft kontooversikt' },
      { title: 'Sikkerhetsinformasjon', url: 'https://mysignins.microsoft.com/security-info', selector: 'h1', description: 'Min kontosikkerhet' }
    ]
  }
];

async function getOAuthToken() {
  if (!M365_CLIENT_ID || !M365_TENANT_ID || !M365_EMAIL || !M365_PASSWORD) {
    console.log('Missing OAuth credentials');
    return null;
  }
  console.log('Attempting ROPC OAuth...');
  const params = new URLSearchParams({
    grant_type: 'password',
    client_id: M365_CLIENT_ID,
    client_secret: M365_CLIENT_SECRET || '',
    scope: 'openid offline_access https://graph.microsoft.com/User.Read',
    username: M365_EMAIL,
    password: M365_PASSWORD
  });
  return new Promise((resolve) => {
    const postData = params.toString();
    const options = {
      hostname: 'login.microsoftonline.com',
      path: "/" + M365_TENANT_ID + "/oauth2/v2.0/token",
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(postData) }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.access_token) { console.log('ROPC token acquired'); resolve(json); }
          else { console.log('ROPC failed:', json.error_description || json.error); resolve(null); }
        } catch (e) { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.write(postData);
    req.end();
  });
}

function loadSessionState() {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      const state = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
      const ageHours = (Date.now() - state.savedAt) / (1000 * 60 * 60);
      if (ageHours < 20) { console.log("Loaded session state"); return state.cookies; }
    }
  } catch (e) {}
  return null;
}

function saveSessionState(cookies) {
  try {
    const dir = path.dirname(SESSION_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SESSION_FILE, JSON.stringify({ savedAt: Date.now(), cookies }, null, 2));
    console.log('Session state saved');
  } catch (e) {}
}

async function performWebLogin(page) {
  console.log('Performing web login...');
  await page.goto('https://login.microsoftonline.com/', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', M365_EMAIL);
  await page.click('input[type="submit"]');
  await page.waitForTimeout(2000);
  try {
    await page.fill('input[type="password"]', M365_PASSWORD);
    await page.click('input[type="submit"]');
    await page.waitForTimeout(3000);
  } catch (e) {}
  try {
    const stayBtn = await page.$('input[value="Yes"]') || await page.$('#idSIButton9');
    if (stayBtn) { await stayBtn.click(); await page.waitForTimeout(2000); }
  } catch (e) {}
  console.log('Waiting 30s for possible MFA...');
  await page.waitForTimeout(30000);
  await page.goto('https://www.microsoft365.com/', { waitUntil: 'networkidle', timeout: 60000 });
  const url = page.url();
  if (url.includes('microsoft365.com') || url.includes('office.com')) { console.log('Web login successful'); return true; }
  return false;
}

async function takeGuideScreenshots(page, guide) {
  console.log("Taking screenshots for: " + guide.name);
  const guideDir = path.join(SCREENSHOT_BASE, guide.id);
  if (!fs.existsSync(guideDir)) fs.mkdirSync(guideDir, { recursive: true });
  const results = [];
  for (let i = 0; i < guide.steps.length; i++) {
    const step = guide.steps[i];
    const stepNum = i + 1;
    const filename = "steg-" + stepNum + ".png";
    const filepath = path.join(guideDir, filename);
    console.log("  Step " + stepNum + ": " + step.title);
    try {
      await page.goto(step.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);
      if (step.action) await step.action(page);
      if (step.selector) { try { await page.waitForSelector(step.selector, { timeout: 10000 }); } catch (e) {} }
      await page.screenshot({ path: filepath, fullPage: false });
      console.log("    Saved: " + filename);
      results.push({ step: stepNum, title: step.title, description: step.description, filename, capturedAt: new Date().toISOString(), success: true });
    } catch (e) {
      console.log("    Failed: " + e.message);
      results.push({ step: stepNum, title: step.title, description: step.description, filename, capturedAt: new Date().toISOString(), success: false, error: e.message });
    }
  }
  return results;
}

function updateRegistry(guideId, steps) {
  let registry = {};
  try { if (fs.existsSync(REGISTRY_FILE)) registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8')); } catch (e) {}
  registry[guideId] = { lastUpdated: new Date().toISOString(), steps };
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
  console.log("Registry updated for " + guideId);
}

async function main() {
  const targetGuide = process.env.GUIDE_ID || null;
  const guidesToProcess = targetGuide ? guides.filter(g => g.id === targetGuide) : guides;
  console.log("GuideHub365 Screenshot Automation - " + new Date().toISOString());
  console.log("Processing " + guidesToProcess.length + " guide(s)");

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, locale: 'nb-NO', timezoneId: 'Europe/Oslo' });
  const page = await context.newPage();
  let authenticated = false;

  const savedCookies = loadSessionState();
  if (savedCookies) {
    try {
      await context.addCookies(savedCookies);
      await page.goto('https://www.microsoft365.com/', { waitUntil: 'networkidle', timeout: 30000 });
      const url = page.url();
      if (url.includes('microsoft365.com') && !url.includes('login')) { console.log('Restored session'); authenticated = true; }
    } catch (e) {}
  }

  if (!authenticated) {
    const tokenResult = await getOAuthToken();
    if (tokenResult) {
      try {
        await page.goto('https://www.microsoft365.com/', { waitUntil: 'networkidle', timeout: 30000 });
        const url = page.url();
        if (!url.includes('login.microsoftonline')) { console.log('Authenticated via ROPC'); authenticated = true; }
      } catch (e) {}
    }
  }

  if (!authenticated) authenticated = await performWebLogin(page);
  if (!authenticated) { console.log('Authentication failed'); await browser.close(); process.exit(1); }

  const cookies = await context.cookies();
  saveSessionState(cookies);

  let totalSuccess = 0, totalFailed = 0;
  for (const guide of guidesToProcess) {
    const results = await takeGuideScreenshots(page, guide);
    updateRegistry(guide.id, results);
    totalSuccess += results.filter(r => r.success).length;
    totalFailed += results.filter(r => !r.success).length;
  }

  await browser.close();
  console.log("Done! " + totalSuccess + " screenshots, " + totalFailed + " failed");
  if (totalSuccess === 0) process.exit(1);
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1); });
