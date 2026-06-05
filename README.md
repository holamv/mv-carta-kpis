# mv-quejas

Sistema de quejas y reclamos de Manzana Verde. Monorepo con formulario publico
(Next.js) + API (Express) + base de datos MySQL.

## Estructura
```
packages/
├── shared    # Tipos y schemas Zod compartidos
├── backend   # API Express (MySQL)
└── frontend  # Next.js (App Router)
```

## Puesta en marcha

1. **Instalar dependencias** (desde la raiz):
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   ```bash
   cp packages/backend/.env.example packages/backend/.env
   cp packages/frontend/.env.example packages/frontend/.env.local
   ```
   Edita `packages/backend/.env` con las credenciales de la BD (`DB_ACCESS_*`).

3. **Crear la tabla** en MySQL:
   ```bash
   mysql -h <host> -u <user> -p <db> < packages/backend/db/migrations/001_create_quejas.sql
   ```

4. **Levantar en desarrollo**:
   ```bash
   npm run dev           # front (3000) + back (4000)
   npm run dev:backend   # solo API
   npm run dev:frontend  # solo web
   ```

## Tests
```bash
npm test                                   # todos los workspaces
npm test --workspace=packages/backend      # backend
npm test --workspace=packages/frontend     # frontend (unit)
npm run test:e2e --workspace=packages/frontend  # E2E Playwright
```

## Documentacion
Ver `docs/` — scope, logica de negocio, API, tablas y arquitectura.
