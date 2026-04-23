package com.Control.Inventario.repository;

import com.Control.Inventario.entity.Empleado;
import com.Control.Inventario.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {

    List<Empleado> findByNegocioId(Long negocioId);

}
