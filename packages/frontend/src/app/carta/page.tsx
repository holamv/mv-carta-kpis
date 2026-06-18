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
  const [ciudad, setCiudad] = useState('Lima'); // Inicializar con Lima
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(getCurrentWeek());


  const ciudadesDisponibles = useMemo(() => CIUDADES_POR_PAIS[pais], [pais]);

  // Cargar dashboard Leo cuando cambias país/ciudad/semana
  useEffect(() => {
    const loadDashboard = async () => {
      if (!ciudad) return; // Requiere ciudad seleccionada

      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append('semana', semanaSeleccionada);
        params.append('pais', pais);
        params.append('ciudad', ciudad);

        const response = await fetch(`/api/carta/dashboard/leo?${params}`);
        const json = await response.json();

        if (!json.success) {
          setError(json.error || 'Error cargando dashboard');
          return;
        }

        // Transformar datos del dashboard/leo al formato esperado
        const dashboardData = json.panels;
        setReport({
          semana: semanaSeleccionada,
          generado_en: new Date().toISOString(),
          disponibilidad: {
            alertas: [],
            datos_tiendas: dashboardData.availability?.map((a: any) => ({
              tienda_nombre: a.catering_name,
              ciudad,
              porcentaje_disponibilidad: Number(a.disponibilidad_pct),
              platos_activos: a.disponibles,
              platos_totales: a.carta_total,
            })) || [],
          },
          foodcost: {
            alertas: [],
            datos_por_pais: dashboardData.foodcost ? [{
              pais,
              semana_actual: Number(dashboardData.foodcost.foodcost_pct),
              semana_anterior: 0,
              diferencia_pct: 0,
              alerta: false,
            }] : [],
          },
          checklist: {
            cumplimiento_promedio: dashboardData.compliance?.compliance_pct || 0,
            resultados_por_pais: dashboardData.compliance ? [{
              pais,
              cumplimiento_pct: dashboardData.compliance.compliance_pct,
              alertas: [],
            }] : [],
          },
          platos_nuevos: {
            platos: dashboardData.topMeals || [],
          },
        } as CartaKPIReport);
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [pais, ciudad, semanaSeleccionada]);

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
          <p className="text-sm text-mv-gray-600">
            {loading ? '⏳ Cargando dashboard...' : '✅ Dashboard actualizado'}
          </p>
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

    </main>
  );
}
