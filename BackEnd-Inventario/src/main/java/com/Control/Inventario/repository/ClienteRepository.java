package com.Control.Inventario.repository;

import com.Control.Inventario.entity.Cliente;
import com.Control.Inventario.entity.Negocio;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Page<Cliente> findAllByNegocio(Negocio negocio, Pageable pageable);

    Optional<Cliente> findByIdAndNegocio(Long id, Negocio negocio);

    boolean existsByDniAndNegocio(String dni, Negocio negocio);

    // --- NUEVOS MÉTODOS PARA EL DASHBOARD ---
    long countByNegocioAndActivoTrue(Negocio negocio);

    // --- MÉTODO PARA BORRADO EN CASCADA ---
    void deleteByNegocioId(Long negocioId);
}