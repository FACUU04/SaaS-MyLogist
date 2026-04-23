package com.Control.Inventario.dto;

import com.Control.Inventario.entity.MetodoPago;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class VentaRequestDTO {

    // Sin @NotNull para permitir Consumidor Final
    private Long clienteId;

    @NotEmpty(message = "La venta debe contener al menos un producto")
    private List<DetalleVentaRequestDTO> detalles;

    // ==========================================
    // NUEVO CAMPO PARA AUDITORÍA DE CAJA
    // ==========================================
    private MetodoPago metodoPago;

    public Long getClienteId() {
        return clienteId;
    }

    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }

    public List<DetalleVentaRequestDTO> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetalleVentaRequestDTO> detalles) {
        this.detalles = detalles;
    }

    public MetodoPago getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(MetodoPago metodoPago) {
        this.metodoPago = metodoPago;
    }
}