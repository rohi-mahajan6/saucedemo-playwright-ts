import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}. Copy .env.example to .env and set it.`);
  }
  return value;
}

export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://www.saucedemo.com',
  get password(): string {
    return required('SAUCE_PASSWORD');
  },
  isCI: !!process.env.CI,
} as const;
