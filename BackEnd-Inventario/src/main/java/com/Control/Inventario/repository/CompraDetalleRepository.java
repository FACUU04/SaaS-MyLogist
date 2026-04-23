package com.Control.Inventario.repository;

import com.Control.Inventario.model.CompraDetalle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompraDetalleRepository extends JpaRepository<CompraDetalle, Long> {
    List<CompraDetalle> findByIdCompra(Long idCompra);
}
