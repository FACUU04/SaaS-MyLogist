package com.Control.Inventario.controller;

import com.Control.Inventario.dto.LoginRequest;
import com.Control.Inventario.entity.PasswordResetToken;
import com.Control.Inventario.entity.User;
import com.Control.Inventario.repository.PasswordResetTokenRepository;
import com.Control.Inventario.repository.UserRepository;
import com.Control.Inventario.service.AuthService;
import com.Control.Inventario.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthApiController {

    private final AuthService authService;
    // --- ESTAS SON LAS DEPENDENCIAS QUE FALTABAN ---
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody String refreshToken) {
        return authService.refresh(refreshToken);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        // Buscamos al usuario por su email/username
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user);
        tokenRepository.save(resetToken);

        String url = "https://app.mylogist.com/reset-password?token=" + token;
        emailService.sendEmail(email, "Recuperación de contraseña - MyLogist", "Ingresa aquí para cambiar tu contraseña: " + url);

        return ResponseEntity.ok(Map.of("message", "Correo enviado exitosamente"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(400).body("El token ha expirado, solicita uno nuevo.");
        }

        User user = resetToken.getUser();
        // Ciframos la nueva clave antes de guardarla
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordResetRequired(false);

        userRepository.save(user);
        tokenRepository.delete(resetToken);

        return ResponseEntity.ok(Map.of("message", "Contraseña actualizada con éxito"));
    }
}