/**
 * GuideHub 365 — Microsoft 365 Auto-Update Checker
 *
 * Kjøres daglig via GitHub Actions.
 * Henter Microsofts offisielle endringskilder og matcher mot guide-katalogen.
 * Oppdaterer data/guide-status.json med flaggede guider.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Microsoft 365 change sources (public, no auth required)
const SOURCES = [
  {
    name: 'Microsoft 365 Roadmap',
    url: 'https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=&rss=1',
    type: 'rss'
  },
  {
    name: 'Microsoft 365 Blog',
    url: 'https://techcommunity.microsoft.com/t5/microsoft-365-blog/bg-p/microsoft_365blog/rss',
    type: 'rss'
  }
];

// Fetch URL and return text
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'GuideHub365-UpdateChecker/1.0' },
      timeout: 15000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(fetchUrl(res.headers.location));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
  });
}

// Extract text content from RSS/XML items
function parseRssItems(xml) {
  const items = [];
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/gi);
  for (const match of itemMatches) {
    const block = match[1];
    const title = (block.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/si) || [])[1] || '';
    const desc = (block.match(/<description[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/si) || [])[1] || '';
    const pubDate = (block.match(/<pubDate>(.*?)<\/pubDate>/i) || [])[1] || '';
    const link = (block.match(/<link[^>]*>(.*?)<\/link>/i) || [])[1] || '';
    items.push({
      title: title.replace(/<[^>]+>/g, '').trim(),
      description: desc.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim().slice(0, 300),
      pubDate,
      link: link.trim()
    });
  }
  return items;
}

// Check if an item is newer than N days
function isRecent(pubDateStr, days = 7) {
  if (!pubDateStr) return true; // assume recent if no date
  const d = new Date(pubDateStr);
  if (isNaN(d)) return true;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return d > cutoff;
}

// Match RSS items against guide keywords
function matchItemsToGuides(items, guides) {
  const flagged = [];

  for (const guide of guides) {
    const hits = [];
    for (const item of items) {
      if (!isRecent(item.pubDate, 14)) continue; // only last 14 days
      const searchText = (item.title + ' ' + item.description).toLowerCase();
      const matchedKeywords = guide.keywords.filter(kw => searchText.includes(kw.toLowerCase()));
      if (matchedKeywords.length > 0) {
        hits.push({
          source: item.title,
          link: item.link,
          pubDate: item.pubDate,
          matchedKeywords
        });
      }
    }
    if (hits.length > 0) {
      flagged.push({
        guideId: guide.id,
        guideTitle: guide.title,
        category: guide.category,
        hits
      });
    }
  }

  return flagged;
}

async function main() {
  console.log('🔍 GuideHub 365 — Sjekker Microsoft 365 oppdateringer...\n');

  const registryPath = path.join(ROOT, 'data', 'guide-registry.json');
  const statusPath = path.join(ROOT, 'data', 'guide-status.json');

  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const guides = registry.guides;

  let allItems = [];
  const sourceResults = [];

  for (const source of SOURCES) {
    try {
      console.log(`📡 Henter: ${source.name}`);
      const xml = await fetchUrl(source.url);
      const items = parseRssItems(xml);
      console.log(`   → ${items.length} elementer funnet`);
      allItems = allItems.concat(items);
      sourceResults.push({ name: source.name, itemCount: items.length, ok: true });
    } catch (err) {
      console.warn(`   ⚠️  Feil ved henting av ${source.name}: ${err.message}`);
      sourceResults.push({ name: source.name, itemCount: 0, ok: false, error: err.message });
    }
  }

  console.log(`\n✅ Totalt ${allItems.length} RSS-elementer hentet`);
  console.log('🔎 Matcher mot guide-katalog...\n');

  const flagged = matchItemsToGuides(allItems, guides);

  const now = new Date().toISOString();
  const status = {
    lastChecked: now,
    totalGuides: guides.length,
    flaggedCount: flagged.length,
    sources: sourceResults,
    flaggedGuides: flagged,
    allGuideStatuses: guides.map(g => {
      const flag = flagged.find(f => f.guideId === g.id);
      return {
        id: g.id,
        title: g.title,
        category: g.category,
        status: flag ? 'needs_review' : 'ok',
        lastUpdated: g.lastUpdated,
        flaggedHits: flag ? flag.hits.length : 0
      };
    })
  };

  // Ensure data directory exists
  fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
  fs.writeFileSync(statusPath, JSON.stringify(status, null, 2));

  // Print summary
  if (flagged.length === 0) {
    console.log('✅ Ingen guider trenger oppdatering basert på nylige M365-endringer.\n');
  } else {
    console.log(`⚠️  ${flagged.length} guide(r) kan trenge oppdatering:\n`);
    for (const f of flagged) {
      console.log(`  📋 ${f.guideTitle} (${f.category})`);
      for (const h of f.hits) {
        console.log(`     - ${h.source.slice(0, 80)}`);
        console.log(`       Nøkkelord: ${h.matchedKeywords.join(', ')}`);
      }
    }
  }

  console.log(`\n📄 Status skrevet til: data/guide-status.json`);
  console.log(`⏰ Kjørt: ${now}`);

  // Exit with code 1 if flagged guides exist (for GitHub Actions to detect)
  if (flagged.length > 0) {
    process.exit(0); // Still exit 0 — we just commit the updated status file
  }
}

main().catch(err => {
  console.error('❌ Kritisk feil:', err);
  process.exit(1);
});
