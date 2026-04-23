package com.Control.Inventario.controller;

import com.Control.Inventario.dto.LoginRequest;
import com.Control.Inventario.entity.User;
import com.Control.Inventario.entity.Role;
import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.repository.UserRepository;
import com.Control.Inventario.repository.RoleRepository;
import com.Control.Inventario.repository.NegocioRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/superadmin/usuarios")
@RequiredArgsConstructor
public class SuperAdminUserController {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final NegocioRepository negocioRepo;
    private final PasswordEncoder encoder;

    @PostMapping("/crear")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> crearUsuario(@RequestBody LoginRequest req,
                                          @RequestParam String roleName,
                                          @RequestParam Long negocioId) {

        Negocio negocio = negocioRepo.findById(negocioId)
                .orElseThrow(() -> new RuntimeException("Negocio no encontrado"));

        User user = User.builder()
                .username(req.getUsername())
                .passwordHash(encoder.encode(req.getPassword()))
                .enabled(true)
                .locked(false)
                .negocio(negocio)
                .build();

        Role role = roleRepo.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        user.addRole(role);
        userRepo.save(user);

        return ResponseEntity.ok("Usuario creado en negocio: " + negocio.getNombre());
    }
}
