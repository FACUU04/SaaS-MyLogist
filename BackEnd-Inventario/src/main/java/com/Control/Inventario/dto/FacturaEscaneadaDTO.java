package com.Control.Inventario.dto;

import lombok.Data;
import java.util.List;

@Data
public class FacturaEscaneadaDTO {
    private String proveedor;
    private String fecha;
    private List<ProductoFacturaDTO> productos;
}
