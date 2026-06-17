// Utilidades para el módulo de carta

// Semana ISO WWYYYY
export function getCurrentWeek(): string {
  const now = new Date();
  return getWeekString(now);
}

export function getWeekString(date: Date): string {
  const jan4 = new Date(date.getFullYear(), 0, 4);
  const msPerDay = 86400000;
  const weekOne = new Date(jan4.getFullYear(), jan4.getMonth(), jan4.getDate() - jan4.getDay() + 1);
  const daysDiff = Math.round((date.getTime() - weekOne.getTime()) / msPerDay);
  const weekNumber = Math.floor(daysDiff / 7) + 1;
  const week = weekNumber.toString().padStart(2, '0');
  const year = date.getFullYear();
  return `W${week}-${year}`;
}

export function getPreviousWeek(weekString: string): string {
  // Formato: W24-2026
  const [weekPart, yearPart] = weekString.split('-');
  const week = parseInt(weekPart.substring(1), 10);
  const year = parseInt(yearPart, 10);

  let newWeek = week - 1;
  let newYear = year;

  if (newWeek < 1) {
    newWeek = 52;
    newYear = year - 1;
  }

  return `W${newWeek.toString().padStart(2, '0')}-${newYear}`;
}

export function dateToWeekString(year: number, week: number): string {
  return `W${week.toString().padStart(2, '0')}-${year}`;
}

// Cálculo de cumplimiento %
export function calculateCompliancePercentage(
  passedRules: number,
  totalRules: number,
): number {
  if (totalRules === 0) return 100;
  return Math.round((passedRules / totalRules) * 100);
}

// Formato de respuesta estándar MV
export function successResponse<T>(data: T) {
  return {
    success: true,
    data,
  };
}

export function errorResponse(
  message: string,
  code: string = 'ERROR',
  details?: Record<string, unknown>,
) {
  return {
    success: false,
    error: {
      message,
      code,
      details,
    },
  };
}

// Helpers de comparación
export function percentageChange(actual: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((actual - previous) / previous) * 100);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Validación de env vars
export function validateEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.warn(`[CARTA] Environment variable ${name} not set. Some features may be degraded.`);
    return '';
  }
  return value;
}

export function hasEnvVar(name: string): boolean {
  return !!process.env[name];
}
