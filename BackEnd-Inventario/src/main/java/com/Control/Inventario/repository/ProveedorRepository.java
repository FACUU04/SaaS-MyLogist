package com.Control.Inventario.repository;

import com.Control.Inventario.model.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Integer> {

    // Trae solo los proveedores del negocio del usuario
    List<Proveedor> findByNegocioIdAndActivoTrue(Long negocioId);

    // Busca un proveedor validando que pertenezca al negocio
    Optional<Proveedor> findByIdAndNegocioId(int id, Long negocioId);
}