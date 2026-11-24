import { expect, type Locator, type Page } from '@playwright/test';
import type { CustomerInfo } from '../data/products';
import { parsePrice } from './InventoryPage';

/** Covers the three checkout steps: information, overview and complete. */
export class CheckoutPage {
  // Step one: customer information
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly errorMessage: Locator;

  // Step two: overview
  readonly itemPrices: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;

  // Complete
  readonly completeHeader: Locator;

  constructor(private readonly page: Page) {
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.errorMessage = page.getByTestId('error');

    this.itemPrices = page.getByTestId('inventory-item-price');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');

    this.completeHeader = page.getByTestId('complete-header');
  }

  async fillCustomerInfo(info: CustomerInfo): Promise<void> {
    await this.firstName.fill(info.firstName);
    await this.lastName.fill(info.lastName);
    await this.postalCode.fill(info.postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async expectError(message: string): Promise<void> {
    await expect(this.errorMessage).toHaveText(message);
  }

  async overviewAmounts(): Promise<{ itemPrices: number[]; subtotal: number; tax: number; total: number }> {
    // allTextContents() does not wait, so make sure the overview has rendered first.
    await expect(this.page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(this.totalLabel).toBeVisible();
    const itemPrices = (await this.itemPrices.allTextContents()).map(parsePrice);
    return {
      itemPrices,
      subtotal: parsePrice((await this.subtotalLabel.textContent()) ?? ''),
      tax: parsePrice((await this.taxLabel.textContent()) ?? ''),
      total: parsePrice((await this.totalLabel.textContent()) ?? ''),
    };
  }
}
