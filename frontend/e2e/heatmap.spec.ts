import { test, expect } from '@playwright/test';

test('heatmap appears after analyze', async ({ page }) => {
  // Adjust URL if vite uses different port
  await page.goto('http://localhost:5173');
  await page.fill('textarea', 'Happy\nSad\nOkay');
  await page.click('button:has-text("Analyze")');
  // wait for some cell elements to appear
  await page.waitForSelector('.grid .h-16, .heatmap-grid .cell, [title^="score:"]', { timeout: 5000 }).catch(()=>{});
  // assert at least one cell exists by reading any element with title containing score
  const cells = await page.locator('[title^="score:"]').count();
  expect(cells).toBeGreaterThan(0);
});
