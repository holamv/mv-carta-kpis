# COMPONENTS — mv-quejas (frontend)

## Componentes UI (`src/components/ui`)
- **Button** — boton con variantes `primary | secondary | ghost`. Usa tokens MV.
- **Card** — contenedor con borde, padding y sombra suave.

## Componentes de feature (`src/components`)
- **QuejaForm** (`'use client'`) — formulario de envio de quejas.
  - Valida con `crearQuejaSchema` (de `@mv-quejas/shared`).
  - Envia con `quejasApi.crear`.
  - Maneja estados: errores por campo, error general, enviando, exito.

## Librerias (`src/lib`)
- **api.ts** — cliente fetch tipado (`quejasApi.crear/listar/obtener`), `ApiClientError`.
- **utils.ts** — `cn()` (clsx) para componer clases.

## Pendientes
- Componentes del panel interno: tabla de quejas, filtros, badge de estado.
