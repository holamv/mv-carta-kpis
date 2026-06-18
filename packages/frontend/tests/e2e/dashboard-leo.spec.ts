import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Dashboard Leo - 5 Paneles Completos', () => {
  test('Panel 1: Foodcost correctamente formateado', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/carta/dashboard/leo?semana=W25-2026&pais=PE&ciudad=Lima`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.filters).toBeDefined();
    expect(data.filters.semanaId).toBe('252026'); // SIN CEROS

    const foodcost = data.panels.foodcost;
    expect(foodcost).toBeDefined();
    expect(foodcost.semana_id).toBe('252026');
    expect(foodcost.branch_office_id).toBe(2);
    expect(foodcost.city).toBe('lima');
    expect(foodcost.foodcost_pct).toBeGreaterThan(0);
    expect(foodcost.foodcost_pct).toBeLessThan(100);

    console.log(`✅ Panel 1 Foodcost: ${foodcost.foodcost_pct}% (${foodcost.costo_local} / ${foodcost.precio_local})`);
  });

  test('Panel 2: Compliance con rules JSONB', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/carta/dashboard/leo?semana=W25-2026&pais=PE&ciudad=Lima`);
    const data = await response.json();

    const compliance = data.panels.compliance;
    expect(compliance).toBeDefined();
    expect(compliance.compliance_pct).toBeGreaterThan(0);
    expect(compliance.meals_count).toBeGreaterThan(0);
    expect(compliance.rules).toBeDefined();

    // Validar estructura JSONB
    expect(compliance.rules.variedad_carne).toBeDefined();
    expect(compliance.rules.variedad_cerdo).toBeDefined();
    expect(compliance.rules.variedad_pescado).toBeDefined();
    expect(compliance.rules.estrella_en_carta).toBeDefined();

    console.log(`✅ Panel 2 Compliance: ${compliance.compliance_pct}% (${compliance.meals_count} platos)`);
  });

  test('Panel 3: Top 5 platos con datos válidos', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/carta/dashboard/leo?semana=W25-2026&pais=PE&ciudad=Lima`);
    const data = await response.json();

    const topMeals = data.panels.topMeals;
    expect(Array.isArray(topMeals)).toBeTruthy();
    expect(topMeals.length).toBeGreaterThan(0);
    expect(topMeals.length).toBeLessThanOrEqual(5);

    topMeals.forEach((meal: any, i: number) => {
      expect(meal.meal_name).toBeTruthy();
      expect(meal.unidades).toBeGreaterThan(0);
      expect(meal.food_cost_pct).toBeGreaterThan(0);
      expect(meal.food_cost_pct).toBeLessThan(100);
      console.log(`  ${i + 1}. ${meal.meal_name}: ${meal.unidades} unidades, ${meal.food_cost_pct}%`);
    });

    console.log(`✅ Panel 3 Top Meals: ${topMeals.length} platos`);
  });

  test('Panel 4: Disponibilidad VARÍA por cocina', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/carta/dashboard/leo?semana=W25-2026&pais=PE&ciudad=Lima`);
    const data = await response.json();

    const availability = data.panels.availability;
    expect(Array.isArray(availability)).toBeTruthy();
    expect(availability.length).toBeGreaterThan(0);

    // Validar que la disponibilidad VARÍA (no es igual en todos)
    const percentages = availability.map((a: any) => a.disponibilidad_pct);
    const hasVariation = new Set(percentages).size > 1;
    expect(hasVariation).toBeTruthy(); // ERROR si todos tienen mismo %

    availability.forEach((kitchen: any) => {
      expect(kitchen.catering_name).toBeTruthy();
      expect(kitchen.catering_level).toMatch(/^[ABC]$/);
      expect(kitchen.disponibles).toBeGreaterThanOrEqual(0);
      expect(kitchen.carta_total).toBeGreaterThan(0);
      expect(kitchen.disponibilidad_pct).toBeGreaterThanOrEqual(0);
      expect(kitchen.disponibilidad_pct).toBeLessThanOrEqual(100);
    });

    console.log(`✅ Panel 4 Disponibilidad: ${availability.length} cocinas (VARÍA: ${percentages.join(', ')}%)`);
  });

  test('Panel 5: Compliance detail con checks JSONB', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/carta/dashboard/leo?semana=W25-2026&pais=PE&ciudad=Lima`);
    const data = await response.json();

    const complianceDetail = data.panels.complianceDetail;
    expect(Array.isArray(complianceDetail)).toBeTruthy();
    expect(complianceDetail.length).toBeGreaterThan(0);

    // Validar primeros 3 (peores) para estructura
    complianceDetail.slice(0, 3).forEach((meal: any) => {
      expect(meal.meal_name).toBeTruthy();
      expect(meal.passed).toBeGreaterThanOrEqual(0);
      expect(meal.applicable).toBeGreaterThan(0);
      expect(meal.compliance_ratio).toBeTruthy();
      expect(meal.checks).toBeDefined();

      // Validar que checks es JSONB con estructura correcta
      expect(meal.checks.foto).toBeDefined();
      expect(meal.checks.presentacion).toBeDefined();
      expect(meal.checks.empaque_definido).toBeDefined();
    });

    console.log(`✅ Panel 5 Compliance Detail: ${complianceDetail.length} platos analizados`);
  });

  test('Bonus: Star plates (top-5 últimas 6 semanas)', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/carta/dashboard/leo?semana=W25-2026&pais=PE&ciudad=Lima`);
    const data = await response.json();

    const starPlates = data.panels.starPlates;
    expect(Array.isArray(starPlates)).toBeTruthy();

    starPlates.forEach((plate: any) => {
      expect(plate.rank).toBeGreaterThan(0);
      expect(plate.rank).toBeLessThanOrEqual(5);
      expect(plate.meal_name).toBeTruthy();
      expect(plate.unidades_prev).toBeGreaterThan(0);
      expect(plate.weeks_consecutive).toBeGreaterThan(0);
    });

    console.log(`✅ Bonus Star Plates: ${starPlates.length} platos (top-5 6 últimas semanas)`);
  });

  test('Filtros correctos: semana_id SIN CEROS', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/carta/dashboard/leo?semana=W9-2026&pais=PE&ciudad=Lima`);
    const data = await response.json();

    expect(data.filters.semanaId).toBe('92026'); // NO "092026"
    expect(data.filters.semanaId).not.toBe('092026');

    console.log(`✅ Filtros: W9-2026 → semanaId=${data.filters.semanaId} (sin ceros)`);
  });

  test('Aislamiento por país: PE ≠ MX ≠ CO', async ({ request }) => {
    const responsesPE = await request.get(
      `${BASE_URL}/api/carta/dashboard/leo?semana=W25-2026&pais=PE&ciudad=Lima`
    );
    const dataPE = await responsesPE.json();

    const responsesMX = await request.get(
      `${BASE_URL}/api/carta/dashboard/leo?semana=W25-2026&pais=MX&ciudad=CDMX`
    );
    const dataMX = await responsesMX.json();

    const peailableCount = dataPE.panels.availability.length;
    const mxAvailableCount = dataMX.panels.availability.length;

    expect(peailableCount).not.toBe(mxAvailableCount);

    console.log(`✅ Aislamiento: PE (${peailableCount} cocinas) ≠ MX (${mxAvailableCount} cocinas)`);
  });

  test('Validar mapeo branch_office_id correcto', async ({ request }) => {
    // PE-Lima debe ser bo=2
    const response = await request.get(`${BASE_URL}/api/carta/dashboard/leo?semana=W25-2026&pais=PE&ciudad=Lima`);
    const data = await response.json();

    expect(data.filters.boId).toBe(2);

    // PE-Piura debe ser bo=1
    const responsePiura = await request.get(`${BASE_URL}/api/carta/dashboard/leo?semana=W25-2026&pais=PE&ciudad=Piura`);
    const dataPiura = await responsePiura.json();

    expect(dataPiura.filters.boId).toBe(1);

    console.log(`✅ Mapeo: PE-Lima=bo2 ✓, PE-Piura=bo1 ✓`);
  });

  test('ERROR TEST: Disponibilidad debe variar (detecta error si es igual)', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/carta/dashboard/leo?semana=W25-2026&pais=PE&ciudad=Lima`);
    const data = await response.json();

    const availability = data.panels.availability;
    const percentages = availability.map((a: any) => a.disponibilidad_pct);

    // Este test FALLA si todos tienen el mismo porcentaje
    const allSame = percentages.every(p => p === percentages[0]);
    if (allSame) {
      console.error(`❌ ERROR: Todas las cocinas tienen la misma disponibilidad: ${percentages[0]}%`);
      throw new Error('Disponibilidad debe variar por cocina, no ser igual en todas');
    }

    console.log(`✅ Disponibilidad varía correctamente: ${new Set(percentages).size} valores únicos`);
  });
});
