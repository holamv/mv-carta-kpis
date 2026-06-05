# TABLES — mv-quejas

## quejas
Almacena las quejas/reclamos enviados por los usuarios.
Migracion: `packages/backend/db/migrations/001_create_quejas.sql`

| Columna        | Tipo                         | Null | Default            | Notas |
|----------------|------------------------------|------|--------------------|-------|
| id             | BIGINT UNSIGNED AUTO_INCREMENT | No | —                  | PK |
| nombre         | VARCHAR(120)                 | No   | —                  | |
| email          | VARCHAR(180)                 | No   | —                  | |
| telefono       | VARCHAR(30)                  | Si   | NULL               | |
| tipo           | ENUM(...)                    | No   | —                  | producto, entrega, atencion, facturacion, app, otro |
| pedido_id      | VARCHAR(60)                  | Si   | NULL               | referencia al pedido |
| mensaje        | TEXT                         | No   | —                  | |
| estado         | ENUM(...)                    | No   | 'pendiente'        | pendiente, en_proceso, resuelta, cerrada |
| creado_en      | TIMESTAMP                    | No   | CURRENT_TIMESTAMP  | |
| actualizado_en | TIMESTAMP                    | No   | CURRENT_TIMESTAMP ON UPDATE | |

**Indices**
- PRIMARY KEY (id)
- idx_quejas_estado (estado)
- idx_quejas_tipo (tipo)
- idx_quejas_creado_en (creado_en)

**Engine/charset:** InnoDB, utf8mb4_unicode_ci
