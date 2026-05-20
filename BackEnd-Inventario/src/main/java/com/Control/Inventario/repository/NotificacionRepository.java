package com.Control.Inventario.repository;

import com.Control.Inventario.entity.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    // Trae los avisos activos: Los que son para este negocio puntual + Los globales (negocio_id IS NULL)
    @Query("SELECT n FROM Notificacion n WHERE n.activa = true AND (n.negocio.id = :negocioId OR n.negocio IS NULL) ORDER BY n.fechaCreacion DESC")
    List<Notificacion> findActivasByNegocioOrGlobal(@Param("negocioId") Long negocioId);

    // Trae todo el historial de notificaciones enviadas a un negocio específico
    List<Notificacion> findByNegocioIdOrderByFechaCreacionDesc(Long negocioId);
}