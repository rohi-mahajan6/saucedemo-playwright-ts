import { test, expect } from '../../src/fixtures/test';
import { env } from '../../src/config/env';
import { Persona, personasThatCanLogIn } from '../../src/data/users';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  for (const persona of personasThatCanLogIn) {
    test(
      `${persona} can log in and sees the product list`,
      { tag: ['@smoke'] },
      async ({ loginPage, inventoryPage }) => {
        // performance_glitch_user is deliberately slow; give its navigation more room
        // and record how long it took so slowdowns show up in the report.
        const started = Date.now();
        await loginPage.login(persona, env.password);
        await expect(inventoryPage.title).toHaveText('Products', {
          timeout: persona === Persona.performanceGlitch ? 15_000 : undefined,
        });
        test
          .info()
          .annotations.push({ type: 'login-duration-ms', description: String(Date.now() - started) });

        await inventoryPage.expectLoaded();
        await expect(inventoryPage.items).toHaveCount(6);
      },
    );
  }

  test(
    'locked_out_user is rejected with a lockout message',
    { tag: ['@smoke'] },
    async ({ loginPage, page }) => {
      await loginPage.login(Persona.lockedOut, env.password);
      await loginPage.expectError('Epic sadface: Sorry, this user has been locked out.');
      await expect(page).not.toHaveURL(/inventory/);
    },
  );

  test('wrong password shows a credentials error', { tag: ['@regression'] }, async ({ loginPage }) => {
    await loginPage.login(Persona.standard, 'not-the-password');
    await loginPage.expectError('Epic sadface: Username and password do not match any user in this service');
  });

  test('empty username is rejected', { tag: ['@regression'] }, async ({ loginPage }) => {
    await loginPage.login('', env.password);
    await loginPage.expectError('Epic sadface: Username is required');
  });

  test('empty password is rejected', { tag: ['@regression'] }, async ({ loginPage }) => {
    await loginPage.login(Persona.standard, '');
    await loginPage.expectError('Epic sadface: Password is required');
  });

  test(
    'inventory page is not reachable without logging in',
    { tag: ['@regression'] },
    async ({ page, loginPage }) => {
      await page.goto('/inventory.html');
      await loginPage.expectError(
        "Epic sadface: You can only access '/inventory.html' when you are logged in.",
      );
    },
  );

  test('user can log out', { tag: ['@regression'] }, async ({ loginAs, inventoryPage, loginPage }) => {
    await loginAs(Persona.standard);
    await inventoryPage.header.logout();
    await expect(loginPage.loginButton).toBeVisible();
  });
});
