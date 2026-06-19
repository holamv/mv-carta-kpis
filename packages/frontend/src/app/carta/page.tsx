'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { getCurrentWeek, getPreviousWeek } from '@/carta/utils';
import type { Country } from '@/carta/types';

const CIUDADES_POR_PAIS: Record<Country, string[]> = {
  PE: ['Lima', 'Piura'],
  CO: ['Bogotá'],
  MX: ['CDMX', 'Monterrey', 'Guadalajara'],
};

interface DashboardData {
  panels: {
    foodcost?: any;
    compliance?: any;
    topMeals?: any[];
    availability?: any[];
    complianceDetail?: any[];
    starPlates?: any[];
  };
}

export default function CartaPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pais, setPais] = useState<Country>('PE');
  const [ciudad, setCiudad] = useState('Lima');
  const [semana, setSemana] = useState(getCurrentWeek());

  const ciudadesDisponibles = CIUDADES_POR_PAIS[pais];

  useEffect(() => {
    if (!ciudadesDisponibles.includes(ciudad)) {
      setCiudad(ciudadesDisponibles[0]);
    }
  }, [pais, ciudad, ciudadesDisponibles]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/carta/dashboard/leo?semana=${semana}&pais=${pais}&ciudad=${ciudad}`
        );
        const json = await response.json();

        if (!response.ok) {
          setError(json.error || 'Error cargando datos');
          return;
        }

        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [semana, pais, ciudad]);

  const p = data?.panels;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-full mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard KPI - Carta | {pais} • {ciudad}</h1>

        {/* Filtros */}
        <Card className="mb-8 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Semana</label>
              <select
                value={semana}
                onChange={(e) => setSemana(e.target.value)}
                className="w-full p-2 border rounded"
              >
                {Array.from({ length: 16 }, (_, i) => {
                  const week = 25 - i;
                  return `W${week}-2026`;
                }).map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">País</label>
              <select
                value={pais}
                onChange={(e) => setPais(e.target.value as Country)}
                className="w-full p-2 border rounded"
              >
                <option value="PE">Perú</option>
                <option value="MX">México</option>
                <option value="CO">Colombia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ciudad</label>
              <select
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className="w-full p-2 border rounded"
              >
                {ciudadesDisponibles.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              {loading && <p className="text-gray-600 text-sm">Cargando...</p>}
            </div>
          </div>
        </Card>

        {error && (
          <div className="mb-8 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* FILA 1: KPIs principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Foodcost */}
              <Card className="p-6">
                <h2 className="text-sm font-medium text-gray-600 mb-2">Foodcost Teórico</h2>
                {p?.foodcost ? (
                  <div>
                    <p className="text-4xl font-bold text-blue-600">
                      {p.foodcost.foodcost_pct.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      ${p.foodcost.costo_local?.toFixed(2)} / ${p.foodcost.precio_local?.toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">Sin datos</p>
                )}
              </Card>

              {/* Compliance */}
              <Card className="p-6">
                <h2 className="text-sm font-medium text-gray-600 mb-2">Checklist Compliance</h2>
                {p?.compliance ? (
                  <div>
                    <p className="text-4xl font-bold text-green-600">
                      {p.compliance.compliance_pct.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {p.compliance.meals_count} platos evaluados
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">Sin datos</p>
                )}
              </Card>

              {/* Platos Nuevos */}
              <Card className="p-6">
                <h2 className="text-sm font-medium text-gray-600 mb-2">Platos Nuevos</h2>
                <p className="text-4xl font-bold text-purple-600">
                  {p?.topMeals?.length || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">top 5 de la semana</p>
              </Card>
            </div>

            {/* FILA 2: Top 5 platos + Star plates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Top 5 Platos */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Top 5 Platos (Unidades)</h2>
                {p?.topMeals && p.topMeals.length > 0 ? (
                  <div className="space-y-3">
                    {p.topMeals.map((m: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-sm border-b pb-2">
                        <div className="flex-1">
                          <p className="font-medium">
                            {i + 1}. {m.meal_name}
                            {m.is_star && <span className="ml-2 text-yellow-500">★</span>}
                          </p>
                          <p className="text-xs text-gray-500">FC: {m.food_cost_pct?.toFixed(1)}%</p>
                        </div>
                        <p className="font-bold text-blue-600">{m.unidades}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Sin datos</p>
                )}
              </Card>

              {/* Star Plates */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Star Plates (Top 5)</h2>
                {p?.starPlates && p.starPlates.length > 0 ? (
                  <div className="space-y-3">
                    {p.starPlates.map((sp: any) => (
                      <div key={sp.rank} className="flex justify-between items-center text-sm border-b pb-2">
                        <div className="flex-1">
                          <p className="font-medium">#{sp.rank} {sp.meal_name}</p>
                          <p className="text-xs text-gray-500">
                            {sp.weeks_consecutive} sem. consecutiva(s)
                          </p>
                        </div>
                        <p className="font-bold text-green-600">{sp.unidades_prev} u.</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Sin datos</p>
                )}
              </Card>
            </div>

            {/* FILA 3: Disponibilidad */}
            <Card className="p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Disponibilidad por Cocina</h2>
              {p?.availability && p.availability.length > 0 ? (
                <div className="space-y-3">
                  {p.availability.map((a: any, i: number) => (
                    <div key={i} className="border-b pb-3 last:border-b-0">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium text-sm">
                          {a.catering_name}
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                            a.catering_level === 'A'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {a.catering_level}
                          </span>
                        </p>
                        <p className="text-sm font-bold">
                          {a.disponibles}/{a.carta_total} ({a.disponibilidad_pct?.toFixed(1)}%)
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            a.disponibilidad_pct >= 90
                              ? 'bg-green-500'
                              : a.disponibilidad_pct >= 70
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${a.disponibilidad_pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Sin datos</p>
              )}
            </Card>

            {/* FILA 4: Reglas de ciudad + Detalle compliance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Reglas de ciudad */}
              <Card className="p-6 lg:col-span-1">
                <h2 className="text-lg font-semibold mb-4">Reglas de Ciudad</h2>
                {p?.compliance?.rules ? (
                  <div className="space-y-2">
                    {Object.entries(p.compliance.rules)
                      .filter(([key]) => !key.startsWith('_'))
                      .map(([rule, data]: [string, any]) => (
                        <div
                          key={rule}
                          className={`p-2 rounded text-xs ${
                            data.pass
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          <p className="font-medium">{rule}</p>
                          <p className="text-xs opacity-80">{data.detail}</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Sin datos</p>
                )}
              </Card>

              {/* Detalle compliance (peores primero) */}
              <Card className="p-6 lg:col-span-2">
                <h2 className="text-lg font-semibold mb-4">
                  Detalle Checklist ({p?.complianceDetail?.length || 0} platos)
                </h2>
                {p?.complianceDetail && p.complianceDetail.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {p.complianceDetail.slice(0, 15).map((m: any, i: number) => (
                      <div
                        key={i}
                        className={`p-2 rounded text-xs border-l-4 ${
                          m.compliance_ratio >= 90
                            ? 'border-green-500 bg-green-50'
                            : m.compliance_ratio >= 70
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-red-500 bg-red-50'
                        }`}
                      >
                        <p className="font-medium">
                          {m.meal_name}
                          {m.is_star && <span className="ml-1 text-yellow-500">★</span>}
                        </p>
                        <p className="text-xs opacity-70">
                          {m.passed}/{m.applicable} checks ({m.compliance_ratio}%)
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(m.checks)
                            .filter(([, v]) => v !== null)
                            .map(([check, passed]) => (
                              <span
                                key={check}
                                className={`text-xs px-1 rounded ${
                                  passed ? 'bg-green-200' : 'bg-red-200'
                                }`}
                              >
                                {passed ? '✓' : '✗'} {check}
                              </span>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Sin datos</p>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
