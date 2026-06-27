-- ============================================================
-- database-schema.sql — FerreStock Pro
-- Sistema de Control de Inventario y Ventas para Ferreterías
-- Universidad Nacional de San Cristóbal de Huamanga (UNSCH)
-- Base de datos: MySQL 8.x
-- Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ============================================================
-- INSTRUCCIONES DE USO:
-- 1. Abrir MySQL Workbench o consola MySQL
-- 2. Ejecutar: mysql -u root -p < database-schema.sql
-- 3. Verificar con: SHOW TABLES;
-- ============================================================

-- ------------------------------------------------------------
-- CREAR Y SELECCIONAR BASE DE DATOS
-- ------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS ferrestock_pro
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ferrestock_pro;

-- ------------------------------------------------------------
-- DESACTIVAR VERIFICACIÓN DE CLAVES FORÁNEAS DURANTE CREACIÓN
-- ------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- TABLA 1: roles
-- Catálogo de roles del sistema (Administrador, Vendedor, Bodeguero)
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(50)     NOT NULL,
  descripcion   VARCHAR(255)    NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    DATETIME        NULL DEFAULT NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Catálogo de roles de usuario del sistema';

-- ============================================================
-- TABLA 2: usuarios
-- Personal de la ferretería que accede al sistema
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  rol_id        INT UNSIGNED    NOT NULL,
  nombre        VARCHAR(100)    NOT NULL,
  apellidos     VARCHAR(100)    NOT NULL,
  email         VARCHAR(150)    NOT NULL,
  password      VARCHAR(255)    NOT NULL COMMENT 'Hash bcrypt, nunca texto plano',
  telefono      VARCHAR(15)     NULL,
  activo        TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '1=activo, 0=inactivo',
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    DATETIME        NULL DEFAULT NULL COMMENT 'Soft delete',

  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email),
  INDEX idx_usuarios_rol_id (rol_id),
  INDEX idx_usuarios_activo (activo),

  CONSTRAINT fk_usuarios_rol
    FOREIGN KEY (rol_id) REFERENCES roles (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Personal de la ferretería con acceso al sistema';

-- ============================================================
-- TABLA 3: categorias
-- Categorías para organizar el catálogo de productos
-- ============================================================
CREATE TABLE IF NOT EXISTS categorias (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(100)    NOT NULL,
  descripcion   VARCHAR(255)    NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    DATETIME        NULL DEFAULT NULL COMMENT 'Soft delete',

  PRIMARY KEY (id),
  UNIQUE KEY uq_categorias_nombre (nombre),
  INDEX idx_categorias_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Categorías del catálogo de productos';

-- ============================================================
-- TABLA 4: unidades_medida
-- Unidades de medida para los productos
-- ============================================================
CREATE TABLE IF NOT EXISTS unidades_medida (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(50)     NOT NULL COMMENT 'Ej: Unidad, Metro, Litro',
  abreviatura   VARCHAR(10)     NOT NULL COMMENT 'Ej: und, m, lt',
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_unidades_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Unidades de medida para productos';

-- ============================================================
-- TABLA 5: proveedores
-- Proveedores que suministran productos a la ferretería
-- ============================================================
CREATE TABLE IF NOT EXISTS proveedores (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  razon_social    VARCHAR(150)    NOT NULL,
  ruc             VARCHAR(11)     NOT NULL COMMENT 'RUC peruano: 11 dígitos',
  telefono        VARCHAR(15)     NOT NULL,
  email           VARCHAR(150)    NULL,
  direccion       VARCHAR(255)    NULL,
  nombre_contacto VARCHAR(100)    NULL COMMENT 'Nombre del representante o contacto',
  activo          TINYINT(1)      NOT NULL DEFAULT 1,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME        NULL DEFAULT NULL COMMENT 'Soft delete',

  PRIMARY KEY (id),
  UNIQUE KEY uq_proveedores_ruc (ruc),
  INDEX idx_proveedores_razon_social (razon_social),
  INDEX idx_proveedores_activo (activo),
  INDEX idx_proveedores_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Proveedores que abastecen a la ferretería';

-- ============================================================
-- TABLA 6: productos
-- Catálogo completo de productos de la ferretería
-- ============================================================
CREATE TABLE IF NOT EXISTS productos (
  id                INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  categoria_id      INT UNSIGNED      NOT NULL,
  unidad_medida_id  INT UNSIGNED      NOT NULL,
  proveedor_id      INT UNSIGNED      NULL COMMENT 'Proveedor principal del producto',
  codigo            VARCHAR(20)       NOT NULL COMMENT 'Ej: HERR-0001, PINT-0023',
  nombre            VARCHAR(150)      NOT NULL,
  descripcion       TEXT              NULL,
  precio_compra     DECIMAL(10,2)     NOT NULL DEFAULT 0.00 COMMENT 'Precio de compra al proveedor en PEN',
  precio_venta      DECIMAL(10,2)     NOT NULL DEFAULT 0.00 COMMENT 'Precio de venta al cliente en PEN',
  stock_minimo      INT UNSIGNED      NOT NULL DEFAULT 0 COMMENT 'Stock mínimo antes de alerta de reposición',
  activo            TINYINT(1)        NOT NULL DEFAULT 1,
  created_at        DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        DATETIME          NULL DEFAULT NULL COMMENT 'Soft delete',

  PRIMARY KEY (id),
  UNIQUE KEY uq_productos_codigo (codigo),
  INDEX idx_productos_categoria_id (categoria_id),
  INDEX idx_productos_unidad_medida_id (unidad_medida_id),
  INDEX idx_productos_proveedor_id (proveedor_id),
  INDEX idx_productos_nombre (nombre),
  INDEX idx_productos_activo (activo),
  INDEX idx_productos_deleted_at (deleted_at),

  CONSTRAINT fk_productos_categoria
    FOREIGN KEY (categoria_id) REFERENCES categorias (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT fk_productos_unidad_medida
    FOREIGN KEY (unidad_medida_id) REFERENCES unidades_medida (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT fk_productos_proveedor
    FOREIGN KEY (proveedor_id) REFERENCES proveedores (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Catálogo de productos de la ferretería';

-- ============================================================
-- TABLA 7: inventario
-- Stock actual de cada producto (una fila por producto)
-- Se actualiza automáticamente con cada movimiento
-- ============================================================
CREATE TABLE IF NOT EXISTS inventario (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  producto_id   INT UNSIGNED    NOT NULL,
  stock_actual  INT             NOT NULL DEFAULT 0 COMMENT 'Nunca puede ser negativo',
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_inventario_producto_id (producto_id),
  INDEX idx_inventario_stock_actual (stock_actual),

  CONSTRAINT fk_inventario_producto
    FOREIGN KEY (producto_id) REFERENCES productos (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT chk_inventario_stock_no_negativo
    CHECK (stock_actual >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Stock actual por producto. Se sincroniza con movimientos_inventario';

-- ============================================================
-- TABLA 8: movimientos_inventario
-- Historial completo de entradas y salidas de inventario
-- INMUTABLE: los registros no se editan ni eliminan
-- ============================================================
CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  producto_id   INT UNSIGNED    NOT NULL,
  usuario_id    INT UNSIGNED    NOT NULL COMMENT 'Usuario que registró el movimiento',
  venta_id      INT UNSIGNED    NULL COMMENT 'Referencia si el movimiento viene de una venta',
  tipo          ENUM('ENTRADA','SALIDA','AJUSTE','DEVOLUCION') NOT NULL,
  cantidad      INT             NOT NULL COMMENT 'Positivo para entradas, negativo para salidas',
  stock_antes   INT             NOT NULL COMMENT 'Stock antes del movimiento (auditoría)',
  stock_despues INT             NOT NULL COMMENT 'Stock después del movimiento (auditoría)',
  motivo        VARCHAR(255)    NULL COMMENT 'Descripción del motivo del movimiento',
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_movimientos_producto_id (producto_id),
  INDEX idx_movimientos_usuario_id (usuario_id),
  INDEX idx_movimientos_venta_id (venta_id),
  INDEX idx_movimientos_tipo (tipo),
  INDEX idx_movimientos_created_at (created_at),

  CONSTRAINT fk_movimientos_producto
    FOREIGN KEY (producto_id) REFERENCES productos (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT fk_movimientos_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Historial de movimientos de inventario. Inmutable una vez registrado';

-- ============================================================
-- TABLA 9: clientes
-- Clientes registrados de la ferretería
-- ============================================================
CREATE TABLE IF NOT EXISTS clientes (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nombre          VARCHAR(100)    NOT NULL,
  apellidos       VARCHAR(100)    NULL,
  tipo_documento  ENUM('DNI','RUC') NOT NULL DEFAULT 'DNI',
  numero_documento VARCHAR(11)    NOT NULL COMMENT 'DNI: 8 dígitos, RUC: 11 dígitos',
  telefono        VARCHAR(15)     NULL,
  email           VARCHAR(150)    NULL,
  direccion       VARCHAR(255)    NULL,
  activo          TINYINT(1)      NOT NULL DEFAULT 1,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME        NULL DEFAULT NULL COMMENT 'Soft delete',

  PRIMARY KEY (id),
  UNIQUE KEY uq_clientes_documento (numero_documento),
  INDEX idx_clientes_nombre (nombre),
  INDEX idx_clientes_telefono (telefono),
  INDEX idx_clientes_activo (activo),
  INDEX idx_clientes_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Clientes registrados de la ferretería';

-- ============================================================
-- TABLA 10: ventas
-- Cabecera de cada transacción de venta
-- ============================================================
CREATE TABLE IF NOT EXISTS ventas (
  id              INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  cliente_id      INT UNSIGNED      NULL COMMENT 'NULL = venta anónima sin cliente registrado',
  vendedor_id     INT UNSIGNED      NOT NULL COMMENT 'Usuario que realizó la venta',
  numero_venta    VARCHAR(20)       NOT NULL COMMENT 'Formato: VTA-2025-0001',
  subtotal        DECIMAL(10,2)     NOT NULL DEFAULT 0.00 COMMENT 'Total antes de descuento en PEN',
  porcentaje_desc DECIMAL(5,2)      NOT NULL DEFAULT 0.00 COMMENT 'Porcentaje de descuento aplicado',
  monto_descuento DECIMAL(10,2)     NOT NULL DEFAULT 0.00 COMMENT 'Monto descontado en PEN',
  total           DECIMAL(10,2)     NOT NULL DEFAULT 0.00 COMMENT 'Total final pagado en PEN',
  metodo_pago     ENUM('EFECTIVO','YAPE','PLIN','TRANSFERENCIA') NOT NULL DEFAULT 'EFECTIVO',
  estado          ENUM('COMPLETADA','ANULADA','CREDITO') NOT NULL DEFAULT 'COMPLETADA',
  observaciones   TEXT              NULL,
  fecha_venta     DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME          NULL DEFAULT NULL COMMENT 'Soft delete para anulación',

  PRIMARY KEY (id),
  UNIQUE KEY uq_ventas_numero_venta (numero_venta),
  INDEX idx_ventas_cliente_id (cliente_id),
  INDEX idx_ventas_vendedor_id (vendedor_id),
  INDEX idx_ventas_estado (estado),
  INDEX idx_ventas_metodo_pago (metodo_pago),
  INDEX idx_ventas_fecha_venta (fecha_venta),

  CONSTRAINT fk_ventas_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes (id)
    ON UPDATE CASCADE ON DELETE SET NULL,

  CONSTRAINT fk_ventas_vendedor
    FOREIGN KEY (vendedor_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Cabecera de ventas. Cada fila es una transacción completa';

-- ============================================================
-- TABLA 11: detalle_ventas
-- Ítems de cada venta (productos vendidos)
-- ============================================================
CREATE TABLE IF NOT EXISTS detalle_ventas (
  id              INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  venta_id        INT UNSIGNED      NOT NULL,
  producto_id     INT UNSIGNED      NOT NULL,
  cantidad        INT UNSIGNED      NOT NULL COMMENT 'Cantidad vendida',
  precio_unitario DECIMAL(10,2)     NOT NULL COMMENT 'Precio al momento de la venta en PEN',
  subtotal        DECIMAL(10,2)     NOT NULL COMMENT 'cantidad x precio_unitario en PEN',
  created_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_detalle_ventas_venta_id (venta_id),
  INDEX idx_detalle_ventas_producto_id (producto_id),

  CONSTRAINT fk_detalle_ventas_venta
    FOREIGN KEY (venta_id) REFERENCES ventas (id)
    ON UPDATE CASCADE ON DELETE CASCADE,

  CONSTRAINT fk_detalle_ventas_producto
    FOREIGN KEY (producto_id) REFERENCES productos (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Detalle de productos por venta';

-- ============================================================
-- TABLA 12: creditos
-- Control de ventas al crédito y sus pagos
-- ============================================================
CREATE TABLE IF NOT EXISTS creditos (
  id              INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  venta_id        INT UNSIGNED      NOT NULL,
  cliente_id      INT UNSIGNED      NOT NULL,
  monto_total     DECIMAL(10,2)     NOT NULL COMMENT 'Monto total de la deuda en PEN',
  monto_pagado    DECIMAL(10,2)     NOT NULL DEFAULT 0.00 COMMENT 'Monto pagado hasta el momento',
  monto_pendiente DECIMAL(10,2)     NOT NULL COMMENT 'monto_total - monto_pagado en PEN',
  fecha_limite    DATE              NOT NULL COMMENT 'Fecha acordada de pago',
  estado          ENUM('PENDIENTE','PAGADO_PARCIAL','PAGADO') NOT NULL DEFAULT 'PENDIENTE',
  created_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_creditos_venta_id (venta_id),
  INDEX idx_creditos_cliente_id (cliente_id),
  INDEX idx_creditos_estado (estado),
  INDEX idx_creditos_fecha_limite (fecha_limite),

  CONSTRAINT fk_creditos_venta
    FOREIGN KEY (venta_id) REFERENCES ventas (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT fk_creditos_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Control de ventas al crédito y seguimiento de pagos';

-- ============================================================
-- TABLA 13: pagos_credito
-- Registro de cada pago parcial o total de un crédito
-- ============================================================
CREATE TABLE IF NOT EXISTS pagos_credito (
  id              INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  credito_id      INT UNSIGNED      NOT NULL,
  usuario_id      INT UNSIGNED      NOT NULL COMMENT 'Usuario que registró el pago',
  monto           DECIMAL(10,2)     NOT NULL COMMENT 'Monto del pago en PEN',
  metodo_pago     ENUM('EFECTIVO','YAPE','PLIN','TRANSFERENCIA') NOT NULL,
  observaciones   VARCHAR(255)      NULL,
  created_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_pagos_credito_credito_id (credito_id),
  INDEX idx_pagos_credito_usuario_id (usuario_id),

  CONSTRAINT fk_pagos_credito_credito
    FOREIGN KEY (credito_id) REFERENCES creditos (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT fk_pagos_credito_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Pagos realizados contra créditos pendientes';

-- ------------------------------------------------------------
-- REACTIVAR VERIFICACIÓN DE CLAVES FORÁNEAS
-- ------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- DATOS INICIALES (SEED)
-- ============================================================

-- Roles del sistema
INSERT INTO roles (nombre, descripcion) VALUES
  ('Administrador', 'Acceso total al sistema: configuración, reportes, usuarios y todas las operaciones'),
  ('Vendedor',      'Acceso al punto de venta, consulta de productos y registro de clientes'),
  ('Bodeguero',     'Gestión de inventario, recepción de productos y control de stock');

-- Unidades de medida
INSERT INTO unidades_medida (nombre, abreviatura) VALUES
  ('Unidad',      'und'),
  ('Metro',       'm'),
  ('Metro cuadrado', 'm2'),
  ('Litro',       'lt'),
  ('Kilogramo',   'kg'),
  ('Caja',        'caj'),
  ('Rollo',       'roll'),
  ('Par',         'par'),
  ('Juego',       'jgo'),
  ('Bolsa',       'bol');

-- Categorías de productos
INSERT INTO categorias (nombre, descripcion) VALUES
  ('Herramientas Manuales',    'Martillos, destornilladores, llaves, alicates y herramientas de mano'),
  ('Herramientas Eléctricas',  'Taladros, amoladoras, sierras eléctricas y herramientas a batería'),
  ('Pinturas y Acabados',      'Pinturas, barnices, selladores, brochas y rodillos'),
  ('Plomería',                 'Tubos PVC, pegamentos, llaves de agua, codos y accesorios de agua'),
  ('Electricidad',             'Cables, interruptores, tomacorrientes, focos y accesorios eléctricos'),
  ('Materiales de Construcción','Cemento, arena, yeso, ladrillos y materiales de obra'),
  ('Seguridad',                'Cascos, guantes, lentes de protección y equipos de seguridad'),
  ('Fijaciones y Tornillería', 'Tornillos, clavos, pernos, tuercas, anclajes y tacos');

-- Usuario administrador por defecto
-- Contraseña: Admin123! (hash bcrypt generado externamente al correr el seeder de Node.js)
-- IMPORTANTE: cambiar la contraseña en el primer inicio de sesión
INSERT INTO usuarios (rol_id, nombre, apellidos, email, password, telefono, activo) VALUES
  (1, 'Admin', 'Sistema', 'admin@ferrestock.com',
   '$2b$10$placeholder_hash_cambiar_con_seeder_nodejs', '999000001', 1);

-- Proveedor de ejemplo
INSERT INTO proveedores (razon_social, ruc, telefono, email, direccion, nombre_contacto) VALUES
  ('Distribuidora Ferretera SAC',  '20601234567', '066-312000', 'ventas@distferretera.com',
   'Av. Mariscal Cáceres 450, Ayacucho', 'Juan Quispe'),
  ('Importaciones Metálicas EIRL', '20609876543', '066-315500', 'pedidos@importmetal.com',
   'Jr. Lima 230, Ayacucho', 'María Condori');

-- Productos de ejemplo con su inventario inicial
INSERT INTO productos (categoria_id, unidad_medida_id, proveedor_id, codigo, nombre, descripcion, precio_compra, precio_venta, stock_minimo) VALUES
  (1, 1, 1, 'HERR-0001', 'Martillo carpintero 16oz',   'Martillo de acero con mango de madera, 16 onzas',     18.00,  28.00, 5),
  (1, 1, 1, 'HERR-0002', 'Destornillador estrella 6"', 'Destornillador Phillips punta estrella, mango plástico', 5.50,   9.00, 10),
  (1, 1, 1, 'HERR-0003', 'Llave francesa 10"',         'Llave ajustable cromada de 10 pulgadas',               12.00,  20.00, 5),
  (2, 1, 1, 'ELEC-0001', 'Taladro percutor 650W',      'Taladro eléctrico con percusión, 650W, 220V',         120.00, 190.00, 2),
  (3, 1, 2, 'PINT-0001', 'Pintura látex blanco 1gl',   'Pintura látex interior/exterior, rendimiento 35m2/gl', 28.00,  45.00, 8),
  (3, 1, 2, 'PINT-0002', 'Brocha 3 pulgadas',          'Brocha de cerdas naturales, 3 pulgadas',                4.00,   7.50, 15),
  (4, 2, 1, 'PLOM-0001', 'Tubo PVC 3/4" x 5m',        'Tubo PVC presión 3/4 pulgada, longitud 5 metros',      8.50,  14.00, 10),
  (5, 1, 2, 'ELCT-0001', 'Foco LED 9W',                'Foco LED 9W, base E27, luz blanca 6500K',              5.00,   9.00, 20),
  (8, 1, 1, 'TORN-0001', 'Caja tornillos autorroscantes 3x1"', 'Caja 100 unidades tornillos autorroscantes', 6.00,  10.50, 10),
  (7, 1, 2, 'SEGR-0001', 'Casco de seguridad blanco',  'Casco protector ANSI Z89.1, ajuste tipo matraca',     15.00,  26.00, 5);

-- Stock inicial para los productos de ejemplo
INSERT INTO inventario (producto_id, stock_actual) VALUES
  (1, 20),  -- Martillo: 20 unidades
  (2, 35),  -- Destornillador: 35 unidades
  (3, 15),  -- Llave francesa: 15 unidades
  (4, 8),   -- Taladro: 8 unidades
  (5, 25),  -- Pintura: 25 galones
  (6, 40),  -- Brocha: 40 unidades
  (7, 30),  -- Tubo PVC: 30 unidades
  (8, 60),  -- Foco LED: 60 unidades
  (9, 18),  -- Tornillos: 18 cajas
  (10, 10); -- Casco: 10 unidades

-- Movimientos iniciales de entrada (carga inicial de inventario)
INSERT INTO movimientos_inventario (producto_id, usuario_id, tipo, cantidad, stock_antes, stock_despues, motivo) VALUES
  (1,  1, 'ENTRADA', 20, 0, 20,  'Carga inicial de inventario'),
  (2,  1, 'ENTRADA', 35, 0, 35,  'Carga inicial de inventario'),
  (3,  1, 'ENTRADA', 15, 0, 15,  'Carga inicial de inventario'),
  (4,  1, 'ENTRADA',  8, 0,  8,  'Carga inicial de inventario'),
  (5,  1, 'ENTRADA', 25, 0, 25,  'Carga inicial de inventario'),
  (6,  1, 'ENTRADA', 40, 0, 40,  'Carga inicial de inventario'),
  (7,  1, 'ENTRADA', 30, 0, 30,  'Carga inicial de inventario'),
  (8,  1, 'ENTRADA', 60, 0, 60,  'Carga inicial de inventario'),
  (9,  1, 'ENTRADA', 18, 0, 18,  'Carga inicial de inventario'),
  (10, 1, 'ENTRADA', 10, 0, 10,  'Carga inicial de inventario');

-- ============================================================
-- VISTAS ÚTILES PARA REPORTES
-- ============================================================

-- Vista: stock actual con datos del producto y alerta de reposición
CREATE OR REPLACE VIEW v_stock_actual AS
SELECT
  p.id              AS producto_id,
  p.codigo,
  p.nombre          AS producto,
  c.nombre          AS categoria,
  um.abreviatura    AS unidad,
  i.stock_actual,
  p.stock_minimo,
  p.precio_compra,
  p.precio_venta,
  ROUND(i.stock_actual * p.precio_compra, 2) AS valor_inventario,
  CASE
    WHEN i.stock_actual = 0              THEN 'SIN_STOCK'
    WHEN i.stock_actual <= p.stock_minimo THEN 'CRITICO'
    ELSE                                      'NORMAL'
  END AS estado_stock,
  prov.razon_social AS proveedor,
  prov.telefono     AS telefono_proveedor
FROM productos p
INNER JOIN inventario       i    ON i.producto_id      = p.id
INNER JOIN categorias       c    ON c.id               = p.categoria_id
INNER JOIN unidades_medida  um   ON um.id              = p.unidad_medida_id
LEFT  JOIN proveedores      prov ON prov.id            = p.proveedor_id
WHERE p.deleted_at IS NULL
ORDER BY estado_stock ASC, p.nombre ASC;

-- Vista: resumen de ventas del día
CREATE OR REPLACE VIEW v_ventas_hoy AS
SELECT
  COUNT(*)                          AS total_transacciones,
  COALESCE(SUM(v.total), 0)         AS monto_total,
  COALESCE(AVG(v.total), 0)         AS promedio_venta,
  SUM(CASE WHEN v.metodo_pago = 'EFECTIVO'      THEN v.total ELSE 0 END) AS total_efectivo,
  SUM(CASE WHEN v.metodo_pago = 'YAPE'          THEN v.total ELSE 0 END) AS total_yape,
  SUM(CASE WHEN v.metodo_pago = 'PLIN'          THEN v.total ELSE 0 END) AS total_plin,
  SUM(CASE WHEN v.metodo_pago = 'TRANSFERENCIA' THEN v.total ELSE 0 END) AS total_transferencia
FROM ventas v
WHERE DATE(v.fecha_venta) = CURDATE()
  AND v.estado = 'COMPLETADA'
  AND v.deleted_at IS NULL;

-- Vista: productos más vendidos (mes actual)
CREATE OR REPLACE VIEW v_productos_mas_vendidos_mes AS
SELECT
  p.id              AS producto_id,
  p.codigo,
  p.nombre          AS producto,
  c.nombre          AS categoria,
  SUM(dv.cantidad)                       AS unidades_vendidas,
  SUM(dv.subtotal)                       AS ingreso_generado,
  COUNT(DISTINCT dv.venta_id)            AS numero_ventas
FROM detalle_ventas dv
INNER JOIN ventas    v  ON v.id  = dv.venta_id  AND v.deleted_at IS NULL AND v.estado = 'COMPLETADA'
INNER JOIN productos p  ON p.id  = dv.producto_id
INNER JOIN categorias c ON c.id  = p.categoria_id
WHERE MONTH(v.fecha_venta) = MONTH(CURDATE())
  AND YEAR(v.fecha_venta)  = YEAR(CURDATE())
GROUP BY p.id, p.codigo, p.nombre, c.nombre
ORDER BY unidades_vendidas DESC;

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
SELECT
  TABLE_NAME        AS 'Tabla',
  TABLE_ROWS        AS 'Filas aprox.',
  TABLE_COMMENT     AS 'Descripción'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'ferrestock_pro'
ORDER BY TABLE_NAME;

-- ============================================================
-- FIN DEL SCHEMA — ferrestock_pro
-- ============================================================
