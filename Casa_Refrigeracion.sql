DROP SCHEMA CASA_REFRIGERACION;
CREATE SCHEMA IF NOT EXISTS CASA_REFRIGERACION;
USE CASA_REFRIGERACION;

CREATE TABLE IF NOT EXISTS NEGOCIO(
	   Nombre VARCHAR(20) NOT NULL,
       Nro_negocio VARCHAR (20) NOT NULL,
       ID INT,
	   Fundacion DATE,
       Rubro VARCHAR(20) NOT NULL,
	   Ubicacionlocal VARCHAR(20),
       Contactoemail VARCHAR(220) NOT NULL,
       CONSTRAINT CHK_Emailformato CHECK (Contactoemail LIKE '%_@_%._%'),
       Telefono INT, 
       CONSTRAINT
       CHECK_telefonoformato CHECK (LENGTH(Telefono) = 10 AND Telefono REGEXP '^[0-9]+$'),
       PRIMARY KEY (ID)
);
CREATE TABLE IF NOT EXISTS PRODUCTOS(
       ID_Producto INT PRIMARY KEY,
       Marca VARCHAR(50),
       Descripcion VARCHAR(180),
	   Categoria INT,
       CodigoFABRICANTE VARCHAR(70),
       Precio VARCHAR(8),
       CantidadSTOCK NUMERIC
);
CREATE TABLE IF NOT EXISTS CATEGORIAS(
       ID_categoria INT PRIMARY KEY,
       Nombre VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS VENTAS(
       Nro_venta INT PRIMARY KEY AUTO_INCREMENT, 
       Fecha DATE,
       Importe INT,
       IDCliente INT,
       IDPRODUCTO INT,
       Cantidad NUMERIC
);

CREATE TABLE IF NOT EXISTS PROVEEDORES(
       ID_Proveedor INT PRIMARY KEY,
       Nombre VARCHAR(70),
       Descripcion VARCHAR(230),
       Contacto VARCHAR(100),
       FechaINICIOrelacion DATE,
       ProductosSUMINISTRADOS VARCHAR(200),
       SitioWEB VARCHAR(100)
);
CREATE TABLE IF NOT EXISTS COMPRAS(
       ID_Compra INT PRIMARY KEY auto_increment,
       ID_Proveedor INT,
       ID_Producto INT,
       Cantidad NUMERIC,
	   Importe VARCHAR(15),
       FECHA DATE
);
CREATE TABLE IF NOT EXISTS EMPLEADOS(
       ID_Empleado INT PRIMARY KEY auto_increment,
       Nombre VARCHAR(30),
       Apellido VARCHAR(30),
       FechaNACIMIENTO DATE,
       FechaINGRESO DATE,
       Puesto_ocupado VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS CLIENTES(
       ID_Cliente INT PRIMARY KEY AUTO_INCREMENT,
       Nombre VARCHAR(30),
       Apellido VARCHAR(30),
       FechaNacimiento DATE, 
       DNI NUMERIC(8)
);

CREATE TABLE IF NOT EXISTS Registro_Actividad (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    FechaHora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TipoActividad ENUM('INSERT', 'UPDATE', 'DELETE'),
    TablaAfectada VARCHAR(50),
    Detalles TEXT
);


ALTER TABLE NEGOCIO
ADD CONSTRAINT fk_empleados
FOREIGN KEY (ID) REFERENCES EMPLEADOS (ID_Empleado),
ADD CONSTRAINT fk_comprasnegocio
FOREIGN KEY (ID) REFERENCES COMPRAS (ID_Compra),
ADD CONSTRAINT fk_productosnegocio
FOREIGN KEY (ID) REFERENCES PRODUCTOS (ID_Producto);

ALTER TABLE PRODUCTOS
ADD CONSTRAINT fk_categoria
FOREIGN KEY (ID_Producto) REFERENCES CATEGORIAS (ID_categoria);

ALTER TABLE VENTAS
ADD CONSTRAINT fk_ventacliente
FOREIGN KEY (IDCliente) REFERENCES CLIENTES (ID_Cliente),
ADD CONSTRAINT fk_ventaproducto
FOREIGN KEY (IDPRODUCTO) REFERENCES PRODUCTOS (ID_Producto);

ALTER TABLE COMPRAS
ADD CONSTRAINT fk_compraproveedor
FOREIGN KEY (ID_Proveedor) REFERENCES PROVEEDORES (ID_Proveedor),
ADD CONSTRAINT fk_compraproducto
FOREIGN KEY (ID_Producto) REFERENCES PRODUCTOS (ID_Producto);
 
 
 -- Esta vista muestra cuales son los productos mas vendidos junto con el importe total
CREATE VIEW VW_Productos_Mas_Vendidos AS
SELECT p.ID_Producto, p.Descripcion, SUM(v.Importe) AS Importe_Total
FROM PRODUCTOS p
JOIN VENTAS v ON p.ID_Producto = v.IDPRODUCTO
GROUP BY p.ID_Producto, p.Descripcion
ORDER BY Importe_Total DESC;

SELECT * FROM  VW_Productos_Mas_Vendidos;

-- Esta vista muestra cuales son los clientes mas frecuentes
CREATE VIEW VW_Clientes_Mas_Frecuentes AS
SELECT c.ID_Cliente, CONCAT(c.Nombre, ' ', c.Apellido) AS Nombre_Completo, COUNT(*) AS Total_Compras
FROM CLIENTES c
JOIN VENTAS v ON c.ID_Cliente = v.IDCliente
GROUP BY c.ID_Cliente, Nombre_Completo
ORDER BY Total_Compras DESC;

SELECT * FROM VW_Clientes_Mas_Frecuentes;

-- Esta vista muestra cuales son los productos con bajo STOCK
CREATE VIEW VW_Productos_Bajo_Stock AS
SELECT *
FROM PRODUCTOS
WHERE CantidadSTOCK < 10;

SELECT * FROM VW_Productos_Bajo_Stock;

-- Esta vista muestra el ingreso total generado por las ventas en el ultimo mes
CREATE VIEW VW_Ventas_Por_Mes AS
SELECT YEAR(Fecha) AS Año, MONTH(Fecha) AS Mes, SUM(Importe) AS Importe_Total_Ventas
FROM VENTAS
GROUP BY Año, Mes
ORDER BY Año DESC, Mes DESC;

SELECT * FROM VW_Ventas_Por_Mes;

 -- Esta vista mostrara las ventas realizadas en el ultimo año
CREATE VIEW VW_Ventas_Rango_Fechas AS
SELECT Fecha, SUM(Importe) AS Total_Ventas
FROM VENTAS
WHERE Fecha BETWEEN '2024-01-01' AND '2025-01-01'  -- Rango de fechas deseado
GROUP BY Fecha;

SELECT * FROM VW_Ventas_Rango_Fechas;


CREATE USER 'JulianGutierrez'@'localhost' IDENTIFIED BY 'JG2022';
GRANT SELECT, INSERT, UPDATE, DELETE ON CASA_REFRIGERACION.PRODUCTOS TO 'lectura_escritura'@'localhost';


CREATE USER 'Leon'@'localhost' IDENTIFIED BY '1994Alvarez';
GRANT PRIVILEGES ON CASA_REFRIGERACION.CLIENTES TO 'control_clientes'@'localhost';


CREATE USER 'Facundo'@'localhost' IDENTIFIED BY 'FalcarREFRIGERACION';
GRANT  PRIVILEGES ON CASA_REFRIGERACION.EMPLEADOS TO 'control_compras'@'localhost';
GRANT  PRIVILEGES ON CASA_REFRIGERACION.PROVEEDORES TO 'control_compras'@'localhost';
GRANT  PRIVILEGES ON CASA_REFRIGERACION.COMPRAS TO 'control_compras'@'localhost';


CREATE USER 'Franco'@'localhost' IDENTIFIED BY 'FrancoFALCAR';
GRANT SELECT ON CASA_REFRIGERACION.VENTAS TO 'consulta_ventas_compras'@'localhost';
GRANT SELECT ON CASA_REFRIGERACION.COMPRAS TO 'consulta_ventas_compras'@'localhost';


CREATE USER 'Alvaro'@'localhost' IDENTIFIED BY 'JKL890';
GRANT SELECT, INSERT, UPDATE, DELETE ON CASA_REFRIGERACION.PROVEEDORES TO 'control_proveedores'@'localhost';
GRANT SELECT ON CASA_REFRIGERACION.CATEGORIAS TO 'control_proveedores'@'localhost';
GRANT SELECT ON CASA_REFRIGERACION.PRODUCTOS TO 'control_proveedores'@'localhost';


/*El siguiente Trigger se activara despues de cada insercion, actualizacion o eliminacion en la tabla ventas
realizando una insercion en la tabla Registro_Actividad con los cambios que se hicieron*/
DELIMITER //
CREATE TRIGGER TRG_Registro_actividad_
AFTER INSERT ON VENTAS
FOR EACH ROW
BEGIN
    INSERT INTO Registro_Actividad (TipoActividad, TablaAfectada, Detalles)
    VALUES ('INSERT', 'VENTAS', CONCAT('Nuevo registro insertado: ', ID));
END//

DELIMITER ;

/*El siguiente Trigger se activara despues de cada insercion en la tabla de ventas y compras, actualizando la cantidad de STOCK
de los productos afectados segun la cantidad vendida o comprada*/
DELIMITER //

CREATE TRIGGER TRG_Actualizacion_stock
AFTER INSERT ON VENTAS
FOR EACH ROW
BEGIN
    UPDATE PRODUCTOS
    SET CantidadSTOCK = CantidadSTOCK - NEW.Cantidad
    WHERE ID_Producto = NEW.IDPRODUCTO;
END//


DELIMITER //
CREATE TRIGGER TRG_Actualizacion_stock
AFTER INSERT ON COMPRAS
FOR EACH ROW
BEGIN
    UPDATE PRODUCTOS
    SET CantidadSTOCK = CantidadSTOCK + NEW.Cantidad
    WHERE ID_Producto = NEW.ID_Producto;
END//

DELIMITER ;

/*El siguiente Trigger se activara despues de que se realize una venta de mas de 1 millon, cuando una venta superior a ese importe
se realice, el trigger se activara y enviara un mail notificando que se acaba de realizar una venta grande */
DELIMITER //

CREATE TRIGGER TRG_Notificar_venta_grande
AFTER INSERT ON VENTAS
FOR EACH ROW
BEGIN
    IF NEW.Importe > 1000000 THEN
        -- Venta grande, enviar notificación por correo electrónico
        CALL SEND_EMAIL(IDCliente, 'ventas@falcar.com', 'Venta grande realizada', 'Se ha realizado una venta de más de $1.000.000.');
    END IF;
END//


/*La siguiente funcion calcularia el total de ventas por cliente con el importe total gastado*/
DELIMITER //
CREATE FUNCTION FN_Calcular_total_ventas_cliente(cliente_id INT) RETURNS DECIMAL(10, 2)
DETERMINISTIC
NO SQL
BEGIN
    DECLARE total DECIMAL(10, 2);
    SELECT SUM(Importe) INTO total
    FROM VENTAS
    WHERE IDCliente = cliente_id;
    RETURN total;
END//
DELIMITER ;

SELECT FN_Calcular_total_ventas_cliente (5);

DELIMITER //

CREATE FUNCTION FN_Combo_con_descuento() RETURNS DECIMAL(10, 2)
DETERMINISTIC
BEGIN
    DECLARE total DECIMAL(10, 2);
    DECLARE total_con_descuento DECIMAL(10, 2);
    DECLARE caracteristicas TEXT;
    DECLARE ids_productos VARCHAR(255);

    -- Definir los IDs de productos
    SET ids_productos = '17, 15, 20, 21, 22, 23, 10';

    -- Inicializar la variable total
    SET total = 0;

    -- Construir la consulta para obtener el precio y características de los productos
    SET @sql = CONCAT('SELECT SUM(Precio) AS Total_Precio, GROUP_CONCAT(CONCAT(ID_Producto, ": ", Descripcion) SEPARATOR "; ") AS Caracteristicas
                      FROM PRODUCTOS
                      WHERE ID_Producto IN (', ids_productos, ')');

    -- Ejecutar la consulta dinámica y obtener el resultado directamente
    SET @total_con_descuento = 0.85 * (SELECT SUM(Precio)
                                        FROM PRODUCTOS
                                        WHERE ID_Producto IN (', ids_productos, '));
    
    SET total_con_descuento = @total_con_descuento;

    -- Devolver el total con descuento
    RETURN total_con_descuento;
END //

DELIMITER ;

SELECT FN_Combo_con_descuento();

DELIMITER //

CREATE FUNCTION FN_Calcular_Total_Por_Proveedor(proveedor_id INT)
RETURNS DECIMAL(10, 2)
BEGIN
    DECLARE total DECIMAL(10, 2);

    SELECT SUM(Cantidad * Precio)
    INTO total
    FROM COMPRAS
    WHERE ID_Proveedor = proveedor_id;

    RETURN total;
END //

DELIMITER ;


/*El siguiente sp servira para actualizar el STOCK de los productos */
DELIMITER //
CREATE PROCEDURE SP_Actualizar_stock(
    IN ventas_id INT,
    IN compras_id INT
)
BEGIN

    UPDATE PRODUCTOS P
    INNER JOIN VENTAS V ON P.ID_Producto = V.IDPRODUCTO
    SET P.CantidadSTOCK = P.CantidadSTOCK - V.Cantidad
    WHERE V.Nro_venta = ventas_id;
    

    UPDATE PRODUCTOS P
    INNER JOIN COMPRAS C ON P.ID_Producto = C.ID_Producto
    SET P.CantidadSTOCK = P.CantidadSTOCK + C.Cantidad
    WHERE C.ID_Compra = compras_id;
    
 
    SELECT 'Stock actualizado correctamente' AS Mensaje;
END;

/*El siguiente procedimiento calcula la cantidad total de ventas por mes*/
DELIMITER //
CREATE PROCEDURE SP_Calcular_total_ventas_por_mes()
BEGIN
    -- Consulta para calcular el total de ventas por mes
    SELECT YEAR(Fecha) AS Año, MONTH(Fecha) AS Mes, SUM(Importe) AS Total_Ventas
    FROM VENTAS
    GROUP BY Año, Mes;
END;












