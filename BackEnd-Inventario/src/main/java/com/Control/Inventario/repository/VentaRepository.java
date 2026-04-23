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
import java.util.List;

public interface VentaRepository extends JpaRepository<Venta, Long> {

    List<Venta> findByNegocioId(Long negocioId);

    // Consulta paginada con filtros opcionales de mes y año
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


    // Suma el importe de las ventas de un turno específico y un método de pago específico.
    // Usamos COALESCE para que devuelva 0.0 en lugar de null si no hubo ventas en ese método.
    @Query("SELECT COALESCE(SUM(v.importe), 0) FROM Venta v WHERE v.turno = :turno AND v.metodoPago = :metodoPago")
    BigDecimal sumVentasByTurnoAndMetodoPago(
            @Param("turno") TurnoCaja turno,
            @Param("metodoPago") MetodoPago metodoPago
    );

}
