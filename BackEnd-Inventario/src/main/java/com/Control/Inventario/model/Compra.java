package com.Control.Inventario.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "COMPRAS")
@Data
public class Compra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Compra")
    private Long id;

    // 👇 ESTO ES LO QUE FALTABA PARA QUE COMPILE Y GUARDE EN MYSQL 👇
    @Column(name = "negocio_id", nullable = false)
    private Long negocioId;

    @Column(name = "ID_Proveedor", nullable = false)
    private Long idProveedor;

    @Column(name = "Fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "Metodo_Pago")
    private String metodoPago;

    @Column(name = "Observaciones")
    private String observaciones;

    @Column(name = "Estado")
    private String estado;

    @Column(name = "Usuario_Registro")
    private String usuarioRegistro;

    @Column(name = "Fecha_Modificacion")
    private LocalDateTime fechaModificacion;
}