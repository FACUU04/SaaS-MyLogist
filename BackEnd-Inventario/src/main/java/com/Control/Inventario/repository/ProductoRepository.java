package com.Control.Inventario.repository;

import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.entity.Producto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    // 1. El método original
    Page<Producto> findAllByNegocio(Negocio negocio, Pageable pageable);

    // 2. El método nuevo para listar SOLO los activos en la vista normal de Inventario
    Page<Producto> findAllByNegocioAndActivoTrue(Negocio negocio, Pageable pageable);

    // 3. El método nuevo para listar SOLO los desactivados/eliminados lógicamente
    Page<Producto> findAllByNegocioAndActivoFalse(Negocio negocio, Pageable pageable);

    Optional<Producto> findByIdAndNegocio(Long id, Negocio negocio);
}
