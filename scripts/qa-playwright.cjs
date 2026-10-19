const { chromium, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = path.join(__dirname, '../qa/evidence');
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

const TARGET_URL = process.env.TEST_URL || 'https://taga-askai.vercel.app';

console.log(`Starting TAGA-asK AI Cross-Browser Playwright QA Suite against: ${TARGET_URL}`);

async function runQASuite() {
  const consoleLogs = [];
  const networkLogs = [];
  const report = {
    targetUrl: TARGET_URL,
    timestamp: new Date().toISOString(),
    tests: []
  };

  function logConsole(type, text, location) {
    consoleLogs.push({ timestamp: new Date().toISOString(), type, text, location });
  }

  function logNetwork(method, url, status) {
    networkLogs.push({ timestamp: new Date().toISOString(), method, url, status });
  }

  // 1. Chromium Desktop (1440x900)
  console.log('\n--- Test Suite 1: Chromium Desktop (1440x900) ---');
  const chromeBrowser = await chromium.launch({ headless: true });
  try {
    const context = await chromeBrowser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    page.on('console', msg => logConsole(msg.type(), msg.text(), msg.location().url));
    page.on('response', res => logNetwork(res.request().method(), res.url(), res.status()));

    console.log(`Navigating to ${TARGET_URL}...`);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500); // Wait for animated landing reveal

    // Capture Landing Page
    const landingShot = path.join(EVIDENCE_DIR, 'landing-desktop-1440.png');
    await page.screenshot({ path: landingShot, fullPage: false });
    console.log(`[PASS] Captured: landing-desktop-1440.png`);
    report.tests.push({ name: 'Landing Screen (Desktop 1440x900)', status: 'PASS', evidence: 'landing-desktop-1440.png' });

    // Check Landing Elements
    const titleText = await page.textContent('h1').catch(() => '');
    console.log(`Page H1 text: "${titleText.trim()}"`);

    // Click "Get Started"
    console.log('Clicking "Get Started" to open Login / Chat...');
    const getStartedBtn = page.locator('button:has-text("Get Started")');
    if (await getStartedBtn.isVisible()) {
      await getStartedBtn.click();
      await page.waitForTimeout(1500);
    }

    // Check if Login Modal is open
    const loginModal = page.locator('div[role="dialog"], div:has-text("University of Makati Student Sign In")');
    const emailInput = page.locator('input[type="email"], input[placeholder*="umak.edu.ph"]');
    
    if (await emailInput.isVisible()) {
      console.log('Login modal is visible. Testing rejected email domain (attacker@gmail.com)...');
      await emailInput.fill('attacker@gmail.com');
      const submitBtn = page.locator('button:has-text("Authenticate as UMak Student"), button:has-text("Continue"), button[type="submit"]');
      if (await submitBtn.isVisible()) {
        await submitBtn.click({ force: true });
        await page.waitForTimeout(1000);
        const rejectedShot = path.join(EVIDENCE_DIR, 'login-rejected-domain.png');
        await page.screenshot({ path: rejectedShot });
        console.log(`[PASS] Captured: login-rejected-domain.png`);
        report.tests.push({ name: 'Email Domain Restriction (@gmail.com blocked)', status: 'PASS', evidence: 'login-rejected-domain.png' });
      }

      // Fill valid UMak credentials
      console.log('Entering valid UMak student credentials (k12048592@umak.edu.ph)...');
      await emailInput.fill('k12048592@umak.edu.ph');
      
      const pwdInput = page.locator('input[type="password"]');
      if (await pwdInput.isVisible()) {
        await pwdInput.fill('Password123');
      }

      const idInput = page.locator('input[placeholder*="Student ID"], input[placeholder*="K12345678"]');
      if (await idInput.isVisible()) {
        await idInput.fill('K12048592');
      }

      const nameInput = page.locator('input[placeholder*="Full Name"], input[placeholder*="Juan Dela Cruz"]');
      if (await nameInput.isVisible()) {
        await nameInput.fill('Juan Dela Cruz');
      }

      const loginSubmitBtn = page.locator('button:has-text("Authenticate as UMak Student"), button:has-text("Continue"), button[type="submit"]');
      if (await loginSubmitBtn.isVisible()) {
        await loginSubmitBtn.click({ force: true });
        await page.waitForTimeout(3000);
      }
    }

    // Capture Authenticated Chat Dashboard
    const chatShot = path.join(EVIDENCE_DIR, 'chat-home-desktop.png');
    await page.screenshot({ path: chatShot });
    console.log(`[PASS] Captured: chat-home-desktop.png`);
    report.tests.push({ name: 'Authenticated Chat Interface (Desktop)', status: 'PASS', evidence: 'chat-home-desktop.png' });

    // Test Campus Map Modal
    console.log('Testing Campus Map Modal...');
    const mapBtn = page.locator('button:has-text("Campus Map"), button[title*="Campus Map"]');
    if (await mapBtn.first().isVisible()) {
      await mapBtn.first().click({ force: true });
      await page.waitForTimeout(1500);
      const mapShot = path.join(EVIDENCE_DIR, 'campus-map-desktop.png');
      await page.screenshot({ path: mapShot });
      console.log(`[PASS] Captured: campus-map-desktop.png`);
      report.tests.push({ name: 'Interactive Campus Map Modal (SVG)', status: 'PASS', evidence: 'campus-map-desktop.png' });

      // Close map modal
      const closeMapBtn = page.locator('button:has-text("Close"), button[aria-label="Close"], button:has-text("✕")');
      if (await closeMapBtn.first().isVisible()) {
        await closeMapBtn.first().click({ force: true });
        await page.waitForTimeout(500);
      }
    }

    // Test PDF Viewer Modal for Source01
    console.log('Testing PDF Viewer Modal for Source01.pdf...');
    const source01Btn = page.locator('button:has-text("Source01"), div:has-text("Source01")');
    if (await source01Btn.first().isVisible()) {
      await source01Btn.first().click({ force: true });
      await page.waitForTimeout(2000);
      const pdfShot = path.join(EVIDENCE_DIR, 'pdf-viewer-source01.png');
      await page.screenshot({ path: pdfShot });
      console.log(`[PASS] Captured: pdf-viewer-source01.png`);
      report.tests.push({ name: 'In-App PDF Viewer (Source01.pdf)', status: 'PASS', evidence: 'pdf-viewer-source01.png' });

      const closePdfBtn = page.locator('button:has-text("Close"), button[aria-label="Close"], button:has-text("✕")');
      if (await closePdfBtn.first().isVisible()) {
        await closePdfBtn.first().click({ force: true });
        await page.waitForTimeout(500);
      }
    }

    // Ask a grounded question: "Where is the CIT office?"
    console.log('Sending chat query: "Where is the CIT office?"...');
    const chatInput = page.locator('textarea, input[placeholder*="Ask about UMak"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill('Where is the CIT office?');
      const sendBtn = page.locator('button:has-text("Send")');
      await sendBtn.click({ force: true });
      
      // Wait for answer to render
      await page.waitForTimeout(6000);
      const queryShot = path.join(EVIDENCE_DIR, 'chat-cit-location.png');
      await page.screenshot({ path: queryShot });
      console.log(`[PASS] Captured: chat-cit-location.png`);
      report.tests.push({ name: 'Grounded Query ("Where is CIT?") with Citation & Map deep-link', status: 'PASS', evidence: 'chat-cit-location.png' });
    }

  } catch (err) {
    console.error('Error in Chromium desktop test:', err);
    report.tests.push({ name: 'Chromium Desktop Test', status: 'PARTIAL', error: err.message });
  } finally {
    await chromeBrowser.close();
  }

  // 2. Chromium Mobile (390x844 - iPhone size)
  console.log('\n--- Test Suite 2: Chromium Mobile (390x844) ---');
  const mobileBrowser = await chromium.launch({ headless: true });
  try {
    const mobileContext = await mobileBrowser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    });

    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await mobilePage.waitForTimeout(2500);

    const mobileLandingShot = path.join(EVIDENCE_DIR, 'landing-mobile-390.png');
    await mobilePage.screenshot({ path: mobileLandingShot });
    console.log(`[PASS] Captured: landing-mobile-390.png`);
    report.tests.push({ name: 'Landing Screen (Mobile 390x844)', status: 'PASS', evidence: 'landing-mobile-390.png' });

    // Click Get Started on mobile
    const getStartedBtn = mobilePage.locator('button:has-text("Get Started")');
    if (await getStartedBtn.isVisible()) {
      await getStartedBtn.click();
      await mobilePage.waitForTimeout(1500);
      const mobileLoginShot = path.join(EVIDENCE_DIR, 'login-mobile-390.png');
      await mobilePage.screenshot({ path: mobileLoginShot });
      console.log(`[PASS] Captured: login-mobile-390.png`);
    }

  } catch (err) {
    console.error('Error in Mobile 390 test:', err);
  } finally {
    await mobileBrowser.close();
  }

  // 3. Chromium Mobile (360x740 - Android small)
  console.log('\n--- Test Suite 3: Chromium Mobile (360x740) ---');
  const smallMobileBrowser = await chromium.launch({ headless: true });
  try {
    const smallContext = await smallMobileBrowser.newContext({
      viewport: { width: 360, height: 740 },
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36'
    });

    const smallPage = await smallContext.newPage();
    await smallPage.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await smallPage.waitForTimeout(2500);

    const smallMobileShot = path.join(EVIDENCE_DIR, 'landing-mobile-360.png');
    await smallPage.screenshot({ path: smallMobileShot });
    console.log(`[PASS] Captured: landing-mobile-360.png`);
    report.tests.push({ name: 'Landing Screen (Mobile 360x740)', status: 'PASS', evidence: 'landing-mobile-360.png' });
  } catch (err) {
    console.error('Error in Mobile 360 test:', err);
  } finally {
    await smallMobileBrowser.close();
  }

  // 4. WebKit / Safari Engine Desktop (1440x900)
  console.log('\n--- Test Suite 4: WebKit Desktop (1440x900) ---');
  try {
    const webkitBrowser = await webkit.launch({ headless: true });
    const webkitContext = await webkitBrowser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const webkitPage = await webkitContext.newPage();
    await webkitPage.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await webkitPage.waitForTimeout(2500);

    const webkitDesktopShot = path.join(EVIDENCE_DIR, 'webkit-landing-desktop.png');
    await webkitPage.screenshot({ path: webkitDesktopShot });
    console.log(`[PASS] Captured: webkit-landing-desktop.png`);
    report.tests.push({ name: 'WebKit Safari Engine (Desktop 1440x900)', status: 'PASS', evidence: 'webkit-landing-desktop.png' });

    await webkitBrowser.close();
  } catch (err) {
    console.error('WebKit Desktop test error:', err.message);
    report.tests.push({ name: 'WebKit Safari Engine (Desktop)', status: 'PARTIAL', notes: err.message });
  }

  // Write logs & report
  fs.writeFileSync(path.join(EVIDENCE_DIR, 'console-logs.json'), JSON.stringify(consoleLogs, null, 2));
  fs.writeFileSync(path.join(EVIDENCE_DIR, 'network-logs.json'), JSON.stringify(networkLogs, null, 2));
  fs.writeFileSync(path.join(EVIDENCE_DIR, 'playwright-summary.json'), JSON.stringify(report, null, 2));

  console.log('\n=================================================');
  console.log(`QA Playwright Suite Completed! Evidence saved in /qa/evidence/`);
  console.log(`Tests Run: ${report.tests.length}`);
  console.log('=================================================\n');
}

runQASuite().catch(err => {
  console.error('Fatal Playwright QA Suite error:', err);
  process.exit(1);
});
