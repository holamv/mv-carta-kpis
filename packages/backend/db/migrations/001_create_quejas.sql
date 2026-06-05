-- Tabla de quejas/reclamos
-- MySQL 8+

CREATE TABLE IF NOT EXISTS quejas (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(120)    NOT NULL,
  email         VARCHAR(180)    NOT NULL,
  telefono      VARCHAR(30)     NULL,
  tipo          ENUM('producto','entrega','atencion','facturacion','app','otro') NOT NULL,
  pedido_id     VARCHAR(60)     NULL,
  mensaje       TEXT            NOT NULL,
  estado        ENUM('pendiente','en_proceso','resuelta','cerrada') NOT NULL DEFAULT 'pendiente',
  creado_en     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_quejas_estado (estado),
  KEY idx_quejas_tipo (tipo),
  KEY idx_quejas_creado_en (creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
