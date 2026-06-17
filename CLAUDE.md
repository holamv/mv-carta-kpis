# mv-carta-kpis

Motor de calculo y reporte semanal automatico de KPIs de carta para Manzana Verde.

Automatiza la recopilacion de:
- Disponibilidad de platos por tienda (isOpen/apagados)
- Foodcost teorico (semana actual vs anterior)
- Platos nuevos lanzados (performance)
- Checklist de carta (5 reglas de validacion)
- Mystery orders pass rate

Proyecto principal: **Capa de calculo puro** (5 motors, 23 tests, 100% funcional).

## Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript strict, Tailwind v4, Recharts
- **Testing:** Vitest (23 tests, 100% pasando)
- **BD:** MySQL 2 (read-only replica), Supabase datalake (PostgREST)
- **Componentes:** Lucide React, componentes UI propios

## Estructura

```
src/carta/
├── types.ts                      # Tipos de dominio
├── config.ts                     # Reglas por pais
├── utils.ts                      # Utilidades
└── calculations/
    ├── types.ts                  # Interfaces entrada/salida
    ├── checklist.validator.ts    # Motor: valida 5 reglas (14 tests)
    ├── availability.calculator.ts # Motor: disponibilidad (3 tests)
    ├── foodcost.calculator.ts     # Motor: foodcost (2 tests)
    ├── nuevos-platos.analyzer.ts  # Motor: platos nuevos (2 tests)
    ├── report.consolidator.ts     # Motor: consolidador (2 tests)
    └── __tests__/                 # Suite: 23/23 pasando
```

## Comandos

```bash
npm test -- src/carta/calculations/__tests__/     # Tests (23/23 pasando)
npm run dev                                       # Dev server (http://localhost:3000 → /carta)
npm run build && npm start                        # Produccion
```

## Reglas de Desarrollo

- Mantener la capa de calculo como proyecto principal (deterministica, sin dependencias externas)
- 100% TypeScript strict
- Toda logica de negocio va en motors (puro, testeado)
- Adaptadores de datos (mysql2, Supabase, APIs) se acoplen a los motors, no al reves
- Documentacion matematica de cada regla en CALCULATION_RULES.md

## Variables de Entorno

Ver .env.example

## Documentacion

- `docs/PROJECT_SCOPE.md` — Especificacion del proyecto
- `docs/CALCULATION_RULES.md` — Spec matematica de cada motor
- `config/meal_classification.json` — Catalogo editable de platos
