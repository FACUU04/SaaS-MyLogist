package com.Control.Inventario.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ProductoResponseDTO {

    private Long id;
    private String marca;
    private String descripcion;

    // NUEVO: Código de barras
    @JsonProperty("codigo_barras")
    private String codigoBarras;

    private Double precio;

    @JsonProperty("cantidad_stock")
    private Double cantidadStock;

    // NUEVO: Stock mínimo
    @JsonProperty("stock_minimo")
    private Double stockMinimo;

    @JsonProperty("unidad_medida")
    private String unidad;

    // Constructor actualizado
    public ProductoResponseDTO(Long id, String marca, String descripcion, String codigoBarras,
                               Double precio, Double cantidadStock, Double stockMinimo, String unidad) {
        this.id = id;
        this.marca = marca;
        this.descripcion = descripcion;
        this.codigoBarras = codigoBarras;
        this.precio = precio;
        this.cantidadStock = cantidadStock;
        this.stockMinimo = stockMinimo;
        this.unidad = unidad;
    }

    // Getters
    public Long getId() { return id; }
    public String getMarca() { return marca; }
    public String getDescripcion() { return descripcion; }
    public String getCodigoBarras() { return codigoBarras; }
    public Double getPrecio() { return precio; }
    public Double getCantidadStock() { return cantidadStock; }
    public Double getStockMinimo() { return stockMinimo; }
    public String getUnidad() { return unidad; }
}
