package com.Control.Inventario.dto;

import lombok.Data;

@Data
public class ProductoFacturaDTO {
    private String descripcion;
    private Double cantidad;
    private Double precioCosto;  // Lo que leyó la IA de la factura
    private Double precioVenta;  // Para autocompletar o pedir al usuario

    // Campos lógicos para el Frontend
    private Long idProductoExistente;
    private Boolean esNuevo;
}