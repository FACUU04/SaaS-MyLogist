package com.Control.Inventario.service;

import com.Control.Inventario.dto.LoginRequest;
import com.Control.Inventario.dto.MessageResponse;
import com.Control.Inventario.dto.TokenResponse;
import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.entity.Role;
import com.Control.Inventario.entity.User;
import com.Control.Inventario.repository.RoleRepository;
import com.Control.Inventario.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username).orElse(null);
    }

    public Negocio getNegocioActual() {
        User user = getCurrentUser();
        return user != null ? user.getNegocio() : null;
    }

    public ResponseEntity<?> login(LoginRequest req) {
        if (req == null || req.getUsername() == null || req.getPassword() == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Datos de login inválidos"));
        }

        User user = userRepo.findByUsername(req.getUsername()).orElse(null);

        if (user == null || !encoder.matches(req.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Usuario o contraseña incorrectos"));
        }

        if (!user.isEnabled() || user.isLocked()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Usuario bloqueado o deshabilitado"));
        }

        String accessToken = jwt.generateAccessToken(user);
        String refreshToken = jwt.generateRefreshToken(user);

        // Retornamos el DTO con los booleanos de permisos extraídos del usuario
        return ResponseEntity.ok(
                new TokenResponse(
                        accessToken,
                        refreshToken,
                        "Bearer",
                        "Login correcto",
                        user.isPermisoVentas(),
                        user.isPermisoInventario(),
                        user.isPermisoProveedores()
                )
        );
    }

    public ResponseEntity<?> refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Refresh token inválido"));
        }

        String username = jwt.extractUsername(refreshToken);
        User user = userRepo.findByUsername(username).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Usuario no encontrado"));
        }

        String newAccessToken = jwt.generateAccessToken(user);

        return ResponseEntity.ok(
                new TokenResponse(
                        newAccessToken,
                        refreshToken,
                        "Bearer",
                        "Token refrescado",
                        user.isPermisoVentas(),
                        user.isPermisoInventario(),
                        user.isPermisoProveedores()
                )
        );
    }

    public ResponseEntity<?> register(LoginRequest req, String roleName, Negocio negocio) {
        if (req == null || req.getUsername() == null || req.getPassword() == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Datos inválidos"));
        }

        if (userRepo.findByUsername(req.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new MessageResponse("El usuario ya existe"));
        }

        Role role = roleRepo.findByName(roleName).orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        User user = User.builder()
                .username(req.getUsername())
                .passwordHash(encoder.encode(req.getPassword()))
                .enabled(true)
                .locked(false)
                .negocio(negocio)
                .build();

        user.addRole(role);
        userRepo.save(user);

        return ResponseEntity.ok(new MessageResponse("Usuario creado correctamente"));
    }
}