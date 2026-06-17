# PROJECT SCOPE — mv-quejas + módulo Carta

## Resumen
Sistema de quejas y reclamos de Manzana Verde con dos módulos independientes:
1. **Quejas**: Formulario público para reporte de quejas persistidas en MySQL.
2. **Carta**: Reporte semanal de KPIs del menú con 5 secciones de análisis (disponibilidad, foodcost, platos nuevos, checklist, mystery orders).

## Módulo 1: Quejas
### Funcionalidades
- ✅ Formulario público de envío de quejas (frontend)
- ✅ Validación de datos en cliente y servidor (Zod, schema compartido)
- ✅ API REST para crear, listar y obtener quejas (backend)
- ✅ Persistencia en MySQL con queries parametrizados
- 🚧 Panel interno de gestión de quejas (listado/filtros/cambio de estado)
- ❌ Notificaciones por email al recibir una queja
- ❌ Autenticación para el panel interno

## Módulo 2: Carta (Reporte Semanal de KPIs)
### Estructura y Funcionalidades
El módulo vive de forma **completamente independiente** bajo `src/carta/*` (lógica) + `src/app/carta` + `src/app/api/carta` (UI y rutas).

#### 5 Secciones del Reporte
1. **Disponibilidad**: Porcentaje de platos activos por tienda, ciudad y país. Top platos apagados.
2. **Foodcost Teórico**: Comparación de foodcost % vs. umbral de alerta (40%) entre semanas actuales/previas.
3. **Platos Nuevos**: Performance de lanzamientos: unidades vendidas, foodcost real, rating promedio.
4. **Checklist de Carta**: Cumplimiento % ponderado por reglas de variedad proteínica, pesos, etc. Alertas accionables.
5. **Mystery Orders**: Status de ordenes mystery (pendiente integración).

#### Archivos Construidos
```
packages/frontend/src/carta/
├── types.ts                    # Tipos de dominio (CountryCode, Proteina, todos los interfaces)
├── mockData.ts                 # Generador de datos mock (generateMockReport)
├── service.ts                  # getWeeklyCartaReport() — exporta respuesta ApiResponse<WeeklyCartaReport>
└── components/
    ├── Availability.tsx        # Sección 1: disponibilidad general y top off meals
    ├── Foodcost.tsx            # Sección 2: comparación foodcost vs umbral
    ├── NewMeals.tsx            # Sección 3: performance de platos nuevos
    ├── Checklist.tsx           # Sección 4: cumplimiento % por país
    └── Mystery.tsx             # Sección 5: status mystery orders

packages/frontend/src/app/
├── api/carta/route.ts          # Endpoint GET /api/carta (devuelve mock vía service)
└── carta/page.tsx              # Página /carta (client component, fetch + renderiza secciones)
```

#### Datos Mock
- Utilizan tipos de `WeeklyCartaReport` sin datos reales conectados.
- Generan reportes con país PE, tiendas en Lima, varios platos, reglas de checklist.
- API `/api/carta` devuelve siempre mock; ideal para prototipado.

## Estructura General de Archivos
```
mv-quejas/
├── packages/
│   ├── shared/           # Tipos + schemas Zod (Queja, CrearQuejaInput, ApiResponse)
│   ├── backend/          # Express API (quejas, DB, controllers)
│   └── frontend/         # Next.js App Router
│       ├── src/
│       │   ├── app/      # Rutas y páginas (/, /carta)
│       │   ├── carta/    # Módulo independiente (tipos, mock, servicio)
│       │   └── components/
│       └── tests/        # E2E tests
└── docs/                 # Documentación (esta, ARCHITECTURE, COMPONENTS, etc.)
```

## APIs Consumidas Actualmente
- API propia del backend (`/api/quejas`).
- Endpoint local del frontend (`/api/carta` mock).

## Puntos Pendientes

### Carta — Integraciones Reales
- **FlowMaster + Dashboard Ops**: Integrar reporte semanal con dashboard de operaciones FlowMaster. Posible punto de entrada: `/admin/carta` o widget embedded.
- **Conexión Real a APIs/Datalake**: Reemplazar `generateMockReport()` con llamadas reales a:
  - Datalake de disponibilidad (cocina/POS)
  - BD de foodcost teórico
  - Sheet de ventas y ratings
  - Sheet "Check List Lanzamiento Carta Foodcourt" para mystery orders
- **Mystery Orders**: Integración con sheet "Check List Lanzamiento Carta Foodcourt"; actualmente enum `pending_integration`.
- **Regla: % de Frecuencia con Marcado Rojo**: Implementar lógica de regla que evalúe frecuencia de platos y marque en rojo aquellos que superen umbral o fallen checklist.

### Carta — Mejoras de UX/Styling
- Mejorar componentes con Tailwind + tokens MV (colores, tipografía).
- Agregar gráficos (disponibilidad % por tienda, línea de foodcost en el tiempo).
- Vistas filtradas por país, ciudad, tienda.
- Exportación a PDF o email semanal.

### Quejas — Completar
- Configurar `.env.example` con todas las variables.
- Panel interno de gestión (tablas, filtros, cambio de estado).
- Notificaciones por email.
- Autenticación para panel interno.

## Dependencias Clave
- **Frontend**: next 15, react 19, tailwindcss v4, zod, clsx, lucide-react
- **Backend**: express, mysql2, zod, helmet, cors, dotenv
- **Shared**: zod

## Variables de Entorno
- Frontend: `NEXT_PUBLIC_API_URL`
- Backend: `PORT`, `CORS_ORIGIN`, `DB_ACCESS_*`

## Estado (2026-06-15)
- ✅ Módulo Carta: estructura, tipos, 5 secciones con mock, componentes y página accesible en `/carta`.
- ✅ Endpoint `/api/carta` funcional con datos mock.
- 🚧 Módulo Quejas: scaffold inicial; pendiente completar panel y configurar BD.
- 📋 Próxima reunión con Operaciones para definir ubicación final de Carta (FlowMaster vs. sitio independiente).
