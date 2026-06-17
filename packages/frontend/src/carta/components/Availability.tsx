"use client";
import React from 'react';
import { AvailabilityReport } from '../types';

export function Availability({ data }: { data: AvailabilityReport }) {
  return (
    <section>
      <h2>Disponibilidad</h2>
      <p>Disponibilidad general: {data.overall_pct}%</p>
      <h3>Top platos fuera</h3>
      <ul>
        {data.top_off_meals.map((m) => (
          <li key={m.meal_id}>{m.meal_name} — tiendas off: {m.stores_off}</li>
        ))}
      </ul>
    </section>
  );
}

export default Availability;
