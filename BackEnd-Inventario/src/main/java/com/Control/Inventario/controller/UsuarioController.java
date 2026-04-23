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

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final NegocioRepository negocioRepository;
    private final PasswordEncoder encoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> listarUsuarios() {
        return userRepository.findAll();
    }

    @PostMapping("/crear")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> crearUsuario(@RequestBody LoginRequest req,
                                          @RequestParam String roleName,
                                          @RequestParam Long negocioId) {   // ← CORREGIDO
        Negocio negocio = negocioRepository.findById(negocioId)
                .orElseThrow(() -> new RuntimeException("Negocio no encontrado"));

        User user = new User();
        user.setUsername(req.getUsername());
        user.setPasswordHash(encoder.encode(req.getPassword()));
        user.setEnabled(true);
        user.setLocked(false);
        user.setNegocio(negocio);

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        user.getRoles().add(role);

        userRepository.save(user);

        return ResponseEntity.ok("Usuario creado correctamente en el negocio " + negocio.getNombre());
    }

    @PutMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> asignarRol(@PathVariable Long id, @RequestParam String roleName) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        user.getRoles().add(role);
        userRepository.save(user);

        return ResponseEntity.ok("Rol " + roleName + " asignado al usuario " + user.getUsername());
    }
}

