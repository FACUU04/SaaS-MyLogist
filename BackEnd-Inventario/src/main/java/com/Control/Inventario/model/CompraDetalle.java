package com.Control.Inventario.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "COMPRA_DETALLE")
@Data
public class CompraDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Detalle")
    private Long id;

    @Column(name = "ID_Compra", nullable = false)
    private Long idCompra;

    @Column(name = "ID_Producto", nullable = false)
    private Long idProducto;

    @Column(name = "Cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "Importe", nullable = false)
    private BigDecimal importe;
}
