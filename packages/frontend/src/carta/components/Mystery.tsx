"use client";
import React from 'react';
import { MysteryReport, SectionMeta } from '../types';

export function Mystery({ data, meta }: { data: MysteryReport; meta: SectionMeta }) {
  return (
    <section>
      <h2>Mystery Orders</h2>
      <p>Estado: {data.status}</p>
      <p>{data.message}</p>
      <p>Paso: {data.pass_rate_pct ?? 'Pendiente de integracion'}</p>
      {!meta.source_connected && meta.note ? <p>Nota de fuente: {meta.note}</p> : null}
    </section>
  );
}

export default Mystery;
