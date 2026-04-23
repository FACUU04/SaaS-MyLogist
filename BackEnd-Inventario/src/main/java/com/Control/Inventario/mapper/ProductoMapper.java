package com.Control.Inventario.mapper;

import com.Control.Inventario.dto.ProductoResponseDTO;
import com.Control.Inventario.entity.Producto;

public class ProductoMapper {

    public static ProductoResponseDTO toDto(Producto producto) {
        return new ProductoResponseDTO(
                producto.getId(),
                producto.getMarca(),
                producto.getDescripcion(),
                producto.getPrecio(),
                producto.getCantidadStock(),
                producto.getUnidad()
        );
    }
}
