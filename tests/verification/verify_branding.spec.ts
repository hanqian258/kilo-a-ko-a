import { test, expect } from '@playwright/test';

test('Verify Branding and Footer', async ({ page }) => {
  // Set localStorage to bypass notification prompt
  await page.addInitScript(() => {
    window.localStorage.setItem('hasHandledNotifications', 'true');
  });

  await page.goto('http://localhost:3001');

  // Verify Header Subtitle
  const headerSubtitle = page.locator('header p:has-text("YUMIN EDU")');
  await expect(headerSubtitle).toBeVisible();

  // Verify Footer Branding
  const footer = page.locator('footer');
  await expect(footer).toContainText('Yumin Edu');

  // Ensure ReefTeach is NOT the primary branding in footer subtitle
  const footerSubtitle = footer.locator('p.tracking-widest');
  await expect(footerSubtitle).toHaveText('Yumin Edu');

  // Verify "Kilo a Ko'a" in nav (Gallery)
  const galleryLink = page.locator('nav >> text=Kilo a Ko\'a');
  await expect(galleryLink).toBeVisible();

  await page.screenshot({ path: '/home/jules/verification/branding_footer.png', fullPage: true });
});
