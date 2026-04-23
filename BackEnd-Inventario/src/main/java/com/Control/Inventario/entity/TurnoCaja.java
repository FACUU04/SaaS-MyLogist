package com.Control.Inventario.entity;

import com.fasterxml.jackson.annotation.JsonIgnore; // NO TE OLVIDES DE ESTA IMPORTACIÓN
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "turnos_caja")
@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TurnoCaja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User usuario;

    @ManyToOne
    @JoinColumn(name = "negocio_id")
    @JsonIgnore
    private Negocio negocio;

    private LocalDateTime fechaApertura;
    private LocalDateTime fechaCierre;

    private Double montoAperturaFisico;
    private Double totalVentasEfectivoSistema;
    private Double totalVentasTransferenciaSistema;
    private Double montoCierreFisicoReal;

    @Enumerated(EnumType.STRING)
    private EstadoTurno estado;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}