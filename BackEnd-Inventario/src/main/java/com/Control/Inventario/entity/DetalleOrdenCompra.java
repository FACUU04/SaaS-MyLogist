package com.Control.Inventario.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Data
@Entity
@Table(name = "detalles_orden_compra")
public class DetalleOrdenCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle")
    private Long id;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne
    @JoinColumn(name = "orden_id", nullable = false)
    @JsonIgnore
    private OrdenCompra ordenCompra;

    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(name = "cantidad", nullable = false)
    private Double cantidad;

    // El precio exacto al que compraste este producto hoy
    @Column(name = "precio_unitario", nullable = false)
    private Double precioUnitario;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    public Double getSubtotal() {
        return this.cantidad * this.precioUnitario;
    }
}
