"use client";
import React from 'react';
import { FoodcostReport } from '../types';

export function Foodcost({ data }: { data: FoodcostReport }) {
  return (
    <section>
      <h2>Foodcost Teórico</h2>
      <p>Umbral de alerta: {data.threshold_pct}%</p>
      <p>
        Semana actual: {data.current_week} — Semana anterior: {data.previous_week}
      </p>
      <ul>
        {data.items.map((item) => (
          <li key={item.country}>
            <strong>{item.country}</strong>: actual {item.current_pct ?? 'N/A'}%, previo {item.previous_pct ?? 'N/A'}%, delta {item.delta_pp ?? 'N/A'} puntos.
            {item.exceeds_threshold ? ' Alerta: excede umbral.' : ''}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Foodcost;
