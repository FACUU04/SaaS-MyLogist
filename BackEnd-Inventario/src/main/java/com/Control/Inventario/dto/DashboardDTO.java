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

    // Agregamos la lista para el gráfico mensual
    private List<BalanceMensualDTO> balanceMensual;

    private List<TopProductoDTO> topProductos;
    private List<ProductoBajoStockDTO> bajoStock;
    private List<AuditoriaResumenDTO> auditoria;

    // DTO Interno para el gráfico
    @Data @AllArgsConstructor @NoArgsConstructor
    public static class BalanceMensualDTO {
        private String name;
        private BigDecimal ingresos;
        private BigDecimal egresos;
    }

    @Data @AllArgsConstructor
    public static class TopProductoDTO {
        private String nombre;
        private BigDecimal cantidad;
    }

    @Data @AllArgsConstructor
    public static class ProductoBajoStockDTO {
        private Long id;
        private String nombre;
        private String marca;
        private String descripcion;
        private Double cantidadStock;
    }

    @Data @AllArgsConstructor
    public static class AuditoriaResumenDTO {
        private Long id;
        private LocalDateTime fechaHora;
        private String usuario;
        private String accion;
        private String entidad;
        private String entidadId;
        private String detalles;
    }
}