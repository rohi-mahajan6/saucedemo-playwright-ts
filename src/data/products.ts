/** Product slugs as used in SauceDemo's data-test ids, e.g. add-to-cart-sauce-labs-backpack. */
export const Product = {
  backpack: 'sauce-labs-backpack',
  bikeLight: 'sauce-labs-bike-light',
  boltTShirt: 'sauce-labs-bolt-t-shirt',
  fleeceJacket: 'sauce-labs-fleece-jacket',
  onesie: 'sauce-labs-onesie',
  redTShirt: 'test.allthethings()-t-shirt-(red)',
} as const;

export type ProductSlug = (typeof Product)[keyof typeof Product];

export const allProducts: ProductSlug[] = Object.values(Product);

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/** Obviously fake customer data. Nothing here resembles a real person. */
export const testCustomer: CustomerInfo = {
  firstName: 'Qa',
  lastName: 'Tester',
  postalCode: '411001',
};

/** SauceDemo applies a flat 8% tax at checkout. */
export const TAX_RATE = 0.08;
