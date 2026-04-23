package com.Control.Inventario.dto;

import java.time.LocalDateTime;


public record AuditoriaResponseDTO(
        Long id,
        String usuario,
        String accion,
        String entidad,
        String entidadId,
        String detalles,
        LocalDateTime fechaHora
) {
}