package com.Control.Inventario.repository;

import com.Control.Inventario.entity.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {

    List<Empleado> findByNegocioId(Long negocioId);

    // --- NUEVO MÉTODO OPTIMIZADO PARA EL DASHBOARD ---

    long countByNegocioId(Long negocioId);


}