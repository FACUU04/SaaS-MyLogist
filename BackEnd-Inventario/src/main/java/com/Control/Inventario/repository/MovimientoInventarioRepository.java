package com.Control.Inventario.repository;

import com.Control.Inventario.entity.MovimientoInventario;
import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.entity.Producto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {

    // Para ver el historial completo de un negocio paginado
    Page<MovimientoInventario> findAllByNegocioOrderByFechaMovimientoDesc(Negocio negocio, Pageable pageable);

    // Para ver el historial de un producto específico (ej: "¿qué pasó con estas galletas?")
    List<MovimientoInventario> findByProductoOrderByFechaMovimientoDesc(Producto producto);

    // ESTA ES LA MAGIA PARA LOS REPORTES: Trae todos los movimientos de un negocio en un rango de fechas
    @Query("SELECT m FROM MovimientoInventario m WHERE m.negocio = :negocio AND m.fechaMovimiento >= :inicio AND m.fechaMovimiento <= :fin ORDER BY m.fechaMovimiento ASC")
    List<MovimientoInventario> buscarMovimientosEnRango(
            @Param("negocio") Negocio negocio,
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin
    );
}