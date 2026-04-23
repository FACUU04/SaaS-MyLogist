package com.Control.Inventario.entity;

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

    @Column(name = "precio")
    private Double precio;

    @Column(name = "cantidad_stock")
    private Double cantidadStock;

    @Column(name = "unidad_medida")
    private String unidad;
    
    @Column(name = "activo", columnDefinition = "boolean default true")
    private Boolean activo = true;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "negocio_id", nullable = false)
    private Negocio negocio;

    public Producto() {}

    public Producto(Long id, String marca, String descripcion, String codigoFabricante,
                    Double precio, Double cantidadStock, String unidad, Boolean activo,
                    Categoria categoria, Negocio negocio) {
        this.id = id;
        this.marca = marca;
        this.descripcion = descripcion;
        this.codigoFabricante = codigoFabricante;
        this.precio = precio;
        this.cantidadStock = cantidadStock;
        this.unidad = unidad;
        this.activo = activo;
        this.categoria = categoria;
        this.negocio = negocio;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public String getMarca() { return marca; }
    public String getDescripcion() { return descripcion; }
    public String getCodigoFabricante() { return codigoFabricante; }
    public Double getPrecio() { return precio; }
    public Double getCantidadStock() { return cantidadStock; }
    public String getUnidad() { return unidad; }
    public Boolean getActivo() { return activo; } // Getter
    public Categoria getCategoria() { return categoria; }
    public Negocio getNegocio() { return negocio; }

    public void setId(Long id) { this.id = id; }
    public void setMarca(String marca) { this.marca = marca; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public void setCodigoFabricante(String codigoFabricante) { this.codigoFabricante = codigoFabricante; }
    public void setPrecio(Double precio) { this.precio = precio; }
    public void setCantidadStock(Double cantidadStock) { this.cantidadStock = cantidadStock; }
    public void setUnidad(String unidad) { this.unidad = unidad; }
    public void setActivo(Boolean activo) { this.activo = activo; } // Setter
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }
    public void setNegocio(Negocio negocio) { this.negocio = negocio; }
}