import { test as setup } from '../src/fixtures/test';
import { Persona, storageStatePath } from '../src/data/users';

/**
 * Logs in once as standard_user and saves the session (cookie + localStorage),
 * so cart and checkout specs start on the inventory page without repeating the UI login.
 */
setup('authenticate as standard_user', async ({ page, loginAs }) => {
  await loginAs(Persona.standard);
  await page.context().storageState({ path: storageStatePath(Persona.standard) });
});
