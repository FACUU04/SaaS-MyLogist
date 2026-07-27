package com.Control.Inventario.repository;

import com.Control.Inventario.entity.MovimientoInventario;
import com.Control.Inventario.entity.Negocio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {

    // Spring Data JPA lee este nombre y automáticamente crea la consulta SQL:
    // "SELECT * FROM movimientos WHERE negocio_id = ? AND fecha_movimiento > ?"
    List<MovimientoInventario> findByNegocioAndFechaMovimientoAfter(Negocio negocio, LocalDateTime fecha);

}