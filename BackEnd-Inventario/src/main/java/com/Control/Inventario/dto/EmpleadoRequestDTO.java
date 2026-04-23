package com.Control.Inventario.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record EmpleadoRequestDTO(
        // Datos Personales
        @NotBlank(message = "El nombre es obligatorio") String nombre,
        @NotBlank(message = "El apellido es obligatorio") String apellido,
        LocalDate fechaNacimiento,
        LocalDate fechaIngreso,
        String puestoOcupado,
        String email,
        String telefono,

        // Credenciales y Seguridad 
        @NotBlank(message = "El usuario es obligatorio") String username,
        @NotBlank(message = "La contraseña es obligatoria") String password,
        boolean permisoVentas,
        boolean permisoInventario,
        boolean permisoProveedores
) {}

