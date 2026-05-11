package com.Control.Inventario.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ImportacionExcelResponseDTO {
    private boolean exito;
    private int filasProcesadas;
    private String mensaje;
    private List<String> errores;
}