# PROJECT SCOPE — mv-carta-kpis

## Resumen

**Proyecto Principal:** Motor de cálculo y reporte semanal automático de KPIs de carta para Manzana Verde.

**Objetivo:** Automatizar la recopilación y consolidación de los KPIs semanales de carta (disponibilidad, foodcost teórico, platos nuevos, checklist de carta), eliminando la actualización manual de 4-5 sheets y centralizando la visibilidad en el Dashboard de Operaciones.

**Usuario final:** Equipo de Operaciones (DRI de carta), visible para todas las áreas.

**Frecuencia:** Semanal, generado a demanda con un botón.

---

## CORE: Capa de Cálculo Puro (100% COMPLETADO)

**Estado:** ✅ 23/23 tests pasando, 100% funcional

### 5 Motors de Cálculo

1. **ChecklistValidator** (14 tests)
   - Valida 5 reglas críticas de carta
   - Calificación >= 4.65, variedad mínima, rotación, pollo, pesos
   - Output: cumplimiento %, alertas por regla

2. **AvailabilityCalculator** (3 tests)
   - % disponibilidad por tienda, ciudad, país
   - Alertas si < 70%

3. **FoodcostCalculator** (2 tests)
   - Comparativo semana actual vs anterior
   - Alerta si diferencia > 40%

4. **NuevosPlatosAnalyzer** (2 tests)
   - Identifica platos lanzados (últimos 7 días)
   - Clasifica performance (arriba/normal/abajo promedio)

5. **ReportConsolidator** (2 tests)
   - Orquesta los 4 anteriores
   - Genera resumen ejecutivo con status (BUENO/ALERTA/CRITICO)

### Características
- ✅ Determinísticos (misma entrada = misma salida)
- ✅ Sin side effects (no modifican estado global)
- ✅ Independientes (cada motor funciona aislado)
- ✅ TypeScript strict, interfaces claras
- ✅ 23 tests cubriendo casos de éxito y edge cases
- ✅ Documentación matemática de cada regla

---

## Funcionalidades

### 1. Disponibilidad de Carta
- % de disponibilidad de platos por tienda
- Agregable por ciudad y país
- Top de platos apagados en la semana

### 2. Foodcost Teórico
- Comparativo semanal actual vs semana anterior
- Alerta si diferencia > 40%

### 3. Platos Nuevos Lanzados
- Listado de platos lanzados en la semana
- Con ventas, foodcost real y calificación

### 4. Checklist de Carta Automatizado
- Calificación promedio por plato < 4.65 → alertar
- Variedad mínima: PE/CO (2 carne, 2 cerdo, 2 pescado, 4 estrella); MX (3 carne, 2 cerdo, 2 pescado, 3 estrella)
- Rotación: platos estrella >= 2 semanas, demás >= 4 semanas
- Frecuencia máxima pollo: 7/semana PE/CO, 6/semana MX
- Pesos mínimos (600kcal: 350g, 70g proteína, 80g verduras, 140g arroz)
- % cumplimiento general por país

### 5. Mystery Orders Pass Rate
- Sección "Pendiente de integración"
- Por confirmar acceso con Jonathan

---

## Estructura de Archivos

```
mv-carta-kpis/
├── packages/
│   └── frontend/         # Next.js 15 App Router
│       └── src/
│           ├── app/
│           │   ├── page.tsx                # Redirige a /carta
│           │   ├── layout.tsx              # Root layout con fonts MV
│           │   ├── globals.css             # Tokens MV (Tailwind v4)
│           │   ├── carta/
│           │   │   └── page.tsx            # Página de reporte
│           │   └── api/
│           │       └── carta/
│           │           ├── reporte/
│           │           ├── disponibilidad/
│           │           ├── foodcost/
│           │           ├── checklist/
│           │           ├── platos-nuevos/
│           │           └── mystery/
│           ├── components/
│           │   └── ui/
│           │       ├── Button.tsx
│           │       └── Card.tsx
│           ├── carta/
│           │   ├── types.ts                # Tipos de dominio
│           │   ├── config.ts               # Reglas por país
│           │   ├── utils.ts                # Utilidades (semana ISO, helpers)
│           │   └── calculations/
│           │       ├── types.ts            # Interfaces entrada/salida
│           │       ├── checklist.validator.ts
│           │       ├── availability.calculator.ts
│           │       ├── foodcost.calculator.ts
│           │       ├── nuevos-platos.analyzer.ts
│           │       ├── report.consolidator.ts
│           │       └── __tests__/
│           │           ├── checklist.validator.test.ts (14 tests)
│           │           ├── availability.calculator.test.ts (3 tests)
│           │           ├── foodcost.calculator.test.ts (2 tests)
│           │           ├── nuevos-platos.analyzer.test.ts (2 tests)
│           │           └── report.consolidator.test.ts (2 tests)
│           └── lib/
│               ├── api.ts                  # Cliente API
│               └── (clientes de datos)     # Nuevos: mysql2, Supabase, sheets
├── config/
│   └── meal_classification.json            # Catálogo editable de platos
├── docs/
│   ├── PROJECT_SCOPE.md                    # Esta doc
│   └── CALCULATION_RULES.md                # Especificación matemática
└── .env.example                            # Variables de entorno
```

---

## Stack

- **Framework:** Next.js 15 (App Router)
- **UI/React:** React 19, TypeScript strict, Tailwind CSS v4 (tokens MV)
- **Gráficos:** Recharts ^2.10.0
- **Testing:** Vitest ^2.0.5 (23 tests, 100% pasando)
- **Bases de datos:** mysql2 (read-only réplica), Supabase PostgREST (datalake)
- **Componentes:** Lucide React (iconos), componentes UI propios

---

## Variables de Entorno

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# MySQL (read-only réplica)
DB_ACCESS_HOST=
DB_ACCESS_PORT=3306
DB_ACCESS_USER=
DB_ACCESS_PASSWORD=
DB_ACCESS_NAME=
DB_ACCESS_TYPE=mysql

# Supabase (datalake read-only)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Carta Module
N8N_API_KEY=
GOOGLE_SHEETS_API_KEY=
BACKEND_METRIC_FOODCOURT_URL=https://backend.manzanaverde.la/metric/foodcourt
BACKEND_RENDIMIENTO_ALIMENTOS_URL=https://backend.manzanaverde.la/rendimiento/alimentos
```

---

## Estado de Implementación

### Capa de Cálculo ✅ (100% COMPLETADO)
- [x] 5 motors de cálculo puro
- [x] 23 tests unitarios (100% pasando)
- [x] Especificación matemática documentada
- [x] Interfaces tipadas (entrada/salida claras)

### Próximas Fases (Opcionales)
- [ ] Clientes de datos read-only (mysql2, Supabase, APIs, Google Sheets)
- [ ] Adaptadores de datos por sección
- [ ] Route handlers `/api/carta/*` (disponibilidad, foodcost, checklist, etc.)
- [ ] Componentes UI (tablas, gráficos Recharts, alertas)
- [ ] Página `/carta` completa con filtros y secciones
- [ ] Integración de mystery orders

### Fuera de Alcance v1
- Validación de fotos, empaque, composición nutricional
- Flujo de aprobación Jonathan-Ops-Carlos
- Sincronización automática con sheets

---

## Cómo Ejecutar

```bash
# Install deps
npm install

# Tests de la capa de cálculo
npm test -- src/carta/calculations/__tests__/

# Dev server
npm run dev
# Abre http://localhost:3000 (redirige a /carta)

# Build
npm run build
npm start
```

---

## Notas Técnicas

- **BD MySQL:** Réplica de solo lectura. Pool de 5 conexiones. Queries livianos, siempre parametrizados.
- **Datalake:** Supabase con histórico S10-S19-2026 (10 semanas).
- **Semana ISO:** Formato WWYYYY (ej: 192026 = semana 19 de 2026).
- **Configuración de platos:** Editar `config/meal_classification.json` para actualizar lista de platos estrella y proteínas.

---

*Proyecto: mv-carta-kpis*
*Generado: 2026-06-14*
*Estado: Core completado (capa de cálculo 100% testeada)*
