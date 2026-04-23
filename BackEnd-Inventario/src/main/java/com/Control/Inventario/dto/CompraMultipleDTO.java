package com.Control.Inventario.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CompraMultipleDTO {

    private Long idProveedor;
    private LocalDate fecha;
    private String metodoPago;
    private String observaciones;

    private List<DetalleItem> detalles;

    @Data
    public static class DetalleItem {
        private Long idProducto;
        private Integer cantidad;
        private BigDecimal importe;
    }
}
