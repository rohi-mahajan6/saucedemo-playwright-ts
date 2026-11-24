import { test as base, expect } from '@playwright/test';
import { env } from '../config/env';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import type { PersonaName } from '../data/users';

interface PageFixtures {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  /** Logs in through the UI as the given persona and lands on the inventory page. */
  loginAs: (persona: PersonaName) => Promise<InventoryPage>;
}

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  loginAs: async ({ loginPage, inventoryPage }, use) => {
    await use(async (persona) => {
      await loginPage.goto();
      await loginPage.login(persona, env.password);
      await inventoryPage.expectLoaded();
      return inventoryPage;
    });
  },
});

export { expect };
