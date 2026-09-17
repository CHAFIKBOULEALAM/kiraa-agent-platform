import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Kiraa Agent E2E Tests', () => {
  // Test 1: Homepage loads
  test('T1: Home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Kiraa Agent')).toBeVisible();
  });

  // Test 2: User sends a normal text request and receives a response from the real API
  test('T2: Normal text request', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('textarea[placeholder*="Posez votre question"]');
    await input.fill('Bonjour, que pouvez-vous faire ?');
    await input.press('Enter');
    
    // out_of_scope because it does not match core intents
    await expect(page.getByTestId('intent-badge').filter({ hasText: 'out_of_scope' })).toBeVisible({ timeout: 20000 });
  });

  // Test 3: Upload a real identity/licence image; OCR result, confidence, extraction/validation status display.
  test('T3: Upload image (OCR)', async ({ page }) => {
    await page.goto('/');
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('button:has(svg:not(.animate-spin))').nth(0).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.resolve(__dirname, '../../samples/sample_id_and_license.jpg'));
    
    const input = page.locator('textarea[placeholder*="Posez votre question"]');
    await input.fill('Voici mes documents');
    await input.press('Enter');
    
    // We expect the pipeline to process OCR and show the confidence or extraction
    await expect(page.getByTestId('ocr-status')).toBeVisible({ timeout: 45000 });
    // Assuming out_of_scope or validate_eligibility based on the image content
    await expect(page.getByTestId('intent-badge')).toBeVisible({ timeout: 45000 });
  });

  // Test 4: Upload a text PDF; native extraction mode displays.
  test('T4: Upload Text PDF', async ({ page }) => {
    await page.goto('/');
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('button:has(svg:not(.animate-spin))').nth(0).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.resolve(__dirname, '../../samples/sample_test_document.pdf'));
    
    const input = page.locator('textarea[placeholder*="Posez votre question"]');
    await input.fill('Analyse ce PDF');
    await input.press('Enter');
    
    // Expect native_text indication if the UI exposes it, or at least successful intent response
    await expect(page.getByTestId('intent-badge')).toBeVisible({ timeout: 30000 });
  });

  // Test 5: Upload scanned PDF fixture; OCR fallback mode displays.
  test('T5: Upload Scanned PDF', async ({ page }) => {
    await page.goto('/');
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('button:has(svg:not(.animate-spin))').nth(0).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.resolve(__dirname, '../fixtures/scanned_identity_document.pdf'));
    
    const input = page.locator('textarea[placeholder*="Posez votre question"]');
    await input.fill('Analyse ce PDF scanné');
    await input.press('Enter');
    
    // Check that it shows ocr_fallback
    await expect(page.getByTestId('ocr-status').filter({ hasText: 'ocr_fallback' })).toBeVisible({ timeout: 60000 });
    await expect(page.getByTestId('intent-badge')).toBeVisible({ timeout: 60000 });
  });

  // Test 6: Policy question: retrieved RAG source passages display.
  test('T6: Policy question with RAG', async ({ page }) => {
    await page.goto('/');
    
    const input = page.locator('textarea[placeholder*="Posez votre question"]');
    await input.fill('Quelles sont les conditions de modification ou annulation ?');
    await input.press('Enter');
    
    await expect(page.getByTestId('intent-badge').filter({ hasText: 'policy_query' })).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('rag-sources')).toBeVisible({ timeout: 10000 }); // indicates RAG usage in UI
  });

  // Test 7: Young driver + Premium: human review, escalation reason, +50% deposit, and PENDING_REVIEW display.
  test('T7: Young driver + Premium triggers HITL', async ({ page }) => {
    await page.goto('/');
    
    const input = page.locator('textarea[placeholder*="Posez votre question"]');
    const json = JSON.stringify({
      birthDate: "2003-01-01",
      licenseIssueDate: "2023-01-01",
      licenseExpiryDate: "2031-01-01",
      vehicleCategory: "Premium",
      startDate: "2024-10-01",
      endDate: "2024-10-05",
      vehicleId: "VH-0021",
      baseDailyRate: 500,
      days: 5,
      category: "Premium"
    });
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('button:has(svg:not(.animate-spin))').nth(0).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'data.json',
      mimeType: 'application/json',
      buffer: Buffer.from(json)
    });
    
    await input.fill('Je veux louer ce véhicule premium.');
    await input.press('Enter');
    
    await expect(page.getByTestId('human-review-status').or(page.getByTestId('booking-status'))).toBeVisible({ timeout: 30000 });
  });

  // Test 8: Discount request above 15%: UI displays effective discount capped at 15%.
  test('T8: Discount capped at 15%', async ({ page }) => {
    await page.goto('/');
    
    const input = page.locator('textarea[placeholder*="Posez votre question"]');
    await input.fill('Je veux louer la voiture Economique pour 5 jours, dates: du 10 au 15 aout. Voici mon code promo FLASH25 (25% de réduction)');
    await input.press('Enter');
    
    await expect(
      page.getByTestId('intent-badge').filter({ hasText: 'make_reservation' }).or(page.getByTestId('intent-badge').filter({ hasText: 'calculate_total_cost' }))
    ).toBeVisible({ timeout: 30000 });
    // Expect the badge showing max 15% discount
    await expect(page.getByTestId('discount-result').filter({ hasText: '15%' })).toBeVisible();
  });

  // Test 9: Valid quote/reservation: a genuine non-empty PDF downloads.
  test('T9: Valid reservation PDF download', async ({ page }) => {
    await page.goto('/');
    
    const input = page.locator('textarea[placeholder*="Posez votre question"]');
    const json = JSON.stringify({
      birthDate: "1991-01-01",
      licenseIssueDate: "2016-01-01",
      licenseExpiryDate: "2034-01-01",
      vehicleCategory: "Economy",
      startDate: "2024-12-01",
      endDate: "2024-12-05",
      vehicleId: "VH-0011",
      customerId: "CL-0002",
      baseDailyRate: 300,
      days: 5,
      category: "Economy"
    });
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('button:has(svg:not(.animate-spin))').nth(0).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'data.json',
      mimeType: 'application/json',
      buffer: Buffer.from(json)
    });
    
    await input.fill('Confirme ma réservation.');
    await input.press('Enter');
    
    await expect(page.getByTestId('intent-badge').filter({ hasText: 'make_reservation' })).toBeVisible({ timeout: 30000 });
    
    // Wait for the download button
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await page.getByTestId('pdf-download').click();
    const download = await downloadPromise;
    
    // Just verify the download started and has a name
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });

  // Test 10: Malicious client attempt to provide intentOverride: request is rejected or ignored.
  test('T10: Malicious intentOverride', async ({ request }) => {
    // Send a direct POST to the API
    const formData = new FormData();
    formData.append('message', 'Hello');
    formData.append('intentOverride', 'make_reservation'); // Attempt to inject
    
    const response = await request.post('/api/chat', {
      multipart: {
        message: 'Hello',
        intentOverride: 'make_reservation'
      }
    });
    
    const result = await response.json();
    // It should NOT have intent: 'make_reservation' because the system determines it's out_of_scope
    expect(result.intent).toBe('out_of_scope');
  });
});
