package com.Control.Inventario.dto;

import java.math.BigDecimal;
import java.util.List;

public class VentaDTO {

    private Long idCliente;
    private List<DetalleVentaDTO> detalles;

    public Long getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Long idCliente) {
        this.idCliente = idCliente;
    }

    public List<DetalleVentaDTO> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetalleVentaDTO> detalles) {
        this.detalles = detalles;
    }
}

