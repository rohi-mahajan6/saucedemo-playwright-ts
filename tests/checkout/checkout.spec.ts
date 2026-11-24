import { test, expect } from '../../src/fixtures/test';
import { Persona, storageStatePath } from '../../src/data/users';
import { Product, TAX_RATE, testCustomer } from '../../src/data/products';

test.use({ storageState: storageStatePath(Persona.standard) });

/** Rounds to cents the way a price label would show it. */
const cents = (value: number): number => Math.round(value * 100) / 100;

test.describe('Checkout (standard_user)', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.expectLoaded();
  });

  test(
    'user can buy two products and totals add up',
    { tag: ['@smoke'] },
    async ({ inventoryPage, cartPage, checkoutPage }) => {
      await inventoryPage.addToCart(Product.backpack, Product.fleeceJacket);
      await inventoryPage.header.openCart();
      await cartPage.checkout();

      await checkoutPage.fillCustomerInfo(testCustomer);
      await checkoutPage.continue();

      const { itemPrices, subtotal, tax, total } = await checkoutPage.overviewAmounts();
      expect(itemPrices).toHaveLength(2);
      const expectedSubtotal = cents(itemPrices.reduce((sum, p) => sum + p, 0));
      expect(subtotal).toBe(expectedSubtotal);
      expect(tax).toBe(cents(expectedSubtotal * TAX_RATE));
      expect(total).toBe(cents(subtotal + tax));

      await checkoutPage.finish();
      await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
      await inventoryPage.header.expectCartCount(0);
    },
  );

  const missingFieldCases = [
    { field: 'first name', info: { ...testCustomer, firstName: '' }, error: 'Error: First Name is required' },
    { field: 'last name', info: { ...testCustomer, lastName: '' }, error: 'Error: Last Name is required' },
    {
      field: 'postal code',
      info: { ...testCustomer, postalCode: '' },
      error: 'Error: Postal Code is required',
    },
  ];

  for (const { field, info, error } of missingFieldCases) {
    test(
      `checkout is blocked when ${field} is missing`,
      { tag: ['@regression'] },
      async ({ inventoryPage, cartPage, checkoutPage }) => {
        await inventoryPage.addToCart(Product.onesie);
        await inventoryPage.header.openCart();
        await cartPage.checkout();

        await checkoutPage.fillCustomerInfo(info);
        await checkoutPage.continue();

        await checkoutPage.expectError(error);
      },
    );
  }
});
