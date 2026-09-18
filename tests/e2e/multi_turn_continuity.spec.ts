import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { Client } from 'pg';

test.describe('Multi-turn conversation continuity', () => {
  test('reproduces the screenshot bug step by step', async ({ page, request }, testInfo) => {
    // Phase 7B - Step 1: Load the chat page
    await page.goto('/');
    await expect(page).toHaveTitle(/Kiraa/i);

    let threadId = '';
    const responsePromise = page.waitForResponse(response => response.url().includes('/api/chat') && response.status() === 200);

    // Step 2: Type "je voudrais une voiture dassi pendant 2 jours" and send
    await page.fill('textarea', 'je voudrais une voiture dassi pendant 2 jours');
    await page.keyboard.press('Enter');

    const resApi = await responsePromise;
    const data = await resApi.json();
    threadId = data.requestId;
    console.log('Intercepted Thread ID:', threadId);
    
    // Wait for the assistant response to render
    await expect(page.locator('.prose').last()).not.toBeEmpty();
    // Use an explicit wait for the response to stabilize (loading spinner gone)
    await expect(page.locator('.lucide-loader2')).toHaveCount(0, { timeout: 30000 });
    
    let lastResponse = await page.locator('.prose').last().innerText();
    console.log('Step 2 Response:', lastResponse);
    
    await expect(lastResponse).not.toContain('Desole, je suis un assistant specialise');
    // Ensure an intent badge is shown and is not out_of_scope
    const intentBadge2 = await page.locator('[data-testid="intent-badge"]').last().innerText();
    expect(intentBadge2).not.toContain('out_of_scope');
    
    await page.screenshot({ path: path.join(testInfo.outputDir, 'step2_dassi.png'), fullPage: true });

    // Database check 1
    const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://kiraa:kiraa@localhost:5432/kiraa' });
    await client.connect();
    let res = await client.query('SELECT COUNT(*) as count FROM checkpoints WHERE thread_id = $1', [threadId]);
    let count1 = parseInt(res.rows[0].count, 10);
    console.log(`Step 2 DB Checkpoints for ${threadId}: ${count1}`);
    expect(count1).toBeGreaterThan(0);

    await page.waitForTimeout(500);

    // Step 3: Type "Dassia" and send
    await page.fill('textarea', 'Dassia');
    await page.keyboard.press('Enter');
    
    // Wait for the response
    await expect(page.locator('.lucide-loader2')).toHaveCount(0, { timeout: 30000 });
    lastResponse = await page.locator('.prose').last().innerText();
    console.log('Step 3 Response:', lastResponse);
    
    await expect(lastResponse).not.toContain('Desole, je suis un assistant specialise');
    // Assert the response continues the same flow
    const intentBadge3 = await page.locator('[data-testid="intent-badge"]').last().innerText();
    expect(intentBadge3).not.toContain('out_of_scope');
    
    await page.screenshot({ path: path.join(testInfo.outputDir, 'step3_dassia.png'), fullPage: true });

    // Database check 2
    res = await client.query('SELECT COUNT(*) as count FROM checkpoints WHERE thread_id = $1', [threadId]);
    let count2 = parseInt(res.rows[0].count, 10);
    console.log(`Step 3 DB Checkpoints for ${threadId}: ${count2}`);
    expect(count2).toBeGreaterThan(count1);

    // Step 4: Type "ok c'est voila tarif 5000 dh" and send
    await page.fill('textarea', "ok c'est voila tarif 5000 dh");
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.lucide-loader2')).toHaveCount(0, { timeout: 30000 });
    lastResponse = await page.locator('.prose').last().innerText();
    console.log('Step 4 Response:', lastResponse);
    
    await expect(lastResponse).not.toContain('Desole, je suis un assistant specialise');
    const intentBadge4 = await page.locator('[data-testid="intent-badge"]').last().innerText();
    expect(intentBadge4).not.toContain('out_of_scope');
    
    await page.screenshot({ path: path.join(testInfo.outputDir, 'step4_tarif.png'), fullPage: true });

    // Database check 3
    res = await client.query('SELECT COUNT(*) as count FROM checkpoints WHERE thread_id = $1', [threadId]);
    let count3 = parseInt(res.rows[0].count, 10);
    console.log(`Step 4 DB Checkpoints for ${threadId}: ${count3}`);
    expect(count3).toBeGreaterThan(count2);

    // Step 5: Type "i have already told you" and send
    await page.fill('textarea', 'i have already told you');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.lucide-loader2')).toHaveCount(0, { timeout: 30000 });
    lastResponse = await page.locator('.prose').last().innerText();
    console.log('Step 5 Response:', lastResponse);
    
    await expect(lastResponse).not.toContain('Desole, je suis un assistant specialise');
    const intentBadge5 = await page.locator('[data-testid="intent-badge"]').last().innerText();
    expect(intentBadge5).not.toContain('out_of_scope');
    
    await page.screenshot({ path: path.join(testInfo.outputDir, 'step5_already.png'), fullPage: true });

    // Database check 4
    res = await client.query('SELECT COUNT(*) as count FROM checkpoints WHERE thread_id = $1', [threadId]);
    let count4 = parseInt(res.rows[0].count, 10);
    console.log(`Step 5 DB Checkpoints for ${threadId}: ${count4}`);
    expect(count4).toBeGreaterThan(count3);
    
    await client.end();

    // Copy screenshots to verification_screenshots/multi_turn_continuity/
    const targetDir = path.join(process.cwd(), 'verification_screenshots', 'multi_turn_continuity');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.copyFileSync(path.join(testInfo.outputDir, 'step2_dassi.png'), path.join(targetDir, 'step2_dassi.png'));
    fs.copyFileSync(path.join(testInfo.outputDir, 'step3_dassia.png'), path.join(targetDir, 'step3_dassia.png'));
    fs.copyFileSync(path.join(testInfo.outputDir, 'step4_tarif.png'), path.join(targetDir, 'step4_tarif.png'));
    fs.copyFileSync(path.join(testInfo.outputDir, 'step5_already.png'), path.join(targetDir, 'step5_already.png'));
  });
});
