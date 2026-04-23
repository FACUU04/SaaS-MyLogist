package com.Control.Inventario.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.Set;

@Builder
@Getter
public class UserResponse {
    private Long id;
    private String username;
    private boolean enabled;
    private boolean locked;
    private Set<String> roles;
    private Long negocioId;
}
