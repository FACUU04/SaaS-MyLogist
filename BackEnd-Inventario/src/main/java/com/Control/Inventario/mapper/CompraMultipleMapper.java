package com.Control.Inventario.mapper;

import com.Control.Inventario.dto.CompraMultipleDTO;
import com.Control.Inventario.model.Compra;
import com.Control.Inventario.model.CompraDetalle;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class CompraMultipleMapper {

    public static Compra toCompraEntity(CompraMultipleDTO dto) {
        Compra compra = new Compra();
        compra.setIdProveedor(dto.getIdProveedor());
        compra.setFecha(dto.getFecha());
        compra.setMetodoPago(dto.getMetodoPago());
        compra.setObservaciones(dto.getObservaciones());
        compra.setEstado("Activo");
        compra.setFechaModificacion(LocalDateTime.now());
        return compra;
    }

    public static List<CompraDetalle> toDetalleEntities(Long idCompra, CompraMultipleDTO dto) {
        return dto.getDetalles().stream().map(d -> {
            CompraDetalle detalle = new CompraDetalle();
            detalle.setIdCompra(idCompra);
            detalle.setIdProducto(d.getIdProducto());
            detalle.setCantidad(d.getCantidad());
            detalle.setImporte(d.getImporte());
            return detalle;
        }).collect(Collectors.toList());
    }
}

