package com.Control.Inventario.repository;

import com.Control.Inventario.entity.Negocio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface NegocioRepository extends JpaRepository<Negocio, Long> {

    Optional<Negocio> findByNombre(String nombre);

    // Para el calendario de vencimientos: Trae los negocios en PRUEBA, los más antiguos primero
    @Query("SELECT n FROM Negocio n WHERE n.estadoSuscripcion = 'PRUEBA' AND n.activo = true ORDER BY n.fechaAlta ASC")
    List<Negocio> findNegociosEnPruebaOrdenadosPorAntiguedad();

    // NUEVO: Para la tarea automática que suspende vencidos
    List<Negocio> findByEstadoSuscripcionAndActivo(String estadoSuscripcion, boolean activo);

    // Consultas útiles para los gráficos del dashboard
    long countByEstadoSuscripcion(String estadoSuscripcion);
    long countByActivo(boolean activo);

    // Buscar negocios activos que tengan la IA encendida
    List<Negocio> findByReporteIaActivoTrueAndActivoTrue();
}
