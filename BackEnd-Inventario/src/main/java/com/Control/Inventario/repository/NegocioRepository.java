package com.Control.Inventario.repository;

import com.Control.Inventario.entity.Negocio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface NegocioRepository extends JpaRepository<Negocio, Long> {
    Optional<Negocio> findByNombre(String nombre);
}

