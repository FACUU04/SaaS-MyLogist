package com.Control.Inventario.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Entity
@Table(name = "ventas")
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Nro_venta")
    private int nroVenta;

    @Column(name = "Fecha")
    private LocalDate fecha;

    @Column(name = "Importe")
    private BigDecimal importe;

    @Column(name = "id_cliente", nullable = true)
    private Integer idCliente;

    @Column(name = "negocio_id", nullable = false)
    private Long negocioId;

  
    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pago")
    private MetodoPago metodoPago;

    @ManyToOne
    @JoinColumn(name = "turno_id")
    private TurnoCaja turno;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL)
    private List<DetalleVenta> detalleVentas;

    @PrePersist
    public void asignarFecha() {
        this.fecha = LocalDate.now();
    }

    public int getId() {
        return this.nroVenta;
    }

    public List<DetalleVenta> getDetalles() {
        return this.detalleVentas;
    }
}