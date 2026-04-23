CREATE DATABASE IF NOT EXISTS MyLogist;
USE MyLogist;

select * from negocio;

-- =========================
-- NEGOCIO
-- =========================
CREATE TABLE negocio (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    nro_negocio VARCHAR(20),
    fundacion DATE,
    rubro VARCHAR(50),
    ubicacion_local VARCHAR(100),
    contacto_email VARCHAR(220),
    telefono VARCHAR(20),
    umbral_stock INT,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    CONSTRAINT chk_negocio_email CHECK (contacto_email LIKE '%@%.%')
) ENGINE=InnoDB;

-- =========================
-- EMPLEADOS
-- =========================
CREATE TABLE empleados (
    id_empleado BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30),
    apellido VARCHAR(30),
    fecha_nacimiento DATE,
    fecha_ingreso DATE,
    puesto_ocupado VARCHAR(30),
    contacto_email VARCHAR(100),
    telefono VARCHAR(20),
    negocio_id BIGINT NOT NULL,
    CONSTRAINT fk_empleado_negocio
        FOREIGN KEY (negocio_id) REFERENCES negocio(id)
) ENGINE=InnoDB;

-- =========================
-- CLIENTES
-- =========================
CREATE TABLE clientes (
    id_cliente BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30),
    apellido VARCHAR(30),
    fecha_nacimiento DATE,
    dni VARCHAR(10),
    telefono VARCHAR(50),
    correo VARCHAR(100),
    negocio_id BIGINT NOT NULL,
    CONSTRAINT fk_cliente_negocio
        FOREIGN KEY (negocio_id) REFERENCES negocio(id)
) ENGINE=InnoDB;

-- =========================
-- CATEGORIAS
-- =========================
CREATE TABLE categorias (
    id_categoria BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

-- =========================
-- PRODUCTOS
-- =========================
CREATE TABLE productos (
    id_producto BIGINT AUTO_INCREMENT PRIMARY KEY,
    marca VARCHAR(50),
    descripcion VARCHAR(180),
    categoria_id BIGINT,
    codigo_fabricante VARCHAR(70),
    precio DECIMAL(10,2),
    cantidad_stock DECIMAL(10,3),
    negocio_id BIGINT NOT NULL,
    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (categoria_id) REFERENCES categorias(id_categoria),
    CONSTRAINT fk_producto_negocio
        FOREIGN KEY (negocio_id) REFERENCES negocio(id)
) ENGINE=InnoDB;

USE MyLogist;
ALTER TABLE productos
ADD COLUMN unidad_medida VARCHAR(50) NOT NULL DEFAULT 'UN';


-- =========================
-- PROVEEDORES
-- =========================
CREATE TABLE proveedores (
    id_proveedor BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion VARCHAR(255),
    contacto VARCHAR(100),
    fecha_inicio_relacion DATE,
    productos_suministrados VARCHAR(255),
    sitio_web VARCHAR(100),
    estado VARCHAR(15) DEFAULT 'Activo',
    email VARCHAR(100),
    telefono VARCHAR(30),
    direccion VARCHAR(150),
    fecha_ultima_compra DATE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- COMPRAS
-- =========================
CREATE TABLE compras (
    id_compra BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_proveedor BIGINT NOT NULL,
    fecha DATE NOT NULL,
    metodo_pago VARCHAR(50),
    observaciones TEXT,
    estado VARCHAR(20) DEFAULT 'Activo',
    usuario_registro VARCHAR(50),
    fecha_modificacion DATETIME,
    negocio_id BIGINT NOT NULL,
    CONSTRAINT fk_compra_proveedor
        FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor),
    CONSTRAINT fk_compra_negocio
        FOREIGN KEY (negocio_id) REFERENCES negocio(id)
) ENGINE=InnoDB;

-- =========================
-- DETALLE COMPRA
-- =========================
CREATE TABLE compra_detalle (
    id_detalle BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_compra BIGINT NOT NULL,
    id_producto BIGINT NOT NULL,
    cantidad DECIMAL(10,3) NOT NULL,
    importe DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_detalle_compra
        FOREIGN KEY (id_compra) REFERENCES compras(id_compra),
    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
) ENGINE=InnoDB;

-- =========================
-- VENTAS
-- =========================
CREATE TABLE ventas (
    nro_venta BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE,
    importe DECIMAL(10,2),
    id_cliente BIGINT,
    negocio_id BIGINT NOT NULL,
    CONSTRAINT fk_venta_cliente
        FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    CONSTRAINT fk_venta_negocio
        FOREIGN KEY (negocio_id) REFERENCES negocio(id)
) ENGINE=InnoDB;

-- =========================
-- DETALLE VENTA
-- =========================
CREATE TABLE detalle_venta (
    id_detalle BIGINT AUTO_INCREMENT PRIMARY KEY,
    nro_venta BIGINT NOT NULL,
    id_producto BIGINT NOT NULL,
    cantidad DECIMAL(10,3) NOT NULL,
    importe DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_detalle_venta
        FOREIGN KEY (nro_venta) REFERENCES ventas(nro_venta),
    CONSTRAINT fk_detalle_venta_producto
        FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
) ENGINE=InnoDB;

-- =========================
-- SEGURIDAD
-- =========================
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
) ENGINE=InnoDB;

INSERT INTO roles (name)
VALUES ('ROLE_USER'), ('ROLE_ADMIN'), ('ROLE_SUPERADMIN');

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    locked BOOLEAN DEFAULT FALSE,
    empleado_id BIGINT,
    negocio_id BIGINT NOT NULL,
    CONSTRAINT fk_user_empleado
        FOREIGN KEY (empleado_id) REFERENCES empleados(id_empleado),
    CONSTRAINT fk_user_negocio
        FOREIGN KEY (negocio_id) REFERENCES negocio(id)
) ENGINE=InnoDB;

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

-- =========================
-- REGISTRO ACTIVIDAD
-- =========================
CREATE TABLE registro_actividad (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_actividad ENUM('INSERT','UPDATE','DELETE'),
    tabla_afectada VARCHAR(50),
    detalles TEXT
) ENGINE=InnoDB;