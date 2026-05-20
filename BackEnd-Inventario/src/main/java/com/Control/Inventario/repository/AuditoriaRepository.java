package com.Control.Inventario.repository;

import com.Control.Inventario.entity.Auditoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditoriaRepository extends JpaRepository<Auditoria, Long> {

    // El método original que trae TODO
    List<Auditoria> findByNegocioIdOrderByFechaHoraDesc(Long negocioId);

    // NUEVO: El método optimizado para el Dashboard (Solo los últimos 15)
    List<Auditoria> findTop15ByNegocioIdOrderByFechaHoraDesc(Long negocioId);

    // El método paginado (para el futuro)
    Page<Auditoria> findByNegocioIdOrderByFechaHoraDesc(Long negocioId, Pageable pageable);
}