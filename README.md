# 🍏 mv-carta-kpis

**Motor de cálculo y reporte semanal automático de KPIs de carta para Manzana Verde**

Automatiza la consolidación de:
- Disponibilidad de platos por tienda/ciudad/país
- Foodcost teórico (comparativo semanal)
- Platos nuevos lanzados (últimos 7 días)
- Checklist de carta (5 reglas de validación)
- Mystery orders pass rate

---

## 🎯 Core: Capa de Cálculo Pura

**Estado:** ✅ 23/23 tests pasando, 100% funcional

### 5 Motors de Cálculo Puro

| Motor | Tests | Lógica |
|-------|-------|--------|
| **ChecklistValidator** | 14 ✅ | Valida 5 reglas de carta |
| **AvailabilityCalculator** | 3 ✅ | Consolida disponibilidad |
| **FoodcostCalculator** | 2 ✅ | Compara foodcost semana actual vs anterior |
| **NuevosPlatosAnalyzer** | 2 ✅ | Identifica platos lanzados + performance |
| **ReportConsolidator** | 2 ✅ | Orquesta los 4 anteriores |

### Características
- ✅ Determinísticos (misma entrada = misma salida)
- ✅ Sin side effects (no modifican estado)
- ✅ Sin dependencias externas
- ✅ 100% TypeScript strict
- ✅ Lógica documentada matemáticamente

---

## 🚀 Quickstart

```bash
# Install
npm install

# Tests de la capa de cálculo (23/23 pasando)
npm test -- src/carta/calculations/__tests__/

# Dev
npm run dev
# → http://localhost:3000 (redirige a /carta)

# Producción
npm run build
npm start
```

---

## 📁 Estructura

```
packages/frontend/src/
├── app/
│   ├── page.tsx              # Root (redirige a /carta)
│   ├── layout.tsx            # Root layout (fonts, metadata)
│   ├── globals.css           # Tokens MV (Tailwind v4)
│   └── carta/
│       └── page.tsx          # Página de reporte
├── components/
│   └── ui/                   # Button, Card
├── carta/
│   ├── types.ts              # Tipos de dominio
│   ├── config.ts             # Reglas por país
│   ├── utils.ts              # Utilidades
│   └── calculations/         # CORE: Motors de cálculo
│       ├── checklist.validator.ts
│       ├── availability.calculator.ts
│       ├── foodcost.calculator.ts
│       ├── nuevos-platos.analyzer.ts
│       ├── report.consolidator.ts
│       └── __tests__/        # 23 tests (100% pasando)
└── lib/
    └── api.ts                # Cliente API
```

---

## 📊 Stack

- **Framework:** Next.js 15 (App Router)
- **UI/React:** React 19, TypeScript strict, Tailwind CSS v4
- **Gráficos:** Recharts
- **Testing:** Vitest (23 tests)
- **Bases de datos:** mysql2 (read-only), Supabase datalake
- **Componentes:** Lucide React, componentes propios

---

## 📖 Documentación

- [`docs/PROJECT_SCOPE.md`](docs/PROJECT_SCOPE.md) — Especificación completa del proyecto
- [`docs/CALCULATION_RULES.md`](docs/CALCULATION_RULES.md) — Especificación matemática de cada motor
- [`CLAUDE.md`](CLAUDE.md) — Guía de desarrollo
- [`config/meal_classification.json`](config/meal_classification.json) — Catálogo editable de platos

---

## 🎓 Próximas Fases (Opcionales)

1. **Clientes de datos:** Adaptadores para MySQL, Supabase, APIs backend, Google Sheets
2. **Route handlers:** `/api/carta/*` que orquestan datos + motors
3. **Componentes UI:** Tablas, gráficos Recharts, alertas visuales
4. **Página completa:** Filtros país/ciudad, secciones interactivas

---

## 📝 Notas

- Capa de cálculo es proyecto principal (determinística, testeada, sin dependencias)
- DB MySQL: réplica read-only, pool de 5 conexiones
- Datalake: Supabase con histórico S10-S19-2026 (10 semanas)
- Semana ISO: Formato WWYYYY (ej: 192026)

---

**Proyecto:** mv-carta-kpis  
**Estado:** Core completado ✅  
**Tests:** 23/23 pasando  
**Generado:** 2026-06-14
