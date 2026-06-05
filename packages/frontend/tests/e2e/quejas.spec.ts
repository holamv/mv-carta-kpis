import { test, expect } from '@playwright/test';

test('la pagina de quejas carga y muestra el formulario', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: /quejas y reclamos/i }),
  ).toBeVisible();
  await expect(page.getByLabel(/nombre/i)).toBeVisible();
  await expect(
    page.getByRole('button', { name: /enviar queja/i }),
  ).toBeVisible();
});
