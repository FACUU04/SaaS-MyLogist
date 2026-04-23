package com.Control.Inventario.dto;

import java.time.LocalDateTime;

public record NotaDTO(
        Long id,
        String contenido,
        String usuario,
        LocalDateTime fechaCreacion
) {
}