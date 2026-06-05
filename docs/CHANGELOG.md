# CHANGELOG — mv-quejas

## 2026-06-05 — Scaffold inicial
- Creado monorepo con npm workspaces (shared, backend, frontend).
- **shared**: tipos y schemas Zod del dominio (Queja, CrearQuejaInput, enums, ApiResponse).
- **backend**: Express + TypeScript con config (env, database MySQL), middleware
  (validate Zod, errorHandler), rutas `/api/health` y `/api/quejas` (POST/GET/GET:id),
  controller y service. Migracion SQL `001_create_quejas.sql`. Test de validacion.
- **frontend**: Next.js 15 (App Router) con tokens MV (Tailwind v4), formulario de
  quejas (`QuejaForm`), cliente API tipado, componentes Button/Card, estados
  loading/error/not-found. Tests unitarios (Vitest + RTL) y E2E (Playwright).
- Documentacion inicial en `docs/`.

### Pendiente
- Configurar `.env.local` (front) y `.env` (back).
- Correr `npm install` y la migracion SQL.
- Panel interno de gestion de quejas (con autenticacion).
- Rate limiting / proteccion anti-spam en el endpoint de creacion.
- Notificaciones por email.
- Sincronizar documentacion con Notion (requiere NOTION_TOKEN).
