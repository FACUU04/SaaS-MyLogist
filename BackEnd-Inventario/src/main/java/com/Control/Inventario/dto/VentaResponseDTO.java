package com.Control.Inventario.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record VentaResponseDTO(
        Long id,
        LocalDate fecha,
        BigDecimal importeTotal,
        Long clienteId,
        List<DetalleVentaResponseDTO> detalles
) {}
