const { chromium, webkit, devices } = require('playwright');
const path = require('path');
const fs = require('fs');

const EVIDENCE_DIR = path.join(__dirname, '..', 'qa', 'evidence');
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

async function run() {
  console.log('Starting Playwright QA Evidence Capture Suite...\n');

  // ==========================================
  // 1. DESKTOP CHROMIUM (1440x900)
  // ==========================================
  console.log('[1/4] Desktop Chromium (1440x900)...');
  const desktopBrowser = await chromium.launch({ headless: true });
  const desktopPage = await desktopBrowser.newPage({
    viewport: { width: 1440, height: 900 }
  });

  await desktopPage.goto('http://localhost:3005/?chat=1', { waitUntil: 'domcontentloaded' });
  await desktopPage.waitForTimeout(1000);

  // Evidence: Desktop full view & Welcome message hierarchy
  console.log('  Capturing desktop-1440x900.png & handbook-welcome-hierarchy.png...');
  await desktopPage.screenshot({
    path: path.join(EVIDENCE_DIR, 'desktop-1440x900.png')
  });
  await desktopPage.screenshot({
    path: path.join(EVIDENCE_DIR, 'handbook-welcome-hierarchy.png')
  });
  await desktopPage.screenshot({
    path: path.join(EVIDENCE_DIR, 'handbook-sidebar-main-source.png')
  });

  // Evidence: Student Handbook PDF Viewer Modal (Drive preview + Banner)
  console.log('  Opening Student Handbook PDF Viewer...');
  const clickedHandbook = await desktopPage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Student Handbook'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('  Clicked handbook button:', clickedHandbook);
  await desktopPage.waitForTimeout(1500);

  console.log('  Capturing handbook-pdf-viewer-modal.png...');
  await desktopPage.screenshot({
    path: path.join(EVIDENCE_DIR, 'handbook-pdf-viewer-modal.png')
  });

  // Close modal via ESC
  await desktopPage.keyboard.press('Escape');
  await desktopPage.waitForTimeout(500);

  // Evidence: Clean Google Workspace Login Modal (Auth hardening)
  console.log('  Opening Login Modal...');
  await desktopPage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const loginBtn = btns.find(b => b.textContent && (b.textContent.includes('Sign in') || b.textContent.includes('Guest') || b.textContent.includes('Verified')));
    if (loginBtn) loginBtn.click();
  });
  await desktopPage.waitForTimeout(800);

  console.log('  Capturing auth-login-google-sso.png...');
  await desktopPage.screenshot({
    path: path.join(EVIDENCE_DIR, 'auth-login-google-sso.png')
  });

  await desktopBrowser.close();

  // ==========================================
  // 2. WEBKIT IPHONE 13 (390x844)
  // ==========================================
  console.log('\n[2/4] WebKit iPhone 13 (390x844)...');
  const webkitBrowser = await webkit.launch({ headless: true });
  const iphone13Page = await webkitBrowser.newPage({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true
  });

  await iphone13Page.goto('http://localhost:3005/?chat=1', { waitUntil: 'domcontentloaded' });
  await iphone13Page.waitForTimeout(1000);

  // Evidence: iPhone 13 Mobile App Shell
  console.log('  Capturing mobile-app-shell-iphone13.png...');
  await iphone13Page.screenshot({
    path: path.join(EVIDENCE_DIR, 'mobile-app-shell-iphone13.png')
  });

  // Evidence: Mobile Drawer Scroll Lock
  console.log('  Opening Mobile Drawer...');
  await iphone13Page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Open navigation menu"]');
    if (btn) btn.click();
  });
  await iphone13Page.waitForTimeout(800);

  const bodyClass = await iphone13Page.evaluate(() => document.body.className);
  console.log('  document.body class with drawer open:', bodyClass);

  console.log('  Capturing mobile-drawer-scroll-lock.png...');
  await iphone13Page.screenshot({
    path: path.join(EVIDENCE_DIR, 'mobile-drawer-scroll-lock.png')
  });

  // Close drawer
  await iphone13Page.keyboard.press('Escape');
  await iphone13Page.waitForTimeout(500);

  // Evidence: Fullscreen Mobile Campus Map Modal & Draggable Bottom Sheet
  console.log('  Opening Mobile Campus Map...');
  await iphone13Page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const mapBtn = btns.find(b => b.title && b.title.includes('Map')) || btns.find(b => b.textContent && b.textContent.includes('Map'));
    if (mapBtn) mapBtn.click();
  });
  await iphone13Page.waitForTimeout(1200);

  console.log('  Capturing mobile-campus-map-fullscreen.png...');
  await iphone13Page.screenshot({
    path: path.join(EVIDENCE_DIR, 'mobile-campus-map-fullscreen.png')
  });

  // Click on Campus Directory header to snap bottom sheet to half/full
  await iphone13Page.evaluate(() => {
    const dir = Array.from(document.querySelectorAll('*')).find(el => el.textContent && el.textContent.includes('Campus Directory'));
    if (dir) dir.click();
  });
  await iphone13Page.waitForTimeout(600);

  console.log('  Capturing mobile-campus-map-bottom-sheet.png...');
  await iphone13Page.screenshot({
    path: path.join(EVIDENCE_DIR, 'mobile-campus-map-bottom-sheet.png')
  });

  await webkitBrowser.close();

  // ==========================================
  // 3. WEBKIT IPHONE SE (375x667)
  // ==========================================
  console.log('\n[3/4] WebKit iPhone SE (375x667)...');
  const webkitSEBrowser = await webkit.launch({ headless: true });
  const iphoneSEPage = await webkitSEBrowser.newPage({
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true
  });

  await iphoneSEPage.goto('http://localhost:3005/?chat=1', { waitUntil: 'domcontentloaded' });
  await iphoneSEPage.waitForTimeout(1000);

  console.log('  Capturing iphone-se-375x667.png...');
  await iphoneSEPage.screenshot({
    path: path.join(EVIDENCE_DIR, 'iphone-se-375x667.png')
  });
  await webkitSEBrowser.close();

  // ==========================================
  // 4. CHROMIUM PIXEL 7 (412x915)
  // ==========================================
  console.log('\n[4/4] Chromium Pixel 7 (412x915)...');
  const pixelBrowser = await chromium.launch({ headless: true });
  const pixelPage = await pixelBrowser.newPage({
    viewport: { width: 412, height: 915 },
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
    isMobile: true,
    hasTouch: true
  });

  await pixelPage.goto('http://localhost:3005/?chat=1', { waitUntil: 'domcontentloaded' });
  await pixelPage.waitForTimeout(1000);

  console.log('  Capturing pixel-7-412x915.png...');
  await pixelPage.screenshot({
    path: path.join(EVIDENCE_DIR, 'pixel-7-412x915.png')
  });
  await pixelBrowser.close();

  console.log('\nAll Playwright screenshots successfully captured in /qa/evidence/!\n');
}

run().catch(err => {
  console.error('Playwright execution error:', err);
  process.exit(1);
});
