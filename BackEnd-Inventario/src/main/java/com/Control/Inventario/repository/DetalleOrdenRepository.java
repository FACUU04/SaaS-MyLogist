package com.Control.Inventario.repository;

import com.Control.Inventario.entity.DetalleOrdenCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleOrdenRepository extends JpaRepository<DetalleOrdenCompra, Long> {

    // Traer todos los detalles de una orden específica
    List<DetalleOrdenCompra> findByOrdenCompraId(Long ordenId);

    // Buscar todas las veces que se compró un producto específico
    // (Útil para ver cómo fue variando el precio unitario a lo largo del tiempo)
    List<DetalleOrdenCompra> findByProductoId(Long productoId);
}