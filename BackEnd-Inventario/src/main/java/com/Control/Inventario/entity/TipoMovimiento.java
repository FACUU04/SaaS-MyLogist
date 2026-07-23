package com.Control.Inventario.entity;

public enum TipoMovimiento {
    VENTA,          // Resta stock
    COMPRA,         // Suma stock (ingreso de proveedor)
    DEVOLUCION,     // Suma stock (cliente devuelve)
    MERMA,          // Resta stock (rotura, vencimiento, pérdida)
    AJUSTE_MANUAL   // Puede sumar o restar (cuando el dueño corrige el stock a mano)
}