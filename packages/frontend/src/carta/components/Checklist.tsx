"use client";
import React from 'react';
import { ChecklistReport } from '../types';

export function Checklist({ reports }: { reports: ChecklistReport[] }) {
  return (
    <section>
      <h2>Checklist</h2>
      <ul>
        {reports.map((r) => (
          <li key={r.country + r.week}>
            <strong>{r.country}</strong> — Cumplimiento: {r.compliance_pct}%
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Checklist;
