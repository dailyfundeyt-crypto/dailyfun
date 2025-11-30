import { test, expect } from '@playwright/test';

test('basic navigation test', async ({ page }) => {
    // 1. Load Homepage
    await page.goto('/');

    // Check if we are on the search page (as observed in manual QA)
    // Note: The homepage redirects to /search apparently.
    await expect(page).toHaveURL(/.*\/search/);

    // 2. Navigate to AI Chat
    // Using text selector which is robust enough for this level of testing
    await page.click('text=AI Chat');

    // Verify URL changes to /ai
    await expect(page).toHaveURL(/.*\/ai/);

    // Verify some element on the AI page exists (optional, but good practice)
    // We'll just assume if URL changed, it's good for now.

    // 3. Navigate back to Home
    await page.click('text=Home');

    // Verify we are back on search
    await expect(page).toHaveURL(/.*\/search/);
});
