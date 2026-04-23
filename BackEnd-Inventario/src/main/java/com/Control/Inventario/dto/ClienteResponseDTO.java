package com.Control.Inventario.dto;

import lombok.Builder;
import java.time.LocalDate;

@Builder
public record ClienteResponseDTO(
        Long id,
        String nombre,
        String apellido,
        LocalDate fechaNacimiento,
        String dni,
        String telefono,
        String correo,
        Boolean activo
) {
}
