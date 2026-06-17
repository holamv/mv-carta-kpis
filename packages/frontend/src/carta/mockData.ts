import {
  WeeklyCartaReport,
  CountryCode,
  AvailabilityReport,
  StoreAvailability,
  TopOffMeal,
  FoodcostReport,
  FoodcostComparisonItem,
  NewMealPerformance,
  ChecklistReport,
  ChecklistAlert,
  RuleResult,
  MysteryReport,
  SemanaId,
} from './types';

function generateSemanaId(date = new Date()): SemanaId {
  const year = date.getFullYear();
  const start = new Date(year, 0, 1);
  const diff = Math.floor((+date - +start) / 86400000);
  const week = Math.ceil((diff + start.getDay() + 1) / 7);
  return `${week}${year}`;
}

function sampleAvailability(): AvailabilityReport {
  const by_store: StoreAvailability[] = [
    { store_id: 1, store_name: 'MV Centro', city: 'Lima', country: 'PE' as CountryCode, total_meals: 12, available_meals: 11, availability_pct: 91.7 },
    { store_id: 2, store_name: 'MV Norte', city: 'Lima', country: 'PE' as CountryCode, total_meals: 12, available_meals: 12, availability_pct: 100 },
  ];
  const by_city = [{ city: 'Lima', country: 'PE' as CountryCode, availability_pct: 95.8 }];
  const by_country = [{ country: 'PE' as CountryCode, availability_pct: 95.8 }];
  const top_off_meals: TopOffMeal[] = [{ meal_id: 101, meal_name: 'Lomo Saltado', stores_off: 1 }];
  return { by_store, by_city, by_country, top_off_meals, overall_pct: 95.8 };
}

function sampleFoodcost(currentWeek: string, previousWeek: string): FoodcostReport {
  const items: FoodcostComparisonItem[] = [
    { country: 'PE', current_pct: 38.2, previous_pct: 36.5, delta_pp: 1.7, exceeds_threshold: false },
  ];
  return { threshold_pct: 40, current_week: currentWeek, previous_week: previousWeek, items };
}

function sampleNewMeals(currentWeek: string): NewMealPerformance[] {
  return [
    { meal_id: 201, meal_name: 'Ensalada Cesar', country: 'PE', launch_week: currentWeek, units_sold: 120, real_foodcost_pct: 32.5, avg_rating: 4.3 },
  ];
}

function sampleChecklist(currentWeek: string): ChecklistReport[] {
  const rule: RuleResult = { id: 'r1', label: 'Proteina balanceada', passed: true, severity: 'ok', detail: 'Proteina OK', weight: 50 };
  const alerts: ChecklistAlert[] = [];
  return [
    { country: 'PE', week: currentWeek, compliance_pct: 92.5, rules: [rule], alerts, not_evaluated: [] },
  ];
}

export function generateMockReport(filters?: { country?: CountryCode; city?: string }): WeeklyCartaReport {
  const now = new Date();
  const current = generateSemanaId(now);
  const prev = generateSemanaId(new Date(+now - 7 * 24 * 3600 * 1000));

  const report: WeeklyCartaReport = {
    generated_at: now.toISOString(),
    week: current,
    previous_week: prev,
    filters: filters || {},
    availability: { meta: { source_connected: true }, data: sampleAvailability() },
    foodcost: { meta: { source_connected: true }, data: sampleFoodcost(current, prev) },
    new_meals: { meta: { source_connected: true }, data: sampleNewMeals(current) },
    checklist: { meta: { source_connected: true }, data: sampleChecklist(current) },
    mystery: { meta: { source_connected: false, note: 'Integracion pendiente' }, data: { status: 'pending_integration', message: 'Pendiente', pass_rate_pct: null } },
  };

  return report;
}
