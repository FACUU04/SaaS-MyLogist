package com.Control.Inventario.repository;

import com.Control.Inventario.entity.Nota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotaRepository extends JpaRepository<Nota, Long> {
    List<Nota> findByNegocioIdOrderByFechaCreacionDesc(Long negocioId);
}
