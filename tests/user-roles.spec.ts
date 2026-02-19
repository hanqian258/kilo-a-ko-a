import { test, expect } from '@playwright/test';

test.describe('User Role Workflows', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Donor Workflow', async ({ page }) => {
    await test.step('Login as Donor', async () => {
      // Navigate to Login - Use .first() to avoid ambiguity if mobile menu is present
      const loginButton = page.getByRole('button', { name: 'Login' }).first();
      if (await loginButton.isVisible()) {
        await loginButton.click();
      }

      // Fill Login Form
      await page.getByPlaceholder('Email Address').fill('donor@example.com');
      // Role selection removed as it is not in UI
      await page.getByRole('button', { name: 'Sign In' }).click();

      // Verify Login Success (Profile button or Logout button visible)
      await expect(page.getByTitle('Log Out')).toBeVisible();
    });

    await test.step('View Fundraiser', async () => {
      await page.getByRole('navigation').getByRole('button', { name: 'Fundraiser' }).click();
      await expect(page.getByRole('heading', { name: 'Mitigating Local Stressors' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Donate Now' })).toBeVisible();
    });

    await test.step('View Profile', async () => {
      // Access profile via User icon in nav
      await page.getByRole('button', { name: 'Profile' }).click();
      await expect(page.getByText('donor@example.com')).toBeVisible();
      // Expect Achievements tab instead of History
      await expect(page.getByText('Achievements')).toBeVisible();
    });

    await page.screenshot({ path: 'test-results/donor-workflow.png' });
  });

  test('Scientist Workflow', async ({ page }) => {
    await test.step('Login and Verify as Scientist', async () => {
      const loginButton = page.getByRole('button', { name: 'Login' }).first();
      if (await loginButton.isVisible()) {
        await loginButton.click();
      }

      await page.getByPlaceholder('Email Address').fill('scientist@example.com');
      await page.getByRole('button', { name: 'Sign In' }).click();

      await expect(page.getByTitle('Log Out')).toBeVisible();

      // Elevate Role to Scientist
      await page.getByRole('button', { name: 'Profile' }).click();
      await page.getByRole('button', { name: 'Data Management' }).click();
      await page.getByRole('button', { name: 'Enter Access Code' }).click();

      await page.getByPlaceholder('Access Code').fill('CORAL2026');
      await page.getByRole('button', { name: 'Verify Access' }).click();

      // Select Scientist and Update
      // Click the button wrapping "Scientist"
      await page.getByText('Scientist', { exact: true }).click();
      await page.getByRole('button', { name: 'Update Role' }).click();

      // Verify role update
      await expect(page.getByText('Scientist Steward')).toBeVisible();
    });

    await test.step('Navigate to Gallery and Verify Upload', async () => {
      await page.getByRole('navigation').getByRole('button', { name: "Kilo a Ko'a" }).click();

      // Scientist should see "Community Observation" button
      const uploadButton = page.getByRole('button', { name: 'Community Observation' });
      await expect(uploadButton).toBeVisible();

      // Click to open modal
      await uploadButton.click();
      await expect(page.getByText('New Observation')).toBeVisible();

      // Close modal
      await page.getByRole('button', { name: 'Discard' }).click();
    });

    await page.screenshot({ path: 'test-results/scientist-workflow.png' });
  });

  test('Admin Workflow', async ({ page }) => {
    await test.step('Login and Verify as Admin', async () => {
      const loginButton = page.getByRole('button', { name: 'Login' }).first();
      if (await loginButton.isVisible()) {
        await loginButton.click();
      }

      await page.getByPlaceholder('Email Address').fill('admin@example.com');
      await page.getByRole('button', { name: 'Sign In' }).click();

      await expect(page.getByTitle('Log Out')).toBeVisible();

      // Elevate Role to Admin
      await page.getByRole('button', { name: 'Profile' }).click();
      await page.getByRole('button', { name: 'Data Management' }).click();
      await page.getByRole('button', { name: 'Enter Access Code' }).click();

      await page.getByPlaceholder('Access Code').fill('CORAL2026');
      await page.getByRole('button', { name: 'Verify Access' }).click();

      // Select Admin and Update
      await page.getByText('Admin', { exact: true }).click();
      await page.getByRole('button', { name: 'Update Role' }).click();

      // Verify role update
      await expect(page.getByText('Admin Steward')).toBeVisible();
    });

    await test.step('Verify Awareness Editing', async () => {
      await page.getByRole('navigation').getByRole('button', { name: 'Awareness' }).click();

      // Admin should see "Publish Knowledge"
      await expect(page.getByRole('button', { name: 'Publish Knowledge' })).toBeVisible();
    });

    await test.step('Verify Gallery Moderation', async () => {
      await page.getByRole('navigation').getByRole('button', { name: "Kilo a Ko'a" }).click();

      // Admin should see "Community Observation" button
      await expect(page.getByRole('button', { name: 'Community Observation' })).toBeVisible();
    });

    await page.screenshot({ path: 'test-results/admin-workflow.png' });
  });

});
