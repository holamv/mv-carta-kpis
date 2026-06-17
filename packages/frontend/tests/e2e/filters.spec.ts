import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Carta Filters - Week & Country', () => {
  test('should filter data correctly by week and country', async ({ page }) => {
    await page.goto(`${BASE_URL}/carta`);

    // Select week W24-2026
    const semanaInput = page.locator('input:has-text("W24-2026")');
    const semanaField = page.locator('text=Seleccionar Semana').locator('..').locator('p:has-text("W")');

    // Try to find and change week selector
    const prevButton = page.locator('button:has-text("← Anterior")');
    await prevButton.click(); // Go to W23

    // Select country CO
    const countrySelect = page.locator('select');
    const countryOptions = countrySelect.first();
    await countryOptions.selectOption('CO');

    // Click generate report
    const reportButton = page.locator('button:has-text("Generar Reporte")');
    await reportButton.click();

    // Wait for data to load
    await page.waitForTimeout(3000);

    // Check API responses for filtering issues
    console.log('\n📊 Testing filter consistency...');

    // Fetch foodcost data directly
    const foodcostByCountry = await page.evaluate(() => {
      return fetch('/api/carta/data/foodcost-by-country').then(r => r.json());
    });

    console.log('Foodcost by Country:', JSON.stringify(foodcostByCountry.data, null, 2));

    // All entries should have valid country codes
    foodcostByCountry.data.forEach((item: any) => {
      expect(['PE', 'MX', 'CO']).toContain(item.country);
      expect(item.foodcost_pct).toBeGreaterThan(0);
      expect(item.foodcost_pct).toBeLessThan(100);
    });

    console.log('✅ Foodcost data valid');

    // Fetch compliance by city
    const complianceByCity = await page.evaluate(() => {
      return fetch('/api/carta/data/compliance-by-city?semana_id=252026').then(r => r.json());
    });

    console.log('\nCompliance by City:', JSON.stringify(complianceByCity.data.slice(0, 2), null, 2));

    // All cities should be unique and have valid compliance %
    const cities = new Set(complianceByCity.data.map((c: any) => c.city));
    expect(cities.size).toBeGreaterThan(0);

    complianceByCity.data.forEach((item: any) => {
      expect(item.city).toBeTruthy();
      expect(item.compliance_pct).toBeGreaterThanOrEqual(0);
      expect(item.compliance_pct).toBeLessThanOrEqual(100);
    });

    console.log('✅ Compliance data valid');

    // Fetch top meals for specific country
    const topMealsRes = await page.evaluate(() => {
      return fetch('/api/carta/data/top-meals?country=CO').then(r => r.json());
    });

    console.log('\nTop Meals (CO):', JSON.stringify(topMealsRes.data.slice(0, 2), null, 2));

    // All meals should have valid structure
    topMealsRes.data.forEach((meal: any) => {
      expect(meal.meal_name).toBeTruthy();
      expect(meal.unidades).toBeGreaterThan(0);
      expect(meal.foodcost_pct).toBeGreaterThanOrEqual(0);
    });

    console.log('✅ Top meals data valid');
  });

  test('should NOT show data from other countries', async ({ page }) => {
    await page.goto(`${BASE_URL}/carta`);

    // Set country to PE
    const countrySelect = page.locator('select').first();
    await countrySelect.selectOption('PE');

    // Fetch top meals for PE
    const peMeals = await page.evaluate(() => {
      return fetch('/api/carta/data/top-meals?country=PE').then(r => r.json());
    });

    // Fetch top meals for MX
    const mxMeals = await page.evaluate(() => {
      return fetch('/api/carta/data/top-meals?country=MX').then(r => r.json());
    });

    // Should be different datasets
    console.log('\n🔍 Checking country isolation...');
    console.log(`PE meals count: ${peMeals.data.length}`);
    console.log(`MX meals count: ${mxMeals.data.length}`);

    // They should not be identical
    const peNames = peMeals.data.map((m: any) => m.meal_name).join('|');
    const mxNames = mxMeals.data.map((m: any) => m.meal_name).join('|');

    console.log(`PE meals: ${peNames.substring(0, 100)}...`);
    console.log(`MX meals: ${mxNames.substring(0, 100)}...`);

    // At least some meals should be different
    const commonMeals = peMeals.data.filter((m: any) =>
      mxMeals.data.some((mx: any) => mx.meal_name === m.meal_name)
    );

    console.log(`Common meals: ${commonMeals.length}`);
    expect(commonMeals.length).toBeLessThan(peMeals.data.length);
    console.log('✅ Country isolation working');
  });

  test('should handle week filters correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/carta`);

    // Get initial week
    const weekDisplay = page.locator('text=Seleccionar Semana').locator('..').locator('p:has-text("W")');
    const initialWeek = await weekDisplay.textContent();
    console.log(`\n📅 Initial week: ${initialWeek}`);

    // Click previous
    const prevButton = page.locator('button:has-text("← Anterior")');
    await prevButton.click();

    const previousWeek = await weekDisplay.textContent();
    console.log(`Previous week: ${previousWeek}`);

    expect(previousWeek).not.toBe(initialWeek);
    console.log('✅ Week navigation working');
  });
});
