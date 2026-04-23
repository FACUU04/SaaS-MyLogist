package com.Control.Inventario.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TokenResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private String message;

    // Estos campos son vitales para que el Sidebar de React sepa qué ocultar
    private boolean permisoVentas;
    private boolean permisoInventario;
    private boolean permisoProveedores;
}