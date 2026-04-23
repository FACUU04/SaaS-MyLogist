package com.Control.Inventario.repository;

import com.Control.Inventario.model.RegistroActividad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegistroActividadRepository extends JpaRepository<RegistroActividad, Integer> {
}

