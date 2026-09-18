import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const outDir = path.join(__dirname, 'verification_screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

async function run() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to local dev server...');
  await page.goto('http://localhost:3001');
  await page.waitForTimeout(2000);

  // Helper to send message and wait for reply
  async function sendMessage(msg: string) {
    await page.fill('textarea', msg);
    await page.click('button[type="submit"]');
    // wait for response by waiting for some text or just time
    await page.waitForTimeout(6000); 
  }

  // 1. MISSING_DETAILS
  console.log('Testing MISSING_DETAILS...');
  await sendMessage('je veux louer une Audi A7');
  await page.screenshot({ path: path.join(outDir, 'missing_details_badge.png') });

  // 2. PENDING_REVIEW
  console.log('Testing PENDING_REVIEW...');
  await sendMessage("je veux louer une Range Rover, j'ai 22 ans");
  await page.screenshot({ path: path.join(outDir, 'pending_review_badge.png') });

  // 3. REJECTED
  console.log('Testing REJECTED...');
  await sendMessage("je veux louer une Range Rover, j'ai 18 ans");
  await page.screenshot({ path: path.join(outDir, 'rejected_badge.png') });

  // 4. APPROVED
  console.log('Testing APPROVED...');
  await sendMessage("je veux louer une Audi A7 du 15 au 20 octobre, j'ai 30 ans");
  await page.screenshot({ path: path.join(outDir, 'approved_badge.png') });

  // Dark mode
  console.log('Testing Dark Mode...');
  // Find theme toggle button - usually a moon/sun icon button
  // We'll just click the button with 'theme' in aria-label or title if exists
  const themeBtn = await page.$('[aria-label*="theme" i], [title*="theme" i], button:has(svg.lucide-moon), button:has(svg.lucide-sun)');
  if (themeBtn) {
    await themeBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'dark_mode.png') });
  }

  // Drag and drop test (upload state)
  console.log('Testing File Upload State...');
  // Find a file input
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    // Create a dummy file
    fs.writeFileSync('dummy.pdf', 'dummy pdf content');
    await fileInput.setInputFiles('dummy.pdf');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'file_upload_state.png') });
  }

  await browser.close();
  console.log('Done screenshots!');
}

run().catch(console.error);
