package com.Control.Inventario.repository;

import com.Control.Inventario.entity.Auditoria;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditoriaRepository extends JpaRepository<Auditoria, Long> {


    List<Auditoria> findByNegocioIdOrderByFechaHoraDesc(Long negocioId);
    
    Page<Auditoria> findByNegocioIdOrderByFechaHoraDesc(Long negocioId, org.springframework.data.domain.Pageable pageable);
}