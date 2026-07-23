import { expect, test } from '@playwright/test';

test.skip(!process.env.E2E_BASE_URL, 'Set E2E_BASE_URL for a configured deployment.');

test('unauthenticated admin visits are redirected to password login', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByLabel('Password')).toBeVisible();
});
