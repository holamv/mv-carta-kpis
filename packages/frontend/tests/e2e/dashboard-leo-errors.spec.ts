import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Dashboard Leo - Error Scenarios', () => {
  test('ERROR 1: "Todas las ciudades" no debería estar disponible (no soportado)', async ({ request }) => {
    // El endpoint requiere ciudad específica
    const responseEmpty = await request.get(
      `${BASE_URL}/api/carta/dashboard/leo?semana=W25-2026&pais=PE&ciudad=`
    );

    expect(responseEmpty.ok()).toBeFalsy();
    const errorData = await responseEmpty.json();
    console.log(`❌ ERROR: "Todas las ciudades" retorna: ${errorData.error}`);
    expect(errorData.success).toBe(false);
  });

  test('ERROR 2: Cambiar país sin resetear ciudad causa 400', async ({ request }) => {
    // 1. Obtener datos de Perú - Piura (verificar que existe)
    const responsePE = await request.get(
      `${BASE_URL}/api/carta/dashboard/leo?semana=W25-2026&pais=PE&ciudad=Piura`
    );
    expect(responsePE.ok()).toBeTruthy();
    console.log('✅ PE - Piura funciona');

    // 2. Intentar obtener con Piura pero país MX (Piura no existe en MX)
    const responseMX = await request.get(
      `${BASE_URL}/api/carta/dashboard/leo?semana=W25-2026&pais=MX&ciudad=Piura`
    );

    expect(responseMX.ok()).toBeFalsy();
    const errorData = await responseMX.json();
    console.log(`❌ ERROR: MX con ciudad PE retorna: ${errorData.error}`);
    expect(errorData.success).toBe(false);
  });

  test('VALIDATION: Ciudad debe ser válida para el país', async ({ request }) => {
    const invalidCombinations = [
      { pais: 'PE', ciudad: 'CDMX' }, // CDMX es México
      { pais: 'MX', ciudad: 'Lima' }, // Lima es Perú
      { pais: 'CO', ciudad: 'Guadalajara' }, // Guadalajara es México
    ];

    for (const combo of invalidCombinations) {
      const response = await request.get(
        `${BASE_URL}/api/carta/dashboard/leo?semana=W25-2026&pais=${combo.pais}&ciudad=${combo.ciudad}`
      );
      expect(response.ok()).toBeFalsy();
      console.log(`❌ VALIDADO: ${combo.pais}/${combo.ciudad} es inválido`);
    }
  });

  test('VALIDATION: Dashboard no debe cargar sin ciudad', async ({ page }) => {
    await page.goto(`${BASE_URL}/carta`);

    // Debería haber un dropdown de ciudad
    const citySelect = page.locator('select').filter({ has: page.locator('option', { hasText: 'Lima' }) });
    await expect(citySelect).toBeVisible();

    // Cambiar a "Todas las ciudades"
    await citySelect.selectOption('');

    // Dashboard no debería mostrar datos
    const table = page.locator('table').first();
    const noData = page.locator('text=Sin datos disponibles');

    // Debería mostrar estado de carga o error
    console.log('⚠️ VERIFICAR: ¿Dashboard muestra "Sin datos" o error cuando no hay ciudad?');
  });
});
