package com.Control.Inventario.repository;

import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.entity.Producto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Page<Producto> findAllByNegocio(Negocio negocio, Pageable pageable);

    Page<Producto> findAllByNegocioAndActivoTrue(Negocio negocio, Pageable pageable);

    Page<Producto> findAllByNegocioAndActivoFalse(Negocio negocio, Pageable pageable);

    Optional<Producto> findByIdAndNegocio(Long id, Negocio negocio);

    // --- NUEVA CONSULTA DE BÚSQUEDA PARA PAGINACIÓN ---
    @Query("SELECT p FROM Producto p WHERE p.negocio = :negocio AND p.activo = :activo AND " +
            "(LOWER(p.marca) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR LOWER(p.descripcion) LIKE LOWER(CONCAT('%', :busqueda, '%')))")
    Page<Producto> buscarConFiltro(@Param("negocio") Negocio negocio, @Param("activo") boolean activo, @Param("busqueda") String busqueda, Pageable pageable);

    // --- MÉTODOS PARA EL DASHBOARD ---

    long countByNegocioAndActivoTrue(Negocio negocio);

    @Query("SELECT COUNT(p) FROM Producto p WHERE p.negocio = :negocio AND p.activo = true AND p.cantidadStock < :umbral")
    long countBajoStock(@Param("negocio") Negocio negocio, @Param("umbral") Double umbral);

    @Query("SELECT p FROM Producto p WHERE p.negocio = :negocio AND p.activo = true AND p.cantidadStock < :umbral")
    List<Producto> findBajoStockList(@Param("negocio") Negocio negocio, @Param("umbral") Double umbral);

    // --- MÉTODO PARA BORRADO EN CASCADA ---
    void deleteByNegocioId(Long negocioId);
}