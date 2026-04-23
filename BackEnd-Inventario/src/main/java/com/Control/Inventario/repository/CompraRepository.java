package com.Control.Inventario.repository;

import com.Control.Inventario.model.Compra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Integer> {
    List<Compra> findByIdProveedor(Long idProveedor);
}
