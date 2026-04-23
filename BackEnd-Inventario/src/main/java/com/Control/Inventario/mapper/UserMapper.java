package com.Control.Inventario.mapper;

import com.Control.Inventario.dto.UserResponse;
import com.Control.Inventario.entity.User;

import java.util.stream.Collectors;

public class UserMapper {

    private UserMapper() {}

    public static UserResponse toDto(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .enabled(user.isEnabled())
                .locked(user.isLocked())
                .roles(
                        user.getRoles()
                                .stream()
                                .map(role -> role.getName())
                                .collect(Collectors.toSet())
                )
                .negocioId(
                        user.getNegocio() != null
                                ? user.getNegocio().getId()
                                : null
                )
                .build();
    }
}

