package com.Control.Inventario.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimientos_inventario")
public class MovimientoInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_movimiento")
    private Long id;

    // Relacionamos el movimiento con el producto exacto
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    // Relacionamos con el negocio para aislar los datos por cliente
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "negocio_id", nullable = false)
    @JsonIgnore
    private Negocio negocio;

    // La cantidad: será POSITIVA (ej: 5.0) para ingresos y NEGATIVA (ej: -2.0) para salidas
    @Column(name = "cantidad", nullable = false)
    private Double cantidad;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_movimiento", nullable = false)
    private TipoMovimiento tipoMovimiento;

    // Fecha exacta, fundamental para filtrar los reportes semanales/mensuales
    @Column(name = "fecha_movimiento", nullable = false, updatable = false)
    private LocalDateTime fechaMovimiento;

    // Motivo del movimiento (Ej: "Venta ticket #1024", "Se rompió el envase")
    @Column(name = "descripcion", length = 255)
    private String descripcion;

    // Guardamos qué usuario hizo la acción (usamos el username para simplificar)
    @Column(name = "usuario_responsable", nullable = false)
    private String usuarioResponsable;

    public MovimientoInventario() {}

    public MovimientoInventario(Producto producto, Negocio negocio, Double cantidad,
                                TipoMovimiento tipoMovimiento, String descripcion, String usuarioResponsable) {
        this.producto = producto;
        this.negocio = negocio;
        this.cantidad = cantidad;
        this.tipoMovimiento = tipoMovimiento;
        this.descripcion = descripcion;
        this.usuarioResponsable = usuarioResponsable;
    }

    // Hibernate ejecuta esto automáticamente justo antes de hacer el INSERT en la BD
    @PrePersist
    protected void onCreate() {
        this.fechaMovimiento = LocalDateTime.now();
    }

    // Getters y Setters
    public Long getId() { return id; }
    public Producto getProducto() { return producto; }
    public Negocio getNegocio() { return negocio; }
    public Double getCantidad() { return cantidad; }
    public TipoMovimiento getTipoMovimiento() { return tipoMovimiento; }
    public LocalDateTime getFechaMovimiento() { return fechaMovimiento; }
    public String getDescripcion() { return descripcion; }
    public String getUsuarioResponsable() { return usuarioResponsable; }

    public void setId(Long id) { this.id = id; }
    public void setProducto(Producto producto) { this.producto = producto; }
    public void setNegocio(Negocio negocio) { this.negocio = negocio; }
    public void setCantidad(Double cantidad) { this.cantidad = cantidad; }
    public void setTipoMovimiento(TipoMovimiento tipoMovimiento) { this.tipoMovimiento = tipoMovimiento; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public void setUsuarioResponsable(String usuarioResponsable) { this.usuarioResponsable = usuarioResponsable; }
}