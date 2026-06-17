"use client";
import React, { useEffect, useState } from 'react';
import Availability from '@/carta/components/Availability';
import Checklist from '@/carta/components/Checklist';
import Foodcost from '@/carta/components/Foodcost';
import NewMeals from '@/carta/components/NewMeals';
import Mystery from '@/carta/components/Mystery';

export default function CartaPage() {
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/carta')
      .then((r) => r.json())
      .then((res) => {
        if (res?.success) setData(res.data);
        else setError(res?.error?.message || 'Error desconocido');
      })
      .catch((e) => setError(String(e)));
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>Cargando reporte de carta…</div>;

  return (
    <main>
      <h1>Reporte Semanal de Carta — Semana {data.week}</h1>
      <Availability data={data.availability.data} />
      <Foodcost data={data.foodcost.data} />
      <NewMeals items={data.new_meals.data} />
      <Checklist reports={data.checklist.data} />
      <Mystery data={data.mystery.data} meta={data.mystery.meta} />
    </main>
  );
}
