# ARCHITECTURE — mv-quejas

## Vista general
Monorepo con npm workspaces. Tres paquetes:

```
packages/
├── shared   -> tipos + schemas Zod (fuente de verdad del dominio)
├── backend  -> API Express que persiste en MySQL
└── frontend -> Next.js (App Router) con el formulario publico
```

El flujo de dependencias es: `frontend` y `backend` dependen de `shared`.
`shared` no depende de ninguno (evita ciclos).

## Patron de datos
1. El dominio (`Queja`, `CrearQuejaInput`, enums, `ApiResponse`) se define UNA vez en
   `packages/shared` con Zod + tipos inferidos.
2. El frontend valida el formulario con `crearQuejaSchema` antes de enviar.
3. El backend valida de nuevo el body con el MISMO schema (middleware `validateBody`).
4. El service del backend hace queries parametrizados a MySQL y mapea filas
   (snake_case) a objetos `Queja` (camelCase).

## Backend
- `config/env.ts` — valida variables de entorno con Zod al arrancar.
- `config/database.ts` — pool MySQL (mysql2) + helper `query()` parametrizado.
- `middleware/` — `validate` (Zod), `errorHandler` (HttpError + 404 + 500).
- `routes/` — `/api/health`, `/api/quejas`.
- `controllers/` — orquestan request/response.
- `services/` — logica de negocio y acceso a datos.

## Frontend
- App Router con Server Components por defecto; `QuejaForm` es `'use client'`.
- `lib/api.ts` — cliente fetch tipado contra `ApiResponse`.
- `components/ui/` — Button, Card (design system MV con tokens).
- Tailwind CSS v4 con tokens MV en `globals.css`.

## Variables de entorno
| Paquete  | Variable              | Descripcion |
|----------|-----------------------|-------------|
| frontend | NEXT_PUBLIC_API_URL   | URL base de la API |
| backend  | PORT                  | Puerto del servidor (4000) |
| backend  | CORS_ORIGIN           | Origen permitido del frontend |
| backend  | DB_ACCESS_TYPE        | mysql \| postgres |
| backend  | DB_ACCESS_HOST/PORT/USER/PASSWORD/NAME | Conexion a BD |

## Notas
- Configurado para MySQL. Para Postgres: instalar `pg` y reescribir
  `config/database.ts` manteniendo la interfaz `query()`.
- Sin autenticacion (decision del proyecto). El futuro panel interno requerira auth.
