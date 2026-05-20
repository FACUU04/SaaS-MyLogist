package com.Control.Inventario.dto;

import java.time.LocalDate;

public record NegocioResponseDTO(
        Long id,
        String nombre,
        String contactoEmail,
        String telefono,
        boolean activo,
        String adminUsername,
        String ticketCabecera,
        String ticketPie,
        LocalDate fechaAlta,
        Integer diasPrueba,
        String estadoSuscripcion
) {}