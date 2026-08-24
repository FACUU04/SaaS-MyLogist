package com.Control.Inventario.service;

import com.Control.Inventario.entity.PasswordResetToken;
import com.Control.Inventario.entity.User;
import com.Control.Inventario.repository.PasswordResetTokenRepository;
import com.Control.Inventario.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    // Leemos la URL del frontend desde properties, con localhost por defecto
    @Value("${mylogist.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Transactional
    public void generateResetTokenAndSendEmail(String email) {
        // 1. Buscamos al usuario (primero como empleado, luego como admin)
        Optional<User> userOpt = userRepository.findByEmpleadoEmail(email);

        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByNegocioAdminEmail(email);
        }

        // 2. Si existe, procesamos. Si no existe, no hacemos nada (por seguridad)
        userOpt.ifPresent(user -> {
            String newTokenString = UUID.randomUUID().toString();

            // 3. Buscamos si el usuario ya tiene un token previo en la BD
            Optional<PasswordResetToken> existingTokenOpt = tokenRepository.findByUser(user);

            PasswordResetToken resetToken;
            if (existingTokenOpt.isPresent()) {
                // Si ya existe, lo RECICLAMOS (evita el error Duplicate Entry)
                resetToken = existingTokenOpt.get();
                resetToken.setToken(newTokenString);
                resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));
            } else {
                // Si no existe, lo CREAMOS
                resetToken = new PasswordResetToken(newTokenString, user);
            }

            tokenRepository.save(resetToken);

            // Armamos la URL dinámica
            String url = frontendUrl + "/reset-password?token=" + newTokenString;

            // Enviamos el correo
            emailService.sendEmail(email,
                    "Recuperación de contraseña - MyLogist",
                    "Hemos recibido una solicitud para restablecer tu contraseña.\n\n" +
                            "Ingresa aquí para cambiar tu contraseña: " + url + "\n\n" +
                            "Este enlace expirará en 15 minutos. Si no fuiste tú, puedes ignorar este correo.");
        });
    }

    @Transactional
    public void updatePassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token inválido o no existe."));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(resetToken);
            throw new IllegalArgumentException("El token ha expirado, solicita uno nuevo.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordResetRequired(false);

        userRepository.save(user);
        tokenRepository.delete(resetToken); // Borramos el token una vez usado
    }
}