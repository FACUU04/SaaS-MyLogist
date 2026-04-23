package com.Control.Inventario.dto;

import com.Control.Inventario.entity.UnidadMedida;

import java.math.BigDecimal;

public class DetalleVentaRequestDTO {

    private Long productoId;
    private BigDecimal cantidad;

    public Long getProductoId() {
        return productoId;
    }

    public BigDecimal getCantidad() {
        return cantidad;
    }

    private UnidadMedida unidadMedida;

    public UnidadMedida getUnidadMedida() {
        return unidadMedida;
    }
}



