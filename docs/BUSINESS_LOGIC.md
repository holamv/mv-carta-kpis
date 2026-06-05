# BUSINESS LOGIC — mv-quejas

> No se proporciono un PRD. Esta es una plantilla con las reglas asumidas en el
> scaffold inicial. Ajustar segun las reglas reales del negocio.

## Entidad: Queja
Una queja representa un reclamo o comentario negativo enviado por un cliente.

| Campo      | Tipo     | Reglas |
|------------|----------|--------|
| nombre     | string   | Requerido, 2–120 caracteres |
| email      | string   | Requerido, formato email valido, max 180 |
| telefono   | string?  | Opcional, max 30 |
| tipo       | enum     | Requerido: producto, entrega, atencion, facturacion, app, otro |
| pedidoId   | string?  | Opcional, max 60 (referencia al pedido relacionado) |
| mensaje    | string   | Requerido, 10–2000 caracteres |
| estado     | enum     | pendiente (default), en_proceso, resuelta, cerrada |
| creadoEn   | datetime | Generado automaticamente |
| actualizadoEn | datetime | Generado automaticamente |

## Flujos
1. **Crear queja**: usuario completa el formulario → validacion en cliente (Zod) →
   POST `/api/quejas` → validacion en servidor (mismo schema) → insert en BD con
   estado `pendiente` → respuesta con la queja creada → UI muestra confirmacion.
2. **Gestion interna** (pendiente): equipo lista quejas, filtra por estado/tipo y
   actualiza el estado a medida que las resuelve.

## Reglas y validaciones
- La misma validacion (schema en `packages/shared`) se aplica en front y back para
  evitar divergencias.
- El estado siempre inicia en `pendiente`; las transiciones de estado seran
  responsabilidad del panel interno (aun no implementado).

## Edge cases a considerar
- Limitar envios repetidos / spam (rate limiting — pendiente).
- Sanitizacion del mensaje al mostrarlo en el panel (evitar XSS — React ya escapa,
  validar al exportar).
- Quejas anonimas: actualmente email es obligatorio; revisar si el negocio lo permite.
