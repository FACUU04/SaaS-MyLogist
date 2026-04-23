package com.Control.Inventario.controller;

import com.Control.Inventario.entity.Role;
import com.Control.Inventario.entity.User;
import com.Control.Inventario.repository.RoleRepository;
import com.Control.Inventario.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/usuarios")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SUPERADMIN')")
public class AdminUsuarioController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    // LISTAR usuarios del negocio
    @GetMapping
    public List<User> listar(Authentication auth) {
        User admin = userRepository.findByUsername(auth.getName())
                .orElseThrow();

        return userRepository.findByNegocioId(
                admin.getNegocio().getId()
        );
    }

    // CAMBIAR ROL
    @PutMapping("/{id}/rol")
    public User cambiarRol(
            @PathVariable Long id,
            @RequestParam String rol,
            Authentication auth
    ) {
        User admin = userRepository.findByUsername(auth.getName())
                .orElseThrow();

        User user = userRepository.findById(id)
                .orElseThrow();

        if (!user.getNegocio().getId().equals(admin.getNegocio().getId())) {
            throw new RuntimeException("No autorizado");
        }

        Role nuevoRol = roleRepository.findByName("ROLE_" + rol)
                .orElseThrow(() -> new RuntimeException("Rol inválido"));

        user.getRoles().clear();
        user.addRole(nuevoRol);

        return userRepository.save(user);
    }

    // BLOQUEAR / DESBLOQUEAR
    @PutMapping("/{id}/toggle")
    public String toggle(@PathVariable Long id, Authentication auth) {

        User admin = userRepository.findByUsername(auth.getName())
                .orElseThrow();

        User user = userRepository.findById(id)
                .orElseThrow();

        if (!user.getNegocio().getId().equals(admin.getNegocio().getId())) {
            throw new RuntimeException("No autorizado");
        }

        user.setLocked(!user.isLocked());
        userRepository.save(user);

        return user.isLocked()
                ? "Usuario bloqueado"
                : "Usuario desbloqueado";
    }

    // RESET PASSWORD
    @PutMapping("/{id}/reset-password")
    public String resetPassword(
            @PathVariable Long id,
            @RequestParam String newPassword,
            Authentication auth
    ) {
        User admin = userRepository.findByUsername(auth.getName())
                .orElseThrow();

        User user = userRepository.findById(id)
                .orElseThrow();

        if (!user.getNegocio().getId().equals(admin.getNegocio().getId())) {
            throw new RuntimeException("No autorizado");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return "Contraseña reseteada";
    }
}
