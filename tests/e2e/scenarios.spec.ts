import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('10 Scenarios Verification Suite', () => {

  test('Scenario 4: Minor driver (19, licence 1.1 years) - instant rejection', async ({ page }) => {
    await page.goto('/');
    await page.fill('textarea', 'je veux louer une voiture. J ai 19 ans et mon permis date de 1 an. La voiture sera une golf du 2025-10-01 au 2025-10-05');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.lucide-loader2')).toHaveCount(0, { timeout: 30000 });
    
    const intentBadge = await page.locator('[data-testid="intent-badge"]').last();
    await expect(intentBadge).not.toHaveText(/out_of_scope/i);
    
    const validationStatus = await page.locator('[data-testid="validation-status"]').last();
    await expect(validationStatus).toHaveText(/REJECTED/i);
  });

  test('Scenario 5: Expired licence - instant rejection', async ({ page }) => {
    await page.goto('/');
    await page.fill('textarea', 'je veux louer une golf du 2025-10-01 au 2025-10-05. J ai 35 ans. Mon permis a ete delivre le 2010-01-01 et a expire le 2020-01-01.');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.lucide-loader2')).toHaveCount(0, { timeout: 30000 });
    
    const validationStatus = await page.locator('[data-testid="validation-status"]').last();
    await expect(validationStatus).toHaveText(/REJECTED/i);
    
    const response = await page.locator('.prose').last().innerText();
    expect(response).toContain('expire');
  });

  test('Scenario 6: Young driver (22) + Premium vehicle - PENDING_REVIEW', async ({ page }) => {
    await page.goto('/');
    await page.fill('textarea', 'je veux louer une Mercedes Class A du 2025-10-01 au 2025-10-05. J ai 22 ans. Permis delivre le 2021-01-01');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.lucide-loader2')).toHaveCount(0, { timeout: 30000 });
    
    const bookingStatus = await page.locator('[data-testid="booking-status"]').last();
    await expect(bookingStatus).toHaveText(/PENDING_REVIEW/i);
  });

  test('Scenario 7: Discount above 15% - capped at 15%', async ({ page }) => {
    await page.goto('/');
    await page.fill('textarea', 'je veux louer une dacia du 2025-10-01 au 2025-10-05. J ai 30 ans. Permis delivre le 2018-01-01. Code SUMMER20');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.lucide-loader2')).toHaveCount(0, { timeout: 30000 });
    
    const discountResult = await page.locator('[data-testid="discount-result"]').last();
    await expect(discountResult).toHaveText(/15% DISCOUNT \(CAPPED\)/i);
  });

  test('Scenario 8: Pure policy question', async ({ page }) => {
    await page.goto('/');
    await page.fill('textarea', 'Quelles sont les conditions d annulation ?');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.lucide-loader2')).toHaveCount(0, { timeout: 30000 });
    
    const intentBadge = await page.locator('[data-testid="intent-badge"]').last();
    await expect(intentBadge).toHaveText(/POLICY_QUERY/i);
  });

  test('Scenario 9: Genuinely off-topic message', async ({ page }) => {
    await page.goto('/');
    await page.fill('textarea', 'Donne moi une recette de cuisine pour des crepes');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.lucide-loader2')).toHaveCount(0, { timeout: 30000 });
    
    const intentBadge = await page.locator('[data-testid="intent-badge"]').last();
    await expect(intentBadge).toHaveText(/OUT_OF_SCOPE/i);
  });

  test('Scenario 10: Valid complete reservation - PDF generated', async ({ page }) => {
    await page.goto('/');
    await page.fill('textarea', 'je veux louer une dacia du 2025-10-01 au 2025-10-05. J ai 30 ans. Permis delivre le 2018-01-01.');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.lucide-loader2')).toHaveCount(0, { timeout: 30000 });
    
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
  });

});
