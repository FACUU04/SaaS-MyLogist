package com.Control.Inventario.dto;

import java.math.BigDecimal;

public class DetalleVentaResponseDTO {

    private Long productoId;
    private String marcaProducto;
    private String descripcionProducto;
    private BigDecimal cantidad;
    private String unidadMedida;
    private BigDecimal precioUnitario;
    private BigDecimal importe; // El subtotal de esta línea

    public DetalleVentaResponseDTO(Long productoId,
                                   String marcaProducto,
                                   String descripcionProducto,
                                   BigDecimal cantidad,
                                   String unidadMedida,
                                   BigDecimal precioUnitario,
                                   BigDecimal importe) {
        this.productoId = productoId;
        this.marcaProducto = marcaProducto;
        this.descripcionProducto = descripcionProducto;
        this.cantidad = cantidad;
        this.unidadMedida = unidadMedida;
        this.precioUnitario = precioUnitario;
        this.importe = importe;
    }

    public Long getProductoId() { return productoId; }
    public String getMarcaProducto() { return marcaProducto; }
    public String getDescripcionProducto() { return descripcionProducto; }
    public BigDecimal getCantidad() { return cantidad; }
    public String getUnidadMedida() { return unidadMedida; }
    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public BigDecimal getImporte() { return importe; }
}