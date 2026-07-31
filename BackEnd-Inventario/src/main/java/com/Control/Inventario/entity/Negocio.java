package com.Control.Inventario.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "negocio")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Negocio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50)
    private String nombre;

    @Column(name = "nro_negocio", length = 20)
    private String nroNegocio;

    // --- DATOS DE SUSCRIPCIÓN SAAS ---
    @Column(name = "fecha_alta")
    private LocalDate fechaAlta;

    @Column(name = "dias_prueba")
    @Builder.Default
    private Integer diasPrueba = 30;

    @Column(name = "estado_suscripcion", length = 20)
    @Builder.Default
    private String estadoSuscripcion = "PRUEBA";

    // --- DATOS COMERCIALES ---
    private LocalDate fundacion; // ¡Acá está el campo que faltaba!

    @Column(length = 50)
    private String rubro;

    @Column(name = "ubicacion_local", length = 100)
    private String ubicacionLocal;

    @Column(name = "contacto_email", length = 220)
    private String contactoEmail;

    @Column(length = 20)
    private String telefono;

    @Column(name = "umbral_stock")
    private Integer umbralStock;

    @Column(name = "ticket_cabecera")
    private String ticketCabecera;

    @Column(name = "ticket_pie")
    private String ticketPie;


    // --- NUEVOS CAMPOS DE CONFIGURACIÓN IA ---
    @Column(name = "reporte_ia_activo")
    @Builder.Default
    private Boolean reporteIaActivo = false;

    @Column(name = "reporte_ia_frecuencia", length = 20)
    @Builder.Default
    private String reporteIaFrecuencia = "SEMANAL";

    @Column(name = "reporte_ia_canal", length = 20)
    @Builder.Default
    private String reporteIaCanal = "EMAIL";

    @Column(name = "reporte_ia_destino", length = 100)
    private String reporteIaDestino;

    @Column(nullable = false)
    @Builder.Default
    private boolean activo = true;

    @OneToMany(mappedBy = "negocio", fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private Set<User> usuarios = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        if (this.fechaAlta == null) {
            this.fechaAlta = LocalDate.now();
        }
    }
}