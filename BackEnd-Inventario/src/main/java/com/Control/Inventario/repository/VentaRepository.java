package com.Control.Inventario.repository;

import com.Control.Inventario.dto.VentaDiariaDTO;
import com.Control.Inventario.entity.Venta;
import com.Control.Inventario.entity.TurnoCaja;
import com.Control.Inventario.entity.MetodoPago;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate; // FIX: Cambiado a LocalDate
import java.util.List;

public interface VentaRepository extends JpaRepository<Venta, Long> {

    List<Venta> findByNegocioId(Long negocioId);

    @Query("SELECT v FROM Venta v WHERE v.negocioId = :negocioId " +
            "AND (:mes IS NULL OR MONTH(v.fecha) = :mes) " +
            "AND (:anio IS NULL OR YEAR(v.fecha) = :anio)")
    Page<Venta> findByNegocioIdAndMesAndAnio(
            @Param("negocioId") Long negocioId,
            @Param("mes") Integer mes,
            @Param("anio") Integer anio,
            Pageable pageable
    );

    @Query("SELECT DAY(v.fecha) AS dia, SUM(v.importe) AS total " +
            "FROM Venta v " +
            "WHERE v.negocioId = :negocioId " +
            "AND MONTH(v.fecha) = :mes " +
            "AND YEAR(v.fecha) = :anio " +
            "GROUP BY DAY(v.fecha) " +
            "ORDER BY DAY(v.fecha) ASC")
    List<VentaDiariaDTO> obtenerVentasDiarias(
            @Param("negocioId") Long negocioId,
            @Param("mes") Integer mes,
            @Param("anio") Integer anio
    );

    @Query("SELECT COALESCE(SUM(v.importe), 0) FROM Venta v WHERE v.turno = :turno AND v.metodoPago = :metodoPago")
    BigDecimal sumVentasByTurnoAndMetodoPago(
            @Param("turno") TurnoCaja turno,
            @Param("metodoPago") MetodoPago metodoPago
    );

    // --- NUEVOS MÉTODOS PARA EL DASHBOARD ---

    long countByNegocioId(Long negocioId);

    // FIX: El parámetro ahora es LocalDate
    @Query("SELECT COUNT(v) FROM Venta v WHERE v.negocioId = :negocioId AND v.fecha >= :fechaDesde")
    long countVentasRecientes(@Param("negocioId") Long negocioId, @Param("fechaDesde") LocalDate fechaDesde);

    // FIX: El parámetro ahora es LocalDate
    @Query("SELECT p.marca, p.descripcion, SUM(d.cantidad) AS total " +
            "FROM DetalleVenta d " +
            "JOIN d.venta v " +
            "JOIN d.producto p " +
            "WHERE v.negocioId = :negocioId AND v.fecha >= :fechaDesde " +
            "GROUP BY p.marca, p.descripcion " +
            "ORDER BY total DESC")
    List<Object[]> obtenerTopProductos(@Param("negocioId") Long negocioId, @Param("fechaDesde") LocalDate fechaDesde, Pageable pageable);
}