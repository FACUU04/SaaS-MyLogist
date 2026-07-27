package com.Control.Inventario.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "configuracion_reportes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfiguracionReporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_configuracion")
    private Long id;

    // Relación 1 a 1: Cada negocio tiene su propia configuración de reportes
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "negocio_id", nullable = false, unique = true)
    private Negocio negocio;

    @Enumerated(EnumType.STRING)
    @Column(name = "frecuencia", nullable = false)
    private FrecuenciaReporte frecuencia;

    // Guardaremos los correos separados por coma (ej: "dueño@mail.com,socio@mail.com")
    @Column(name = "emails_destino", nullable = false, length = 255)
    private String emailsDestino;

    // Fundamental para saber cuándo fue la última vez que le mandamos el reporte y calcular el próximo
    @Column(name = "fecha_ultimo_envio")
    private LocalDate fechaUltimoEnvio;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private boolean activo = true;
}
