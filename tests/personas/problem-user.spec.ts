import { test, expect } from '../../src/fixtures/test';
import { Persona } from '../../src/data/users';
import { Product, allProducts, testCustomer } from '../../src/data/products';

/**
 * problem_user is seeded with functional defects. Each test asserts the CORRECT behaviour
 * and is marked test.fail(): it passes while the defect is present, and Playwright reports
 * it as "unexpectedly passed" if the defect ever disappears. IDs map to the Known Defects table.
 */
test.describe('problem_user known defects', { tag: ['@regression', '@known-defect'] }, () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(Persona.problem);
  });

  test('SD-001: every product shows its own image', async ({ inventoryPage }) => {
    test.fail(true, 'SD-001: all products show the same image for problem_user');

    const sources = await inventoryPage.imageSources();
    expect(new Set(sources).size).toBe(sources.length);
  });

  test('SD-002: sorting by name Z to A reorders the list', async ({ inventoryPage }) => {
    test.fail(true, 'SD-002: sorting has no effect for problem_user');

    const before = await inventoryPage.names();
    await inventoryPage.sortBy('za');
    expect(await inventoryPage.names()).toEqual([...before].sort().reverse());
  });

  test('SD-003: every product can be added to the cart', async ({ inventoryPage }) => {
    test.fail(true, 'SD-003: some Add to cart buttons do nothing for problem_user');

    for (const product of allProducts) {
      await inventoryPage.addToCartButton(product).click();
    }
    await inventoryPage.header.expectCartCount(allProducts.length);
  });

  test('SD-004: last name is entered into the Last Name field', async ({
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    test.fail(true, 'SD-004: typing in Last Name overwrites First Name for problem_user');

    await inventoryPage.addToCart(Product.backpack);
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutPage.fillCustomerInfo(testCustomer);

    await expect(checkoutPage.firstName).toHaveValue(testCustomer.firstName);
    await expect(checkoutPage.lastName).toHaveValue(testCustomer.lastName);
  });
});
