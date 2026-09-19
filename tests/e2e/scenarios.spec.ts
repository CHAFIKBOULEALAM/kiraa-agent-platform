import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { Client } from 'pg';

async function getCheckpointCount(threadId: string): Promise<number> {
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://kiraa:kiraa@localhost:5432/kiraa' });
  await client.connect();
  const res = await client.query('SELECT COUNT(*) as count FROM checkpoints WHERE thread_id = $1', [threadId]);
  await client.end();
  return parseInt(res.rows[0].count, 10);
}

test.describe('10 Scenarios Verification Suite', () => {
  test.setTimeout(600000); // Global timeout for all scenario tests

  test('Scenario 1: Missing Details - Missing driver age', async ({ page }) => {
    await page.goto('/');
    const responsePromise = page.waitForResponse(res => res.url().includes('/api/chat') && res.status() === 200, { timeout: 600000 });
    await page.locator('[data-testid="chat-input"]').pressSequentially('je veux louer une FIAT 500 du 2025-10-01 au 2025-10-05. Permis delivre le 2020-01-01', { delay: 80 });
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    
    const resApi = await responsePromise;
    const threadId = (await resApi.json()).requestId;
    await expect(page.locator('[data-testid="agent-response"]').last()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="agent-response"]').last().locator('.lucide-loader2')).toHaveCount(0);
    
    const intentBadge = await page.locator('[data-testid="intent-badge"]').last();
    await expect(intentBadge).toHaveText(/MISSING_DETAILS/i);
    
    const count = await getCheckpointCount(threadId);
    console.log(`Scenario 1 Checkpoints for ${threadId}: ${count}`);
  });

  test('Scenario 2: Missing Details - Missing license issue date', async ({ page }) => {
    await page.goto('/');
    const responsePromise = page.waitForResponse(res => res.url().includes('/api/chat') && res.status() === 200, { timeout: 600000 });
    await page.locator('[data-testid="chat-input"]').pressSequentially('je veux louer une FIAT 500 du 2025-10-01 au 2025-10-05. J ai 30 ans.', { delay: 80 });
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    
    const resApi = await responsePromise;
    const threadId = (await resApi.json()).requestId;
    await expect(page.locator('[data-testid="agent-response"]').last()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="agent-response"]').last().locator('.lucide-loader2')).toHaveCount(0);
    
    const intentBadge = await page.locator('[data-testid="intent-badge"]').last();
    await expect(intentBadge).toHaveText(/MISSING_DETAILS/i);
    
    const count = await getCheckpointCount(threadId);
    console.log(`Scenario 2 Checkpoints for ${threadId}: ${count}`);
  });

  test('Scenario 3: Missing Details - Missing dates', async ({ page }) => {
    await page.goto('/');
    const responsePromise = page.waitForResponse(res => res.url().includes('/api/chat') && res.status() === 200, { timeout: 600000 });
    await page.locator('[data-testid="chat-input"]').pressSequentially('je veux louer une FIAT 500. J ai 30 ans. Permis delivre le 2020-01-01', { delay: 80 });
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    
    const resApi = await responsePromise;
    const threadId = (await resApi.json()).requestId;
    await expect(page.locator('[data-testid="agent-response"]').last()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="agent-response"]').last().locator('.lucide-loader2')).toHaveCount(0);
    
    const intentBadge = await page.locator('[data-testid="intent-badge"]').last();
    await expect(intentBadge).toHaveText(/MISSING_DETAILS/i);
    
    const count = await getCheckpointCount(threadId);
    console.log(`Scenario 3 Checkpoints for ${threadId}: ${count}`);
  });

  test('Scenario 4: Minor driver (19, licence 1.1 years) - instant rejection', async ({ page }) => {
    await page.goto('/');
    const responsePromise = page.waitForResponse(res => res.url().includes('/api/chat') && res.status() === 200, { timeout: 600000 });
    await page.locator('[data-testid="chat-input"]').pressSequentially( 'je veux louer une voiture. J ai 19 ans. Permis delivre le 2024-01-01. La voiture sera une FIAT 500 du 2025-10-01 au 2025-10-05', { delay: 80 });
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    
    const resApi = await responsePromise;
    const threadId = (await resApi.json()).requestId;
    await expect(page.locator('[data-testid="agent-response"]').last()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="agent-response"]').last().locator('.lucide-loader2')).toHaveCount(0);
    
    const intentBadge = await page.locator('[data-testid="intent-badge"]').last();
    await expect(intentBadge).not.toHaveText(/out_of_scope/i);
    
    const validationStatus = await page.locator('[data-testid="validation-status"]').last();
    await expect(validationStatus).toHaveText(/REJECTED/i);
    
    const count = await getCheckpointCount(threadId);
    console.log(`Scenario 4 Checkpoints for ${threadId}: ${count}`);
  });

  test('Scenario 5: Expired licence - instant rejection', async ({ page }) => {
    await page.goto('/');
    const responsePromise = page.waitForResponse(res => res.url().includes('/api/chat') && res.status() === 200, { timeout: 600000 });
    await page.locator('[data-testid="chat-input"]').pressSequentially( 'je veux louer une FIAT 500 du 2025-10-01 au 2025-10-05. J ai 35 ans. Mon permis a ete delivre le 2010-01-01 et a expire le 2020-01-01.', { delay: 80 });
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    
    const resApi = await responsePromise;
    const json = await resApi.json();
    console.log("API JSON RESPONSE FOR SCENARIO 5:", JSON.stringify(json, null, 2));
    const threadId = json.requestId;
    await expect(page.locator('[data-testid="agent-response"]').last()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="agent-response"]').last().locator('.lucide-loader2')).toHaveCount(0);
    
    const validationStatus = await page.locator('[data-testid="validation-status"]').last();
    await expect(validationStatus).toHaveText(/REJECTED/i);
    
    const responseText = await page.locator('[data-testid="agent-response"]').last().innerText();
    expect(responseText).toMatch(/expir[eé]/i);
    
    const count = await getCheckpointCount(threadId);
    console.log(`Scenario 5 Checkpoints for ${threadId}: ${count}`);
  });

  test('Scenario 6: Young driver (22) + Premium vehicle - PENDING_REVIEW', async ({ page }) => {
    await page.goto('/');
    const responsePromise = page.waitForResponse(res => res.url().includes('/api/chat') && res.status() === 200, { timeout: 600000 });
    await page.locator('[data-testid="chat-input"]').pressSequentially( 'je veux louer une Porsche Panamera du 2025-10-01 au 2025-10-05. J ai 22 ans. Permis delivre le 2021-01-01', { delay: 80 });
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    
    const resApi = await responsePromise;
    const threadId = (await resApi.json()).requestId;
    await expect(page.locator('[data-testid="agent-response"]').last()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="agent-response"]').last().locator('.lucide-loader2')).toHaveCount(0);
    
    const bookingStatus = await page.locator('[data-testid="booking-status"]').last();
    await expect(bookingStatus).toHaveText(/PENDING_REVIEW/i);
    
    const count = await getCheckpointCount(threadId);
    console.log(`Scenario 6 Checkpoints for ${threadId}: ${count}`);
  });

  test('Scenario 7: Discount above 15% - capped at 15%', async ({ page }) => {
    await page.goto('/');
    const responsePromise = page.waitForResponse(res => res.url().includes('/api/chat') && res.status() === 200, { timeout: 600000 });
    await page.locator('[data-testid="chat-input"]').pressSequentially( 'Je souhaite une FIAT 500 à partir du 1er octobre 2025 jusqu\'au 5 octobre, j\'ai 30 ans, permis obtenu en 2018-01-01, code promo SUMMER20', { delay: 80 });
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    
    const resApi = await responsePromise;
    const threadId = (await resApi.json()).requestId;
    await expect(page.locator('[data-testid="agent-response"]').last()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="agent-response"]').last().locator('.lucide-loader2')).toHaveCount(0);
    
    const discountResult = await page.locator('[data-testid="discount-result"]').last();
    await expect(discountResult).toHaveText(/15% DISCOUNT \(CAPPED\)/i);
    
    const count = await getCheckpointCount(threadId);
    console.log(`Scenario 7 Checkpoints for ${threadId}: ${count}`);
  });

  test('Scenario 8: Pure policy question', async ({ page }) => {
    await page.goto('/');
    const responsePromise = page.waitForResponse(res => res.url().includes('/api/chat') && res.status() === 200, { timeout: 600000 });
    await page.locator('[data-testid="chat-input"]').pressSequentially( 'Quelles sont les conditions d annulation ?', { delay: 80 });
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    
    const resApi = await responsePromise;
    const threadId = (await resApi.json()).requestId;
    await expect(page.locator('[data-testid="agent-response"]').last()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="agent-response"]').last().locator('.lucide-loader2')).toHaveCount(0);
    
    const intentBadge = await page.locator('[data-testid="intent-badge"]').last();
    await expect(intentBadge).toHaveText(/POLICY_QUERY/i);
    
    const count = await getCheckpointCount(threadId);
    console.log(`Scenario 8 Checkpoints for ${threadId}: ${count}`);
  });

  test('Scenario 9: Genuinely off-topic message', async ({ page }) => {
    await page.goto('/');
    const responsePromise = page.waitForResponse(res => res.url().includes('/api/chat') && res.status() === 200, { timeout: 600000 });
    await page.locator('[data-testid="chat-input"]').pressSequentially( 'Donne moi une recette de cuisine pour des crepes', { delay: 80 });
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    
    const resApi = await responsePromise;
    const threadId = (await resApi.json()).requestId;
    await expect(page.locator('[data-testid="agent-response"]').last()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="agent-response"]').last().locator('.lucide-loader2')).toHaveCount(0);
    
    const intentBadge = await page.locator('[data-testid="intent-badge"]').last();
    await expect(intentBadge).toHaveText(/OUT_OF_SCOPE/i);
    
    const count = await getCheckpointCount(threadId);
    console.log(`Scenario 9 Checkpoints for ${threadId}: ${count}`);
  });

  test('Scenario 10: Valid complete reservation - PDF generated', async ({ page }) => {
    await page.goto('/');
    const responsePromise = page.waitForResponse(res => res.url().includes('/api/chat') && res.status() === 200, { timeout: 600000 });
    await page.locator('[data-testid="chat-input"]').pressSequentially( 'Je souhaite une FIAT 500 à partir du 1er octobre 2025 jusqu\'au 5 octobre, j\'ai 30 ans, permis obtenu en 2018-01-01.', { delay: 80 });
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    
    const resApi = await responsePromise;
    const threadId = (await resApi.json()).requestId;
    await expect(page.locator('[data-testid="agent-response"]').last()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="agent-response"]').last().locator('.lucide-loader2')).toHaveCount(0);
    
    const pdfDownload = page.locator('[data-testid="pdf-download"]').last();
    await expect(pdfDownload).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      pdfDownload.click()
    ]);
    
    const downloadPath = await download.path();
    if (!downloadPath) throw new Error('Download path is null');
    
    const buffer = fs.readFileSync(downloadPath);
    const signature = buffer.slice(0, 5).toString();
    expect(signature).toBe('%PDF-');
    
    const count = await getCheckpointCount(threadId);
    console.log(`Scenario 10 Checkpoints for ${threadId}: ${count}`);
  });

});
