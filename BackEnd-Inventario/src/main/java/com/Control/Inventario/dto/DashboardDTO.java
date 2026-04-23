package com.Control.Inventario.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardDTO {

    private long totalProductos;
    private long totalClientes;
    private long totalEmpleados;
    private long ventasTotales;
    private long ventasUltimoMes;

    private List<TopProductoDTO> topProductos;
    private List<ProductoBajoStockDTO> bajoStock;
    private List<AuditoriaResumenDTO> auditoria;

    @Data @AllArgsConstructor
    public static class TopProductoDTO {
        private String nombre;
        private BigDecimal cantidad; // FIX: DetalleVenta usa BigDecimal
    }

    @Data @AllArgsConstructor
    public static class ProductoBajoStockDTO {
        private Long id;
        private String nombre;
        private String marca;
        private String descripcion;
        private Double cantidadStock; // FIX: Producto usa Double y camelCase
    }

    @Data @AllArgsConstructor
    public static class AuditoriaResumenDTO {
        private Long id;
        private LocalDateTime fechaHora;
        private String usuario;
        private String accion;
        private String entidad;
        private String entidadId; // FIX: Auditoria usa String
        private String detalles;
    }
}