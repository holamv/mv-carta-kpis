# PROJECT SCOPE — mv-quejas

## Resumen
Sistema de quejas y reclamos de Manzana Verde. Los usuarios envian quejas mediante
un formulario web publico; las quejas se persisten en una base de datos MySQL para
seguimiento y gestion interna. No requiere autenticacion de usuario final.

## Funcionalidades
- ✅ Formulario publico de envio de quejas (frontend)
- ✅ Validacion de datos en cliente y servidor (Zod, schema compartido)
- ✅ API REST para crear, listar y obtener quejas (backend)
- ✅ Persistencia en MySQL con queries parametrizados
- 🚧 Panel interno de gestion de quejas (listado/filtros/cambio de estado)
- ❌ Notificaciones por email al recibir una queja
- ❌ Autenticacion para el panel interno

## Estructura de archivos
```
mv-quejas/
├── packages/
│   ├── shared/      # Tipos + schemas Zod (Queja, CrearQuejaInput, ApiResponse)
│   ├── backend/     # Express API (config, middleware, routes, controllers, services)
│   └── frontend/    # Next.js App Router (formulario, componentes UI, cliente API)
└── docs/            # Esta documentacion
```

## APIs consumidas
- API propia del backend (`/api/quejas`). No consume APIs externas de MV por ahora.

## Dependencias clave
- Frontend: next 15, react 19, tailwindcss v4, zod, clsx, lucide-react
- Backend: express, mysql2, zod, helmet, cors, dotenv
- Shared: zod

## Variables de entorno
- Frontend: `NEXT_PUBLIC_API_URL`
- Backend: `PORT`, `CORS_ORIGIN`, `DB_ACCESS_*`

## Estado
Scaffold inicial creado (2026-06-05). Pendiente: configurar `.env`, correr migracion
SQL, instalar dependencias y desarrollar el panel interno de gestion.
