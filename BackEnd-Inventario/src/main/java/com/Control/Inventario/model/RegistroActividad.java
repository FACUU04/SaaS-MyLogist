package com.Control.Inventario.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "Registro_Actividad")
public class RegistroActividad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private int id;

    @Column(name = "FechaHora")
    private LocalDateTime fechaHora;

    @Enumerated(EnumType.STRING)
    @Column(name = "TipoActividad")
    private TipoActividad tipoActividad;

    @Column(name = "TablaAfectada")
    private String tablaAfectada;

    @Column(name = "Detalles", columnDefinition = "TEXT")
    private String detalles;

    public enum TipoActividad {
        INSERT,
        UPDATE,
        DELETE
    }
}
