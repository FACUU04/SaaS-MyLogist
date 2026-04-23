package com.Control.Inventario.dto;

public record NegocioResponseDTO(
        Long id,
        String nombre,
        String contactoEmail,
        String telefono,
        boolean activo,
        String adminUsername,
        String ticketCabecera,
        String ticketPie
) {}