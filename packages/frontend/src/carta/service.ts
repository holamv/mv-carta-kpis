import { generateMockReport } from './mockData';
import { ApiResponse, WeeklyCartaReport, CountryCode } from './types';

export async function getWeeklyCartaReport(filters?: { country?: CountryCode; city?: string }): Promise<ApiResponse<WeeklyCartaReport>> {
  try {
    // En el futuro aquí se reemplaza por llamadas a servicios / DB.
    const data = generateMockReport(filters);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: { message: 'Error generando reporte', code: 'report_error', details: err } };
  }
}

export default getWeeklyCartaReport;
