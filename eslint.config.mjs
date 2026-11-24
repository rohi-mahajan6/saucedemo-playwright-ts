import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  { ignores: ['node_modules/', 'playwright-report/', 'test-results/', 'blob-report/', '.auth/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // Some assertions live in page-object and fixture helpers; count those as expects.
      'playwright/expect-expect': [
        'warn',
        { assertFunctionNames: ['expectLoaded', 'expectError', 'expectCartCount', 'loginAs'] },
      ],
    },
  },
);
