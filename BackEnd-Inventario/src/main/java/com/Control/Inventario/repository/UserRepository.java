package com.Control.Inventario.repository;

import com.Control.Inventario.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    // 1. Busca si el correo pertenece a un Empleado
    @Query("SELECT u FROM User u WHERE u.empleado.contacto_email = :email")
    Optional<User> findByEmpleadoEmail(@Param("email") String email);

    // 2. Busca si el correo pertenece al Admin del negocio
    @Query("SELECT u FROM User u WHERE u.negocio.contactoEmail = :email AND u.empleado IS NULL")
    Optional<User> findByNegocioAdminEmail(@Param("email") String email);

    boolean existsByUsername(String username);
    List<User> findByNegocioId(Long negocioId);
    Optional<User> findByEmpleadoId(Long empleadoId);
    void deleteByNegocioId(Long negocioId);
}