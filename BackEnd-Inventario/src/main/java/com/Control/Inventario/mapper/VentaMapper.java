package com.Control.Inventario.mapper;

import com.Control.Inventario.dto.DetalleVentaResponseDTO;
import com.Control.Inventario.dto.VentaResponseDTO;
import com.Control.Inventario.entity.DetalleVenta;
import com.Control.Inventario.entity.Venta;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.stream.Collectors;

public class VentaMapper {

    public static VentaResponseDTO toDTO(Venta venta) {
        return new VentaResponseDTO(
                // 1. Convertimos el int a long explícitamente
                (long) venta.getId(),

                venta.getFecha(),
                venta.getImporte(),

                // 2. Si hay cliente, lo pasamos a Long. Si es null (Consumidor Final), lo dejamos en null
                venta.getIdCliente() != null ? venta.getIdCliente().longValue() : null,

                venta.getDetalles().stream()
                        .map(VentaMapper::mapDetalle)
                        .collect(Collectors.toList())
        );
    }

    private static DetalleVentaResponseDTO mapDetalle(DetalleVenta detalle) {
        // Convertimos la unidad a String de forma segura (por si tenés un Enum)
        String unidadStr = detalle.getUnidadMedida() != null ? detalle.getUnidadMedida().toString() : "";

        return new DetalleVentaResponseDTO(
                detalle.getProducto().getId(),
                detalle.getProducto().getMarca(),
                detalle.getProducto().getDescripcion(),
                detalle.getCantidad(),
                unidadStr,
                calcularPrecioUnitario(detalle),
                detalle.getImporte() // Pasamos el subtotal real calculado en la BD
        );
    }

    private static BigDecimal calcularPrecioUnitario(DetalleVenta detalle) {
        if (detalle.getCantidad() == null ||
                detalle.getCantidad().compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return detalle.getImporte()
                .divide(detalle.getCantidad(), 2, RoundingMode.HALF_UP);
    }
}