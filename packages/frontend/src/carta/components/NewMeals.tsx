"use client";
import React from 'react';
import { NewMealPerformance } from '../types';

export function NewMeals({ items }: { items: NewMealPerformance[] }) {
  return (
    <section>
      <h2>Platos Nuevos</h2>
      <ul>
        {items.map((meal) => (
          <li key={meal.meal_id}>
            <strong>{meal.meal_name}</strong> ({meal.country}) — Lanzamiento: {meal.launch_week}. Ventas: {meal.units_sold}. Foodcost real: {meal.real_foodcost_pct ?? 'N/A'}%. Rating: {meal.avg_rating ?? 'N/A'}.
          </li>
        ))}
      </ul>
    </section>
  );
}

export default NewMeals;
