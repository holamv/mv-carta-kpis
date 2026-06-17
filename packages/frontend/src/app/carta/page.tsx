'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getCurrentWeek, getPreviousWeek } from '@/carta/utils';
import type { CartaKPIReport, Country } from '@/carta/types';

const CIUDADES_POR_PAIS: Record<Country, string[]> = {
  PE: ['Lima', 'Piura'],
  CO: ['Bogotá'],
  MX: ['CDMX', 'Monterrey', 'Guadalajara'],
};

export default function CartaPage() {
  const [report, setReport] = useState<CartaKPIReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pais, setPais] = useState<Country>('PE');
  const [ciudad, setCiudad] = useState('');
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(getCurrentWeek());

  // Estado para tablas de datos
  const [topMeals, setTopMeals] = useState<any[]>([]);
  const [foodcostByCountry, setFoodcostByCountry] = useState<any[]>([]);
  const [complianceByCity, setComplianceByCity] = useState<any[]>([]);
  const [availabilityByKitchen, setAvailabilityByKitchen] = useState<any[]>([]);
  const [foodcostByPlate, setFoodcostByPlate] = useState<any[]>([]);
  const [complianceDetails, setComplianceDetails] = useState<any[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);

  const ciudadesDisponibles = useMemo(() => CIUDADES_POR_PAIS[pais], [pais]);

  // Cargar tablas de datos
  useEffect(() => {
    const loadTables = async () => {
      setLoadingTables(true);
      try {
        // Convertir W24-2026 a 242026 para endpoints
        const [weekPart, yearPart] = semanaSeleccionada.split('-');
        const semanaId = `${weekPart.substring(1)}${yearPart}`;

        const [mealsRes, foodcostRes, complianceRes, availabilityRes, foodcostPlateRes, complianceDetailsRes] = await Promise.all([
          fetch(`/api/carta/data/top-meals?country=${pais}&semana=${semanaSeleccionada}`),
          fetch('/api/carta/data/foodcost-by-country'),
          fetch(`/api/carta/data/compliance-by-city?semana_id=${semanaId}`),
          fetch(`/api/carta/data/availability-by-kitchen?semana_id=${semanaId}`),
          fetch(`/api/carta/data/foodcost-details?type=by_plate`),
          fetch(`/api/carta/data/compliance-details?type=rules_by_city&semana_id=${semanaId}`),
        ]);

        if (mealsRes.ok) {
          const data = await mealsRes.json();
          setTopMeals(data.data || []);
        }
        if (foodcostRes.ok) {
          const data = await foodcostRes.json();
          setFoodcostByCountry(data.data || []);
        }
        if (complianceRes.ok) {
          const data = await complianceRes.json();
          setComplianceByCity(data.data || []);
        }
        if (availabilityRes.ok) {
          const data = await availabilityRes.json();
          setAvailabilityByKitchen(data.data || []);
        }
        if (foodcostPlateRes.ok) {
          const data = await foodcostPlateRes.json();
          setFoodcostByPlate((data.data || []).slice(0, 10));
        }
        if (complianceDetailsRes.ok) {
          const data = await complianceDetailsRes.json();
          setComplianceDetails(data.data || []);
        }
      } catch (err) {
        console.error('Error loading tables:', err);
      } finally {
        setLoadingTables(false);
      }
    };
    loadTables();
  }, [pais, semanaSeleccionada]);

  const handleSemanaAnterior = () => {
    setSemanaSeleccionada(getPreviousWeek(semanaSeleccionada));
  };

  const handleSemanaSiguiente = () => {
    // Crear función para siguiente semana
    const [weekPart, yearPart] = semanaSeleccionada.split('-');
    let week = parseInt(weekPart.substring(1), 10) + 1;
    let year = parseInt(yearPart, 10);

    if (week > 52) {
      week = 1;
      year += 1;
    }

    setSemanaSeleccionada(`W${week.toString().padStart(2, '0')}-${year}`);
  };

  const handleHoy = () => {
    setSemanaSeleccionada(getCurrentWeek());
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('semana', semanaSeleccionada);
      if (pais) params.append('pais', pais);
      if (ciudad) params.append('ciudad', ciudad);

      const response = await fetch(`/api/carta/reporte?${params}`);
      const json = await response.json();

      if (!json.success) {
        setError(json.error?.message || 'Error generando reporte');
        return;
      }

      setReport(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-mv-green-dark">
          Reporte de KPIs de Carta
        </h1>
        <p className="mt-2 text-mv-gray-600">
          Consolidado automático de disponibilidad, foodcost, platos nuevos y checklist de carta
        </p>
      </header>

      <Card className="mb-6 p-6">
        <h2 className="mb-4 font-heading text-lg font-semibold">Seleccionar Semana</h2>
        <div className="flex items-center gap-4">
          <Button onClick={handleSemanaAnterior} variant="secondary">
            ← Anterior
          </Button>
          <div className="flex-1 text-center">
            <p className="text-lg font-semibold text-mv-green-dark">{semanaSeleccionada}</p>
          </div>
          <Button onClick={handleSemanaSiguiente} variant="secondary">
            Siguiente →
          </Button>
          <Button onClick={handleHoy} variant="secondary">
            Hoy
          </Button>
        </div>
      </Card>

      <Card className="mb-6 p-6">
        <h2 className="mb-4 font-heading text-lg font-semibold">Filtros</h2>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-mv-gray-900 mb-2">
                País
              </label>
              <select
                value={pais}
                onChange={(e) => setPais(e.target.value as Country)}
                className="w-full rounded-lg border border-mv-gray-300 px-3 py-2"
              >
                <option value="PE">Perú</option>
                <option value="CO">Colombia</option>
                <option value="MX">México</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-mv-gray-900 mb-2">
                Ciudad (opcional)
              </label>
              <select
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className="w-full rounded-lg border border-mv-gray-300 px-3 py-2"
              >
                <option value="">Todas las ciudades</option>
                {ciudadesDisponibles.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <Button onClick={handleGenerateReport} disabled={loading}>
            {loading ? 'Generando...' : 'Generar Reporte Semanal'}
          </Button>
        </div>
      </Card>

      {error && (
        <Card className="mb-6 border-mv-error bg-mv-error/10 p-4">
          <p className="text-mv-error font-semibold">Error: {error}</p>
        </Card>
      )}

      {report && (
        <div className="space-y-6">
          <Card className="p-6 bg-mv-green-pale border-l-4 border-mv-green-dark">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-mv-gray-600">Semana</p>
                <p className="text-2xl font-bold text-mv-green-dark">{report.semana}</p>
              </div>
              <div>
                <p className="text-sm text-mv-gray-600">Checklist</p>
                <p className="text-2xl font-bold text-mv-green-dark">{report.checklist.cumplimiento_promedio}%</p>
              </div>
              <div>
                <p className="text-sm text-mv-gray-600">Disponibilidad</p>
                <p className="text-2xl font-bold text-mv-green-dark">{report.disponibilidad.datos_tiendas.length > 0 ? 'Datos' : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-mv-gray-600">Platos Nuevos</p>
                <p className="text-2xl font-bold text-mv-green-dark">{report.platos_nuevos.platos.length}</p>
              </div>
            </div>
            <p className="text-xs text-mv-gray-600 mt-4">
              Generado: {new Date(report.generado_en).toLocaleString('es-PE')}
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-heading font-semibold mb-4">📊 Disponibilidad de Carta</h3>
            {report.disponibilidad.alertas.length > 0 ? (
              <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                {report.disponibilidad.alertas.map((alerta, i) => (
                  <p key={i} className="text-sm text-red-700">{alerta}</p>
                ))}
              </div>
            ) : null}
            {report.disponibilidad.datos_tiendas.length > 0 ? (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-mv-gray-100">
                    <th className="text-left p-2">Tienda</th>
                    <th className="text-left p-2">Ciudad</th>
                    <th className="text-right p-2">Disponibilidad</th>
                    <th className="text-right p-2">Platos</th>
                  </tr>
                </thead>
                <tbody>
                  {report.disponibilidad.datos_tiendas.map((t, i) => (
                    <tr key={i} className="border-b hover:bg-mv-gray-50">
                      <td className="p-2 font-medium">{t.tienda_nombre}</td>
                      <td className="p-2">{t.ciudad}</td>
                      <td className="text-right p-2 font-semibold">{t.porcentaje_disponibilidad}%</td>
                      <td className="text-right p-2">{t.platos_activos}/{t.platos_totales}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-mv-gray-600">Sin datos disponibles</p>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-heading font-semibold mb-4">💰 Foodcost Teórico</h3>
            {report.foodcost.alertas.length > 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
                {report.foodcost.alertas.map((alerta, i) => (
                  <p key={i} className="text-sm text-yellow-700">{alerta}</p>
                ))}
              </div>
            ) : null}
            {report.foodcost.datos_por_pais.length > 0 ? (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-mv-gray-100">
                    <th className="text-left p-2">País</th>
                    <th className="text-right p-2">Semana Actual</th>
                    <th className="text-right p-2">Semana Anterior</th>
                    <th className="text-right p-2">Diferencia</th>
                  </tr>
                </thead>
                <tbody>
                  {report.foodcost.datos_por_pais.map((d, i) => (
                    <tr key={i} className="border-b hover:bg-mv-gray-50">
                      <td className="p-2 font-medium">{d.pais}</td>
                      <td className="text-right p-2">{d.semana_actual}%</td>
                      <td className="text-right p-2">{d.semana_anterior}%</td>
                      <td className={`text-right p-2 font-semibold ${d.alerta ? 'text-red-600' : 'text-green-600'}`}>
                        {d.diferencia_pct > 0 ? '+' : ''}{d.diferencia_pct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-mv-gray-600">Sin datos disponibles</p>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-heading font-semibold mb-4">✅ Checklist de Carta</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.checklist.resultados_por_pais.map((r, i) => (
                <div key={i} className="border rounded p-4 bg-mv-gray-50">
                  <p className="font-semibold text-mv-green-dark mb-2">{r.pais}</p>
                  <div className="mb-3">
                    <p className="text-2xl font-bold text-mv-green-dark">{r.cumplimiento_pct}%</p>
                    <p className="text-xs text-mv-gray-600">Cumplimiento</p>
                  </div>
                  {r.alertas.length > 0 && (
                    <div className="text-xs space-y-1">
                      {r.alertas.slice(0, 2).map((a, j) => (
                        <p key={j} className="text-red-600">⚠ {a.mensaje}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tablas de datos reales */}
      <div className="mt-12 space-y-6">
        <h2 className="font-heading text-2xl font-bold text-mv-green-dark mb-6">📊 Dashboard de Datos (Menú Diario)</h2>

        {/* Top Platos Vendidos */}
        <Card className="p-6">
          <h3 className="font-heading font-semibold mb-4">🍽️ Top Platos Vendidos ({pais})</h3>
          {loadingTables ? (
            <p className="text-mv-gray-600">Cargando...</p>
          ) : topMeals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-mv-gray-100">
                    <th className="text-left p-2">Plato</th>
                    <th className="text-right p-2">Unidades</th>
                    <th className="text-right p-2">Rating</th>
                    <th className="text-right p-2">Foodcost</th>
                  </tr>
                </thead>
                <tbody>
                  {topMeals.map((meal, i) => (
                    <tr key={i} className="border-b hover:bg-mv-gray-50">
                      <td className="p-2 font-medium">{meal.meal_name}</td>
                      <td className="text-right p-2">{meal.unidades.toLocaleString()}</td>
                      <td className="text-right p-2">{meal.rating ? `${meal.rating} ⭐` : '—'}</td>
                      <td className="text-right p-2 font-semibold">{meal.foodcost_pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-mv-gray-600">Sin datos disponibles</p>
          )}
        </Card>

        {/* Foodcost por País */}
        <Card className="p-6">
          <h3 className="font-heading font-semibold mb-4">💰 Foodcost Teórico por País</h3>
          {loadingTables ? (
            <p className="text-mv-gray-600">Cargando...</p>
          ) : foodcostByCountry.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {foodcostByCountry.map((country, i) => (
                <div key={i} className="border rounded p-4 bg-mv-gray-50">
                  <p className="font-semibold text-lg mb-2">{country.country_code}</p>
                  <div className="mb-3">
                    <p className="text-xs text-mv-gray-600">Costo total</p>
                    <p className="text-lg font-semibold">{country.currency}{country.total_costo.toLocaleString()}</p>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-mv-gray-600">Precio total</p>
                    <p className="text-lg font-semibold">{country.currency}{country.total_precio.toLocaleString()}</p>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-xs text-mv-gray-600">Foodcost</p>
                    <p className="text-2xl font-bold text-mv-green-dark">{country.foodcost_pct}%</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-mv-gray-600">Sin datos disponibles</p>
          )}
        </Card>

        {/* Cumplimiento de Carta por Ciudad */}
        <Card className="p-6">
          <h3 className="font-heading font-semibold mb-4">✅ Cumplimiento de Carta por Ciudad</h3>
          {loadingTables ? (
            <p className="text-mv-gray-600">Cargando...</p>
          ) : complianceByCity.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-mv-gray-100">
                    <th className="text-left p-2">Ciudad</th>
                    <th className="text-center p-2">Compliance</th>
                    <th className="text-center p-2">Carne</th>
                    <th className="text-center p-2">Cerdo</th>
                    <th className="text-center p-2">Pescado</th>
                    <th className="text-center p-2">Estrella</th>
                    <th className="text-center p-2">Ensalada %</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceByCity.map((city, i) => (
                    <tr key={i} className="border-b hover:bg-mv-gray-50">
                      <td className="p-2 font-medium">{city.city}</td>
                      <td className="text-center p-2">
                        <span className="font-bold">{city.compliance_pct}%</span>
                      </td>
                      <td className="text-center p-2">{city.variedad_carne?.pass ? '✅' : '❌'}</td>
                      <td className="text-center p-2">{city.variedad_cerdo?.pass ? '✅' : '❌'}</td>
                      <td className="text-center p-2">{city.variedad_pescado?.pass ? '✅' : '❌'}</td>
                      <td className="text-center p-2 text-xs">{city.estrella_en_carta?.detail}</td>
                      <td className="text-center p-2 text-xs">{city.ensalada_share?.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-mv-gray-600">Sin datos disponibles</p>
          )}
        </Card>

        {/* Disponibilidad por Cocina */}
        <Card className="p-6">
          <h3 className="font-heading font-semibold mb-4">🍳 Disponibilidad por Cocina (Level A+B)</h3>
          {loadingTables ? (
            <p className="text-mv-gray-600">Cargando...</p>
          ) : availabilityByKitchen.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-mv-gray-100">
                    <th className="text-left p-2">Ciudad</th>
                    <th className="text-left p-2">Cocina</th>
                    <th className="text-center p-2">Nivel</th>
                    <th className="text-right p-2">Disponibles</th>
                    <th className="text-right p-2">Carta Total</th>
                    <th className="text-right p-2">Disponibilidad %</th>
                  </tr>
                </thead>
                <tbody>
                  {availabilityByKitchen.map((kitchen, i) => (
                    <tr key={i} className="border-b hover:bg-mv-gray-50">
                      <td className="p-2">{kitchen.city}</td>
                      <td className="p-2 font-medium">{kitchen.catering_name}</td>
                      <td className="text-center p-2">
                        <span className="bg-mv-green-pale px-2 py-1 rounded text-xs font-semibold">
                          {kitchen.level}
                        </span>
                      </td>
                      <td className="text-right p-2">{kitchen.disponibles}</td>
                      <td className="text-right p-2">{kitchen.carta_total}</td>
                      <td className="text-right p-2 font-semibold text-mv-green-dark">
                        {kitchen.disponibilidad_pct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-mv-gray-600">Sin datos disponibles</p>
          )}
        </Card>

        {/* Foodcost por Plato */}
        <Card className="p-6">
          <h3 className="font-heading font-semibold mb-4">💰 Foodcost por Plato (Top 10)</h3>
          {loadingTables ? (
            <p className="text-mv-gray-600">Cargando...</p>
          ) : foodcostByPlate.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-mv-gray-100">
                    <th className="text-left p-2">Plato</th>
                    <th className="text-right p-2">Foodcost %</th>
                    <th className="text-right p-2">Costo Local</th>
                  </tr>
                </thead>
                <tbody>
                  {foodcostByPlate.map((plate, i) => (
                    <tr key={i} className="border-b hover:bg-mv-gray-50">
                      <td className="p-2 font-medium">{plate.meal_name}</td>
                      <td className="text-right p-2 font-semibold">{plate.food_cost_pct}%</td>
                      <td className="text-right p-2">{plate.food_cost_local}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-mv-gray-600">Sin datos disponibles</p>
          )}
        </Card>

        {/* Compliance Rules Detail */}
        <Card className="p-6">
          <h3 className="font-heading font-semibold mb-4">📋 Detalle de Reglas por Ciudad (W252026)</h3>
          {loadingTables ? (
            <p className="text-mv-gray-600">Cargando...</p>
          ) : complianceDetails.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {complianceDetails.map((city, i) => (
                <div key={i} className="border rounded p-4 bg-mv-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-mv-green-dark">{city.city}</h4>
                    <span className="text-lg font-bold text-mv-green-dark">{city.compliance_pct}%</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    {city.rules_detail && Object.entries(city.rules_detail).map(([rule, detail]: [string, any]) => (
                      <div key={rule} className="flex justify-between">
                        <span className="text-mv-gray-600">{rule.replace(/_/g, ' ')}</span>
                        <span className="font-semibold">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-mv-gray-600">Sin datos disponibles</p>
          )}
        </Card>
      </div>
    </main>
  );
}
