package com.Control.Inventario.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ProductoResponseDTO {

    private Long id;
    private String marca;
    private String descripcion;
    private Double precio;

    @JsonProperty("cantidad_stock")
    private Double cantidadStock;

    @JsonProperty("unidad_medida")
    private String unidad;

    public ProductoResponseDTO(Long id, String marca, String descripcion,
                               Double precio, Double cantidadStock, String unidad) {
        this.id = id;
        this.marca = marca;
        this.descripcion = descripcion;
        this.precio = precio;
        this.cantidadStock = cantidadStock;
        this.unidad = unidad;
    }

    public Long getId() { return id; }
    public String getMarca() { return marca; }
    public String getDescripcion() { return descripcion; }
    public Double getPrecio() { return precio; }
    public Double getCantidadStock() { return cantidadStock; }
    public String getUnidad() { return unidad; }
}

