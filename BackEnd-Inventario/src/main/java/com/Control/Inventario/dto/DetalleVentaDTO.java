package com.Control.Inventario.dto;

import java.math.BigDecimal;

public class DetalleVentaDTO {

    private Long productoId;
    private BigDecimal cantidad;

    public Long getProductoId() {
        return productoId;
    }

    public void setProductoId(Long productoId) {
        this.productoId = productoId;
    }

    public BigDecimal getCantidad() {
        return cantidad;
    }

    public void setCantidad(BigDecimal cantidad) {
        this.cantidad = cantidad;
    }
}


