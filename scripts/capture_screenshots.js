import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = path.resolve('docs/screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function capture() {
  console.log('[Screenshots] Launching headless Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 }
  });

  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(2500);

  // 1. Dashboard Overview
  console.log('[Screenshots] Capturing 01_dashboard_overview.png...');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_dashboard_overview.png') });

  // 2. Analytics Charts & Forecasts
  console.log('[Screenshots] Capturing 02_forecasts_and_charts.png...');
  await page.evaluate(() => window.scrollTo(0, 750));
  await delay(1000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02_forecasts_and_charts.png') });

  // Reset scroll
  await page.evaluate(() => window.scrollTo(0, 0));
  await delay(500);

  // 3. 3D Globe Landing Page (Click "3D Globe" in footer)
  console.log('[Screenshots] Capturing 03_homepage_globe.png...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('3D Globe'));
    if (btn) btn.click();
  });
  await delay(2500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03_homepage_globe.png') });

  // Return to Dashboard
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Dashboard'));
    if (btn) btn.click();
  });
  await delay(1000);

  // 4. Auth Modal (Sign In / Registration - Only Name, Gmail & Password)
  console.log('[Screenshots] Capturing 04_auth_modal.png...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Sign In'));
    if (btn) btn.click();
  });
  await delay(1000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04_auth_modal.png') });

  // Close Auth modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('.fixed button');
    if (closeBtn) closeBtn.click();
  });
  await delay(600);

  // 5. Emergency Broadcast Modal
  console.log('[Screenshots] Capturing 05_broadcast_modal.png...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Broadcast Alert'));
    if (btn) btn.click();
  });
  await delay(1000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '05_broadcast_modal.png') });

  // Close Broadcast modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('.fixed button');
    if (closeBtn) closeBtn.click();
  });
  await delay(600);

  // 6. Community Reports Modal
  console.log('[Screenshots] Capturing 06_community_reports.png...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Community'));
    if (btn) btn.click();
  });
  await delay(1000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '06_community_reports.png') });

  await browser.close();
  console.log('[Screenshots] All screenshots successfully generated in docs/screenshots/!');
}

capture().catch(err => {
  console.error('[Screenshots] Error:', err);
  process.exit(1);
});
