package com.Control.Inventario.repository;

import com.Control.Inventario.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    List<User> findByNegocioId(Long negocioId);
    
    Optional<User> findByEmpleadoId(Long empleadoId);
}