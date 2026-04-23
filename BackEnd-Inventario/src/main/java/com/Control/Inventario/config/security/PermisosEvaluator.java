package com.Control.Inventario.config.security;

import com.Control.Inventario.entity.User;
import com.Control.Inventario.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component("permisos")
@RequiredArgsConstructor
public class PermisosEvaluator {

    private final UserRepository userRepository;

    public boolean puedeGestionarInventario(String username) {
        return evaluar(username, User::isPermisoInventario);
    }

    public boolean puedeGestionarProveedores(String username) {
        return evaluar(username, User::isPermisoProveedores);
    }

    public boolean puedeVender(String username) {
        return evaluar(username, User::isPermisoVentas);
    }

    private boolean evaluar(String username, java.util.function.Predicate<User> validadorPermiso) {
        return userRepository.findByUsername(username)
                .map(user -> {
                    // Si es ADMIN, tiene pase libre absoluto
                    boolean esAdmin = user.getRoles().stream()
                            .anyMatch(r -> r.getName().equals("ROLE_ADMIN") || r.getName().equals("ROLE_SUPERADMIN"));

                    if (esAdmin) return true;

                    // Si no es admin, chequeamos su permiso específico
                    return validadorPermiso.test(user);
                })
                .orElse(false);
    }
}
