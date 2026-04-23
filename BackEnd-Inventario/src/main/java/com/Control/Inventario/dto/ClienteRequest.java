package com.Control.Inventario.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ClienteRequest {

    private String nombre;
    private String apellido;
    private LocalDate fechaNacimiento;
    private String dni;
    private String telefono;
    private String correo;
}
