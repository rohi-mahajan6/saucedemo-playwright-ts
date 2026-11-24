# saucedemo-playwright-ts

End-to-end test framework for an e-commerce checkout, covering six seeded user personas across Chromium, Firefox and WebKit, with seeded defects tracked as expected failures.

[![E2E](https://github.com/rohi-mahajan6/saucedemo-playwright-ts/actions/workflows/e2e.yml/badge.svg)](https://github.com/rohi-mahajan6/saucedemo-playwright-ts/actions/workflows/e2e.yml)
[![Report](https://img.shields.io/badge/report-live-brightgreen)](https://rohi-mahajan6.github.io/saucedemo-playwright-ts/)

> ⚠️ The target app is a **public third-party demo** ([SauceDemo](https://www.saucedemo.com)) used for practice. This project is not affiliated with Sauce Labs. No load testing is run against the public site.

## 1. Problem statement

Validate an e-commerce checkout across six user personas and three browsers, and catch the functional defects that are seeded into some of those personas. The suite should separate "the app has a known bug" from "the test broke", so a red run always means something new.

## 2. Application under test

| Item        | Value                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| App         | [SauceDemo](https://www.saucedemo.com) by Sauce Labs                                                            |
| Type        | Web (single-page app)                                                                                           |
| Credentials | Public demo credentials, read from `.env` locally and from the `SAUCE_PASSWORD` secret in CI. Never hard-coded. |
| Environment | `public` only. SauceDemo has no backend and no shared data, so every run is isolated.                           |

## 3. What's automated

| Area                                                                                         | Tests | Tags                    |
| -------------------------------------------------------------------------------------------- | ----- | ----------------------- |
| Login: all six personas, invalid and empty credentials, direct URL without a session, logout | 11    | `@smoke`, `@regression` |
| Inventory and cart: add, remove, cart contents, sorting                                      | 5     | `@smoke`, `@regression` |
| Checkout: full purchase with subtotal, 8% tax and total checked, required fields             | 4     | `@smoke`, `@regression` |
| `problem_user` known defects (`test.fail()`)                                                 | 4     | `@known-defect`         |

That's 24 tests, each run in all three browsers: 72 test runs plus one login setup step.

## 4. Architecture

```
├── src/
│   ├── config/env.ts           # environment variables, validated at use
│   ├── data/                   # personas, products, fake customer data
│   ├── fixtures/test.ts        # page-object fixtures and loginAs()
│   └── pages/                  # page objects
│       ├── components/HeaderComponent.ts
│       ├── LoginPage.ts
│       ├── InventoryPage.ts
│       ├── CartPage.ts
│       └── CheckoutPage.ts
├── tests/
│   ├── auth.setup.ts           # logs in once, saves storageState
│   ├── auth/
│   ├── inventory/
│   ├── checkout/
│   └── personas/
├── .github/workflows/e2e.yml
└── playwright.config.ts
```

- **Page Object Model.** Locators and page actions live in `src/pages`, and specs read as user steps. The header (cart badge, menu) is a shared component, since it appears on every page.
- **Custom fixtures.** Specs receive ready-made page objects and a `loginAs(persona)` helper instead of building them in each test.
- **Login once, reuse the session.** A `setup` project logs in as `standard_user` and saves `storageState`. Cart and checkout specs start already logged in. Login specs always go through the UI on purpose.
- **Locators.** SauceDemo exposes `data-test` attributes, so `testIdAttribute` is set to `data-test` and `getByTestId()` is used throughout. Roles are used where they're stable.
- **Known defects as `test.fail()`.** These tests assert the correct behaviour. They pass while the bug exists and are flagged as "unexpectedly passed" if it's fixed, so the defect register can't silently go stale.
- **Retries only in CI.** Local runs show flakiness instead of hiding it.

## 5. Tech stack

Playwright Test, TypeScript, ESLint (`typescript-eslint`, `eslint-plugin-playwright`), Prettier, dotenv, GitHub Actions, GitHub Pages.

TypeScript is pinned to `~6.0` because `typescript-eslint` 8.x doesn't support TypeScript 7 yet.

## 6. Execution evidence

**Local run, 2026-11-24** (Windows 11, Node 26.13.0, Playwright 1.65.1, `--workers=1`):

```
Running 73 tests using 1 worker
  73 passed (3.6m)
```

All three browsers passed. The 12 known-defect runs (4 tests × 3 browsers) failed as expected and are counted as passed by `test.fail()`.

CI links and screenshots will be added from real CI runs once the repository is published.

| Evidence              | Link                         |
| --------------------- | ---------------------------- |
| Latest CI run         | _pending_                    |
| Live HTML report      | _pending_                    |
| Scheduled runs (cron) | `30 0 * * *` UTC = 06:00 IST |
| Run history           | _pending_                    |

## 7. Known defects / findings

Defects seeded into the `problem_user` persona. Each one was observed on 2026-11-24 in Chromium, Firefox and WebKit, and the test fails on the assertion that targets it.

| ID     | Area      | Steps                                                                   | Expected                          | Actual (observed)                                                                                                            | Status    |
| ------ | --------- | ----------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------- |
| SD-001 | Inventory | Log in as `problem_user`, view the product list                         | Each product shows its own image  | All 6 products show the same placeholder image (`sl-404`). 1 distinct image instead of 6.                                    | Confirmed |
| SD-002 | Inventory | Log in as `problem_user`, sort by Name (Z to A)                         | List is reordered Z to A          | List stays in A to Z order, and the sort dropdown snaps back to "Name (A to Z)"                                              | Confirmed |
| SD-003 | Cart      | Log in as `problem_user`, click Add to cart on all 6 products           | Cart badge shows 6                | Badge shows 3. Add to cart does nothing for Bolt T-Shirt, Fleece Jacket and Test.allTheThings() T-Shirt (Red).               | Confirmed |
| SD-004 | Checkout  | Log in as `problem_user`, go to checkout, type first name and last name | Each value stays in its own field | Typing in Last Name overwrites First Name, and Last Name stays empty. Continue is then blocked with "Last Name is required". | Adjusted  |

SD-004 was first written as "the last name doesn't stick". Exploration showed the value actually goes into the First Name field, so the test now checks both fields.

The four defect tests above are in `tests/personas/problem-user.spec.ts`.

**Other observations, not yet covered by tests:**

- `error_user`: choosing a sort option shows a browser alert: "Sorting is broken! This error has been reported to Backtrace."
- `performance_glitch_user`: login took about 5.8 s in one measured run, against about 0.8 s for `standard_user`. The login test allows up to 15 s for this persona and records the duration as an annotation in the report.

## 8. Run locally

Requires Node.js 20 or newer.

```bash
git clone https://github.com/rohi-mahajan6/saucedemo-playwright-ts.git
cd saucedemo-playwright-ts
npm ci
npx playwright install
cp .env.example .env          # then set SAUCE_PASSWORD
npm test                      # all browsers
npm run test:smoke            # @smoke only
npm run report                # open the HTML report
```

## 9. CI/CD

`.github/workflows/e2e.yml` runs on push to `main`, on pull requests, nightly at 06:00 IST, and on demand.

- One job per browser (Chromium, Firefox, WebKit), with `fail-fast: false` so one browser failing doesn't hide the others.
- Each job writes a blob report. A merge job combines them into a single HTML report.
- Traces, screenshots and videos are uploaded as artifacts when a job fails.
- On `main` (not on pull requests), the merged report is deployed to GitHub Pages.

Setup on GitHub: add a `SAUCE_PASSWORD` repository secret, and set Pages to deploy from GitHub Actions.

## 10. Responsible use

- One worker (tests run one at a time), and one scheduled run per day.
- No load, stress or soak tests against the public site.
- Only obviously fake customer data is entered.

## 11. What I'd do next

- Visual snapshot tests for `visual_user`.
- Defect coverage for `error_user`.
- Accessibility checks with axe-core.
