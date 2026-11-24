import { expect, type Locator, type Page } from '@playwright/test';
import type { ProductSlug } from '../data/products';
import { HeaderComponent } from './components/HeaderComponent';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage {
  readonly header: HeaderComponent;
  readonly title: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly itemImages: Locator;
  readonly sortSelect: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.itemImages = this.items.locator('img.inventory_item_img');
    this.sortSelect = page.getByTestId('product-sort-container');
  }

  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/inventory\.html$/);
    await expect(this.title).toHaveText('Products');
  }

  addToCartButton(product: ProductSlug): Locator {
    return this.page.getByTestId(`add-to-cart-${product}`);
  }

  removeButton(product: ProductSlug): Locator {
    return this.page.getByTestId(`remove-${product}`);
  }

  async addToCart(...products: ProductSlug[]): Promise<void> {
    for (const product of products) {
      await this.addToCartButton(product).click();
    }
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption(option);
  }

  async names(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  async prices(): Promise<number[]> {
    const texts = await this.itemPrices.allTextContents();
    return texts.map(parsePrice);
  }

  async imageSources(): Promise<string[]> {
    return this.itemImages.evaluateAll((imgs) => imgs.map((img) => (img as HTMLImageElement).src));
  }
}

/** "$29.99" -> 29.99 */
export function parsePrice(text: string): number {
  const value = Number(text.replace(/[^0-9.]/g, ''));
  if (Number.isNaN(value)) throw new Error(`Cannot parse price from "${text}"`);
  return value;
}
