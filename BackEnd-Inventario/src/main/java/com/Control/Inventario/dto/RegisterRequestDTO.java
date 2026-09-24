package com.Control.Inventario.dto;

import jakarta.validation.constraints.NotBlank;

public record RegisterRequestDTO(
        @NotBlank(message = "El usuario es obligatorio") String username,
        @NotBlank(message = "El nombre del negocio es obligatorio") String negocioName,
        @NotBlank(message = "El tipo de contacto es obligatorio") String contactType, // "email" o "phone"
        @NotBlank(message = "El valor de contacto es obligatorio") String contactValue,
        @NotBlank(message = "La contraseña es obligatoria") String password
) {}