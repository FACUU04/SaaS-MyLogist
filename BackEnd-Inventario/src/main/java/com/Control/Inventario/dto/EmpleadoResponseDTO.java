package com.Control.Inventario.dto;

import java.time.LocalDate;

public record EmpleadoResponseDTO(
        // Datos Personales
        Long id,
        String nombre,
        String apellido,
        String email,
        String telefono,
        String puestoOcupado,
        LocalDate fechaIngreso,

        // Credenciales y Seguridad
        String username,
        boolean enabled,
        boolean permisoVentas,
        boolean permisoInventario,
        boolean permisoProveedores
) {}
