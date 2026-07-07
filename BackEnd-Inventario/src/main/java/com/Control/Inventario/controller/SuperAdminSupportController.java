package com.Control.Inventario.controller;

import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.entity.User;
import com.Control.Inventario.repository.NegocioRepository;
import com.Control.Inventario.repository.UserRepository; // Necesitarás este repo
import com.Control.Inventario.config.security.CustomUserDetailsService;
import com.Control.Inventario.service.JwtService;
import com.Control.Inventario.service.EmailService; // Necesitarás este servicio
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder; // Para cifrar la temp
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/superadmin/support")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPERADMIN')")
public class SuperAdminSupportController {

    private final NegocioRepository negocioRepository;
    private final UserRepository userRepository;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/impersonate/{negocioId}")
    public ResponseEntity<?> iniciarSesionComoCliente(@PathVariable Long negocioId) {
        Negocio negocio = negocioRepository.findById(negocioId)
                .orElseThrow(() -> new RuntimeException("Negocio no encontrado"));

        User adminCliente = negocio.getUsuarios().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN")))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Este negocio no tiene un usuario administrador registrado"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(adminCliente.getUsername());
        String nuevoTokenJwt = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(Map.of(
                "message", "Sesión generada exitosamente",
                "username", adminCliente.getUsername(),
                "token", nuevoTokenJwt
        ));
    }

    // --- NUEVO MÉTODO PARA RESETEAR CLAVE ---
    @PostMapping("/negocios/{id}/reset-password")
    public ResponseEntity<?> forcePasswordReset(@PathVariable Long id) {
        Negocio negocio = negocioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Negocio no encontrado"));

        User admin = negocio.getUsuarios().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN")))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Admin no encontrado"));

        // 1. Generamos contraseña temporal aleatoria
        String tempPassword = UUID.randomUUID().toString().substring(0, 8);

        // 2. Guardamos cifrada y marcamos como "requiere cambio"
        admin.setPasswordHash(passwordEncoder.encode(tempPassword));
        admin.setPasswordResetRequired(true);
        userRepository.save(admin);

        // 3. Enviamos mail (asegurate que tu EmailService esté listo)
        emailService.sendEmail(negocio.getContactoEmail(), "MyLogist: Acceso restablecido",
                "Tu contraseña ha sido reseteada por un administrador. Tu clave temporal es: " + tempPassword +
                        ". Deberás cambiarla al ingresar.");

        return ResponseEntity.ok(Map.of("message", "Clave reseteada y enviada al cliente."));
    }
}