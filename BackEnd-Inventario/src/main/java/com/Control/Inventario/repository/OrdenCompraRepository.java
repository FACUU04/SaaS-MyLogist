package com.Control.Inventario.repository;

import com.Control.Inventario.entity.OrdenCompra;
import com.Control.Inventario.model.EstadoOrden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrdenCompraRepository extends JpaRepository<OrdenCompra, Long> {

    // Filtrado por proveedor Y negocio
    List<OrdenCompra> findByProveedorIdAndNegocioId(int proveedorId, Long negocioId);

    // Filtrado general por negocio (Para listados generales)
    List<OrdenCompra> findByNegocioId(Long negocioId);

    // Busca una orden validando que sea del negocio
    Optional<OrdenCompra> findByIdAndNegocioId(Long id, Long negocioId);

    // Suma de compras por mes (Para el gráfico del Dashboard)
    @Query("SELECT MONTH(o.fechaCreacion), SUM(o.total) FROM OrdenCompra o " +
            "WHERE o.negocio.id = :negocioId AND YEAR(o.fechaCreacion) = :anio " +
            "GROUP BY MONTH(o.fechaCreacion)")
    List<Object[]> sumComprasPorMes(@Param("negocioId") Long negocioId, @Param("anio") int anio);
}