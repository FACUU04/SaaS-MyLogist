package com.Control.Inventario.controller;

import com.Control.Inventario.dto.ForgotPasswordRequest;
import com.Control.Inventario.dto.LoginRequest;
import com.Control.Inventario.dto.ResetPasswordRequest;
import com.Control.Inventario.service.AuthService;
import com.Control.Inventario.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthApiController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody String refreshToken) {
        return authService.refresh(refreshToken);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        // El servicio maneja todo. Si el correo no existe, no falla, simula éxito.
        passwordResetService.generateResetTokenAndSendEmail(request.email());

        return ResponseEntity.ok(Map.of("message", "Si el correo está registrado, recibirás un enlace de recuperación."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.updatePassword(request.token(), request.newPassword());
            return ResponseEntity.ok(Map.of("message", "Contraseña actualizada con éxito"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}