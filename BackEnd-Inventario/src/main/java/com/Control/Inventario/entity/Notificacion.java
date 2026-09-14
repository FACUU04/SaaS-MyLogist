package com.Control.Inventario.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notificaciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔥 CAMBIO CLAVE: Usamos columnDefinition = "TEXT" para que soporte el reporte completo de la IA
    @Column(nullable = false, columnDefinition = "TEXT")
    private String mensaje;

    @Column(name = "nivel_alerta", nullable = false, length = 20)
    private String nivelAlerta; // INFO, WARNING, DANGER

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "negocio_id", nullable = true)
    private Negocio negocio;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_expiracion")
    private LocalDateTime fechaExpiracion;

    @Builder.Default
    private Boolean activa = true;

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
    }
}