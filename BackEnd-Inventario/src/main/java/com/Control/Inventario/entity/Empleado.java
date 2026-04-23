package com.Control.Inventario.entity;

import com.Control.Inventario.entity.Negocio;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;


@Entity
@Table(name = "empleados")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Empleado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empleado")
    private Long id;

    private String nombre;
    private String apellido;

    private LocalDate fechaNacimiento;
    private LocalDate fechaIngreso;

    private String puestoOcupado;
    private String contacto_email;
    private String telefono;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "negocio_id", nullable = false)
    private Negocio negocio;
}
