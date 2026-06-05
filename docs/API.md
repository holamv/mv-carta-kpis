# API — mv-quejas

Base URL: `${NEXT_PUBLIC_API_URL}` → por defecto `http://localhost:4000/api`

Todas las respuestas usan el wrapper estandar de MV:
```json
// exito
{ "success": true, "data": { ... } }
// error
{ "success": false, "error": { "message": "...", "code": "...", "details": {} } }
```

---

## GET /health
Health check del servicio y de la conexion a BD.

**200** `{ "success": true, "data": { "status": "ok", "db": true } }`
**503** si la BD no responde.

---

## POST /quejas
Crea una nueva queja.

**Body**
```json
{
  "nombre": "Ana Perez",
  "email": "ana@example.com",
  "telefono": "999888777",       // opcional
  "tipo": "entrega",             // producto|entrega|atencion|facturacion|app|otro
  "pedidoId": "PED-12345",       // opcional
  "mensaje": "Mi pedido llego tarde y frio."
}
```

**201** → `{ "success": true, "data": <Queja> }`
**400** → `VALIDATION_ERROR` con `details` por campo.

---

## GET /quejas
Lista quejas (mas recientes primero).

**Query params** (todos opcionales)
- `estado`: pendiente | en_proceso | resuelta | cerrada
- `tipo`: producto | entrega | atencion | facturacion | app | otro
- `limit`: 1–200 (default 50)
- `offset`: default 0

**200** → `{ "success": true, "data": <Queja[]> }`

---

## GET /quejas/:id
Obtiene una queja por id.

**200** → `{ "success": true, "data": <Queja> }`
**400** → `INVALID_ID`
**404** → `NOT_FOUND`

---

### Tipo Queja
```ts
interface Queja {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  tipo: 'producto' | 'entrega' | 'atencion' | 'facturacion' | 'app' | 'otro';
  pedidoId: string | null;
  mensaje: string;
  estado: 'pendiente' | 'en_proceso' | 'resuelta' | 'cerrada';
  creadoEn: string;       // ISO 8601
  actualizadoEn: string;  // ISO 8601
}
```
