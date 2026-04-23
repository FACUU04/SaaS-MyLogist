package com.Control.Inventario.dto;

public record UserResponseDTO(
        Long id,
        String username,
        boolean enabled,
        boolean locked,
        String role
) {}
