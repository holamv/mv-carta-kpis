'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getCurrentWeek, getPreviousWeek } from '@/carta/utils';
import type { Country } from '@/carta/types';

const CIUDADES_POR_PAIS: Record<Country, string[]> = {
  PE: ['Lima', 'Piura'],
  CO: ['Bogotá'],
  MX: ['CDMX', 'Monterrey', 'Guadalajara'],
};

interface DashboardPanel {
  foodcost?: { foodcost_pct: number };
  compliance?: { compliance_pct: number };
  topMeals?: any[];
  availability?: any[];
}

export default function CartaPage() {
  const [data, setData] = useState<{ panels: DashboardPanel } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pais, setPais] = useState<Country>('PE');
  const [ciudad, setCiudad] = useState('Lima');
  const [semana, setSemana] = useState(getCurrentWeek());

  const ciudadesDisponibles = CIUDADES_POR_PAIS[pais];

  // Reset ciudad cuando cambia país
  useEffect(() => {
    if (!ciudadesDisponibles.includes(ciudad)) {
      setCiudad(ciudadesDisponibles[0]);
    }
  }, [pais, ciudad, ciudadesDisponibles]);

  // Cargar datos cuando cambian los filtros
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

  const panels = data?.panels;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard KPI - Carta</h1>

        {/* Controles */}
        <Card className="mb-8 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Semana */}
            <div>
              <label className="block text-sm font-medium mb-2">Semana</label>
              <select
                value={semana}
                onChange={(e) => setSemana(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value={getCurrentWeek()}>{getCurrentWeek()}</option>
                <option value={getPreviousWeek(getCurrentWeek())}>
                  {getPreviousWeek(getCurrentWeek())}
                </option>
              </select>
            </div>

            {/* País */}
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

            {/* Ciudad */}
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

            {/* Info */}
            <div className="flex items-end">
              {loading && <p className="text-gray-600">Cargando...</p>}
            </div>
          </div>
        </Card>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Paneles */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Foodcost */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Foodcost</h2>
              {panels?.foodcost ? (
                <p className="text-3xl font-bold text-blue-600">
                  {panels.foodcost.foodcost_pct.toFixed(1)}%
                </p>
              ) : (
                <p className="text-gray-500">Sin datos</p>
              )}
            </Card>

            {/* Compliance */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Compliance</h2>
              {panels?.compliance ? (
                <p className="text-3xl font-bold text-green-600">
                  {panels.compliance.compliance_pct.toFixed(1)}%
                </p>
              ) : (
                <p className="text-gray-500">Sin datos</p>
              )}
            </Card>

            {/* Platos Nuevos */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Platos Nuevos</h2>
              {panels?.topMeals && panels.topMeals.length > 0 ? (
                <p className="text-3xl font-bold text-purple-600">
                  {panels.topMeals.length}
                </p>
              ) : (
                <p className="text-gray-500">Sin datos</p>
              )}
            </Card>

            {/* Disponibilidad */}
            <Card className="p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4">Disponibilidad por Tienda</h2>
              {panels?.availability && panels.availability.length > 0 ? (
                <div className="space-y-2">
                  {panels.availability.map((a: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{a.catering_name}</span>
                      <span className="font-semibold">
                        {(a.disponibilidad_pct * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Sin datos</p>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
