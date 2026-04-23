package com.Control.Inventario.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "auditorias")
public class Auditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario", nullable = false)
    private String usuario; // Acá guardaremos el username o email del empleado

    @Column(name = "accion", nullable = false)
    private String accion; // Ej: "CREACION", "ACTUALIZACION", "ELIMINACION"

    @Column(name = "entidad", nullable = false)
    private String entidad; // Ej: "Venta", "Producto"

    @Column(name = "entidad_id", nullable = false)
    private String entidadId; // El ID de la venta o producto afectado

    @Column(name = "detalles", length = 500)
    private String detalles; // Un texto extra, ej: "Venta registrada por $5000"

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @Column(name = "negocio_id", nullable = false)
    private Long negocioId; // Fundamental para que cada Admin vea solo su auditoría
}