package com.Control.Inventario.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Long id;

    @Column(name = "marca")
    private String marca;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "codigo_fabricante")
    private String codigoFabricante;

    // NUEVO: Código de barras para el escáner
    @Column(name = "codigo_barras", length = 100, unique = true)
    private String codigoBarras;

    @Column(name = "precio")
    private Double precio;

    @Column(name = "cantidad_stock")
    private Double cantidadStock;

    // NUEVO: Límite para las futuras alertas de IA y reportes
    @Column(name = "stock_minimo", columnDefinition = "double precision default 0")
    private Double stockMinimo = 0.0;

    @Column(name = "unidad_medida")
    private String unidad;

    @Column(name = "activo", columnDefinition = "boolean default true")
    private Boolean activo = true;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    @JsonIgnore
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "negocio_id", nullable = false)
    @JsonIgnore
    private Negocio negocio;

    public Producto() {}

    // Constructor actualizado con los nuevos campos
    public Producto(Long id, String marca, String descripcion, String codigoFabricante,
                    String codigoBarras, Double precio, Double cantidadStock, Double stockMinimo,
                    String unidad, Boolean activo, Categoria categoria, Negocio negocio) {
        this.id = id;
        this.marca = marca;
        this.descripcion = descripcion;
        this.codigoFabricante = codigoFabricante;
        this.codigoBarras = codigoBarras;
        this.precio = precio;
        this.cantidadStock = cantidadStock;
        this.stockMinimo = stockMinimo;
        this.unidad = unidad;
        this.activo = activo;
        this.categoria = categoria;
        this.negocio = negocio;
    }

    // Getters
    public Long getId() { return id; }
    public String getMarca() { return marca; }
    public String getDescripcion() { return descripcion; }
    public String getCodigoFabricante() { return codigoFabricante; }
    public String getCodigoBarras() { return codigoBarras; }
    public Double getPrecio() { return precio; }
    public Double getCantidadStock() { return cantidadStock; }
    public Double getStockMinimo() { return stockMinimo; }
    public String getUnidad() { return unidad; }
    public Boolean getActivo() { return activo; }
    public Categoria getCategoria() { return categoria; }
    public Negocio getNegocio() { return negocio; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setMarca(String marca) { this.marca = marca; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public void setCodigoFabricante(String codigoFabricante) { this.codigoFabricante = codigoFabricante; }
    public void setCodigoBarras(String codigoBarras) { this.codigoBarras = codigoBarras; }
    public void setPrecio(Double precio) { this.precio = precio; }
    public void setCantidadStock(Double cantidadStock) { this.cantidadStock = cantidadStock; }
    public void setStockMinimo(Double stockMinimo) { this.stockMinimo = stockMinimo; }
    public void setUnidad(String unidad) { this.unidad = unidad; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }
    public void setNegocio(Negocio negocio) { this.negocio = negocio; }
}