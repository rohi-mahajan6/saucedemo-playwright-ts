import { expect, type Locator, type Page } from '@playwright/test';
import { HeaderComponent } from './components/HeaderComponent';

export class CartPage {
  readonly header: HeaderComponent;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/cart\.html$/);
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
