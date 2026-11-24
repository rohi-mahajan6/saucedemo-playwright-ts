import { test, expect } from '../../src/fixtures/test';
import { Persona, storageStatePath } from '../../src/data/users';
import { Product } from '../../src/data/products';

test.use({ storageState: storageStatePath(Persona.standard) });

test.describe('Inventory and cart (standard_user)', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.expectLoaded();
  });

  test(
    'adding a product updates the cart badge and button',
    { tag: ['@smoke'] },
    async ({ inventoryPage }) => {
      await inventoryPage.addToCart(Product.backpack);

      await inventoryPage.header.expectCartCount(1);
      await expect(inventoryPage.removeButton(Product.backpack)).toBeVisible();
    },
  );

  test('removing a product clears the badge', { tag: ['@regression'] }, async ({ inventoryPage }) => {
    await inventoryPage.addToCart(Product.backpack);
    await inventoryPage.removeButton(Product.backpack).click();

    await inventoryPage.header.expectCartCount(0);
  });

  test(
    'cart lists exactly the products that were added',
    { tag: ['@regression'] },
    async ({ inventoryPage, cartPage }) => {
      await inventoryPage.addToCart(Product.backpack, Product.bikeLight);
      await inventoryPage.header.openCart();

      await cartPage.expectLoaded();
      await expect(cartPage.itemNames).toHaveText(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
    },
  );

  test(
    'sorting by price low to high orders the list',
    { tag: ['@regression'] },
    async ({ inventoryPage }) => {
      await inventoryPage.sortBy('lohi');

      const prices = await inventoryPage.prices();
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    },
  );

  test('sorting by name Z to A orders the list', { tag: ['@regression'] }, async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');

    const names = await inventoryPage.names();
    expect(names).toEqual([...names].sort().reverse());
  });
});
