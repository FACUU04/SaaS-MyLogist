package com.Control.Inventario.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ProductoRequest {

    private String marca;
    private String descripcion;

    @JsonProperty("codigo_fabricante")
    private String codigoFabricante;
    private Double precio;

    @JsonProperty("cantidad_stock")
    private Double cantidadStock;

    @JsonProperty("unidad_medida")
    private String unidad;

    @JsonProperty("categoria_id")
    private Long categoriaId;

    public String getMarca() { return marca; }
    public String getDescripcion() { return descripcion; }
    public String getCodigoFabricante() { return codigoFabricante; }
    public Double getPrecio() { return precio; }
    public Double getCantidadStock() { return cantidadStock; }
    public String getUnidad() { return unidad; }
    public Long getCategoriaId() { return categoriaId; }

    public void setMarca(String marca) { this.marca = marca; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public void setCodigoFabricante(String codigoFabricante) { this.codigoFabricante = codigoFabricante; }
    public void setPrecio(Double precio) { this.precio = precio; }
    public void setCantidadStock(Double cantidadStock) { this.cantidadStock = cantidadStock; }
    public void setUnidad(String unidad) { this.unidad = unidad; }
    public void setCategoriaId(Long categoriaId) { this.categoriaId = categoriaId; }
}
