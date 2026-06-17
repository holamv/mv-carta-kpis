import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Carta API Endpoints', () => {
  test('GET /api/carta/data/top-meals?country=PE - should return top meals with ratings', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/carta/data/top-meals?country=PE`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBeTruthy();
    expect(data.data.length).toBeGreaterThan(0);

    // Validate first meal structure
    const firstMeal = data.data[0];
    expect(firstMeal).toHaveProperty('meal_name');
    expect(firstMeal).toHaveProperty('unidades');
    expect(firstMeal).toHaveProperty('foodcost_pct');

    console.log(`✅ Top Meals: Found ${data.data.length} meals`);
    console.log(`   Top 1: ${firstMeal.meal_name} - ${firstMeal.unidades} unidades - ${firstMeal.foodcost_pct}%`);
  });

  test('GET /api/carta/data/foodcost-by-country - should return foodcost by country', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/carta/data/foodcost-by-country`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBeTruthy();
    expect(data.data.length).toBeGreaterThan(0);

    // Validate structure
    const firstCountry = data.data[0];
    expect(firstCountry).toHaveProperty('country_code');
    expect(firstCountry).toHaveProperty('total_costo');
    expect(firstCountry).toHaveProperty('total_precio');
    expect(firstCountry).toHaveProperty('foodcost_pct');
    expect(firstCountry).toHaveProperty('currency');

    // Validate values
    expect(firstCountry.total_costo).toBeGreaterThan(0);
    expect(firstCountry.total_precio).toBeGreaterThan(0);
    expect(firstCountry.foodcost_pct).toBeGreaterThan(0);
    expect(firstCountry.foodcost_pct).toBeLessThan(100);

    console.log(`✅ Foodcost by Country: ${data.data.length} countries`);
    data.data.forEach((country: any) => {
      console.log(`   ${country.country_code}: ${country.currency}${country.total_precio} → ${country.foodcost_pct}%`);
    });
  });

  test('GET /api/carta/data/compliance-by-city - should return compliance by city', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/carta/data/compliance-by-city?semana_id=242026`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBeTruthy();
    expect(data.data.length).toBeGreaterThan(0);

    // Validate structure
    const firstCity = data.data[0];
    expect(firstCity).toHaveProperty('city');
    expect(firstCity).toHaveProperty('compliance_pct');
    expect(firstCity.compliance_pct).toBeGreaterThan(0);
    expect(firstCity.compliance_pct).toBeLessThanOrEqual(100);

    console.log(`✅ Compliance by City: ${data.data.length} cities (W252026)`);
    data.data.slice(0, 3).forEach((city: any) => {
      console.log(`   ${city.city}: ${city.compliance_pct}%`);
    });
  });

  test('GET /api/carta/data/availability-by-kitchen - should return availability by kitchen', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/carta/data/availability-by-kitchen?semana_id=242026`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBeTruthy();
    expect(data.data.length).toBeGreaterThan(0);

    // Validate structure
    const firstKitchen = data.data[0];
    expect(firstKitchen).toHaveProperty('city');
    expect(firstKitchen).toHaveProperty('catering_name');
    expect(firstKitchen).toHaveProperty('disponibilidad_pct');
    expect(firstKitchen).toHaveProperty('disponibles');
    expect(firstKitchen).toHaveProperty('carta_total');

    // Validate values
    expect(firstKitchen.disponibilidad_pct).toBeGreaterThanOrEqual(0);
    expect(firstKitchen.disponibilidad_pct).toBeLessThanOrEqual(100);
    expect(firstKitchen.disponibles).toBeGreaterThanOrEqual(0);
    expect(firstKitchen.carta_total).toBeGreaterThanOrEqual(0);

    console.log(`✅ Availability by Kitchen: ${data.data.length} kitchens (W252026)`);
    data.data.slice(0, 3).forEach((kitchen: any) => {
      console.log(`   ${kitchen.city} - ${kitchen.catering_name}: ${kitchen.disponibles}/${kitchen.carta_total} (${kitchen.disponibilidad_pct}%)`);
    });
  });

  test('Validate data consistency across endpoints', async ({ request }) => {
    // Get all data
    const topMealsRes = await request.get(`${BASE_URL}/api/carta/data/top-meals?country=PE`);
    const foodcostRes = await request.get(`${BASE_URL}/api/carta/data/foodcost-by-country`);
    const complianceRes = await request.get(`${BASE_URL}/api/carta/data/compliance-by-city?semana_id=242026`);
    const availabilityRes = await request.get(`${BASE_URL}/api/carta/data/availability-by-kitchen?semana_id=242026`);

    const topMeals = await topMealsRes.json();
    const foodcost = await foodcostRes.json();
    const compliance = await complianceRes.json();
    const availability = await availabilityRes.json();

    // Validate all have success=true
    expect(topMeals.success).toBe(true);
    expect(foodcost.success).toBe(true);
    expect(compliance.success).toBe(true);
    expect(availability.success).toBe(true);

    // Validate all have data
    expect(topMeals.data.length).toBeGreaterThan(0);
    expect(foodcost.data.length).toBeGreaterThan(0);
    expect(compliance.data.length).toBeGreaterThan(0);
    expect(availability.data.length).toBeGreaterThan(0);

    console.log(`\n✅ ALL ENDPOINTS VALIDATED`);
    console.log(`   ✓ Top Meals: ${topMeals.data.length} items`);
    console.log(`   ✓ Foodcost: ${foodcost.data.length} countries`);
    console.log(`   ✓ Compliance: ${compliance.data.length} cities`);
    console.log(`   ✓ Availability: ${availability.data.length} kitchens`);
  });
});
