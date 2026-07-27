package com.Control.Inventario.repository;

import com.Control.Inventario.entity.ConfiguracionReporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ConfiguracionReporteRepository extends JpaRepository<ConfiguracionReporte, Long> {

    // Trae todas las configuraciones que están activas
    List<ConfiguracionReporte> findAllByActivoTrue();

    // (Opcional) Si luego quieres filtrar directamente por base de datos
    // a los que les toca "HOY" según su fecha de último envío.
    @Query("SELECT c FROM ConfiguracionReporte c WHERE c.activo = true")
    List<ConfiguracionReporte> buscarConfiguracionesPendientes();
}