package com.Control.Inventario.dto;

import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ErrorResponse {
    private String message;   // Mensaje de error (ej: "Usuario o contraseña incorrectos")
    private String code;      // Código interno (ej: "AUTH_INVALID_CREDENTIALS")
    private Instant timestamp; // Momento del error
    private String path;      // Endpoint donde ocurrió
}
