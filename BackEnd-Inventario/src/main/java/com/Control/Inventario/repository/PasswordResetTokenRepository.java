package com.Control.Inventario.repository;

import com.Control.Inventario.entity.PasswordResetToken;
import com.Control.Inventario.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);

    // Método clave para buscar si ya existe un token para este usuario
    Optional<PasswordResetToken> findByUser(User user);

    void deleteByUser(User user);
}