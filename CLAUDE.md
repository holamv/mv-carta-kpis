# mv-quejas

Sistema de quejas y reclamos de Manzana Verde. Permite a los usuarios enviar quejas/reclamos a traves de un formulario web, que se persisten en una base de datos para su seguimiento y gestion.

## Stack
- **Monorepo** con npm workspaces (`packages/*`)
- **Frontend**: Next.js 15+ (App Router), TypeScript strict, Tailwind CSS v4 con tokens MV
- **Backend**: Express + TypeScript, validacion con Zod
- **BD**: MySQL/Postgres directo (sin Supabase) via `mysql2` / `pg`
- **Shared**: tipos TypeScript compartidos entre front y back
- **Testing**: Vitest + React Testing Library + Playwright (E2E)
- Sin autenticacion (formulario publico)

## Estructura
- `packages/frontend/` - App Next.js (formulario y vista de quejas)
- `packages/backend/` - API Express (recibe y guarda quejas)
- `packages/shared/` - Tipos y utilidades compartidas
- `docs/` - Documentacion del proyecto (sync con Notion)

## Reglas
- Seguir el design system de MV (ver `/mv-dev:mv-design-system`)
- Server Components por defecto en frontend; `'use client'` solo cuando sea necesario
- Toda la entrada del usuario se valida con Zod (front y back)
- Queries a BD siempre parametrizados (nunca string interpolation) — ver `/mv-dev:mv-db-queries`
- No hardcodear colores, usar tokens MV
- Tests para todo componente, hook y endpoint
- Tipos compartidos viven en `packages/shared`, no se duplican

## Comandos
- `npm run dev` - levanta front y back en paralelo
- `npm run dev:frontend` / `npm run dev:backend` - individual
- `npm test` - corre tests de todos los workspaces
- `npm run build` - build de shared -> backend -> frontend
