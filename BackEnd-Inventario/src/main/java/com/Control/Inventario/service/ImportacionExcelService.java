package com.Control.Inventario.service;

import com.Control.Inventario.dto.ImportacionExcelResponseDTO;
import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.entity.Producto;
import com.Control.Inventario.entity.User;
import com.Control.Inventario.repository.ProductoRepository;
import com.Control.Inventario.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ImportacionExcelService {

    private final ProductoRepository productoRepository;
    private final UserRepository usuarioRepository;

    @Transactional
    public ImportacionExcelResponseDTO procesarExcel(MultipartFile file) {
        List<String> errores = new ArrayList<>();
        List<Producto> productosNuevos = new ArrayList<>();

        // Obtenemos el negocio del usuario actual
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Negocio negocio = usuario.getNegocio();

        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            // Saltar encabezado
            if (rows.hasNext()) rows.next();

            while (rows.hasNext()) {
                Row currentRow = rows.next();
                int numFila = currentRow.getRowNum() + 1;

                // Validar si la fila está vacía
                if (isFilaVacia(currentRow)) continue;

                try {
                    // Mapeo según el orden: Marca (0), Descripcion (1), Código (2), Precio (3), Stock (4), Unidad (5)
                    String marca = getCellValueAsString(currentRow.getCell(0));
                    String descripcion = getCellValueAsString(currentRow.getCell(1));
                    String codigo = getCellValueAsString(currentRow.getCell(2));

                    if (descripcion == null || descripcion.isBlank()) {
                        errores.add("Fila " + numFila + ": La descripción es obligatoria.");
                        continue;
                    }

                    Double precio = getNumericCellValue(currentRow.getCell(3));
                    Double stock = getNumericCellValue(currentRow.getCell(4));
                    String unidad = getCellValueAsString(currentRow.getCell(5));

                    Producto p = new Producto();
                    p.setMarca(marca);
                    p.setDescripcion(descripcion);
                    p.setCodigoFabricante(codigo);
                    p.setPrecio(precio != null ? precio : 0.0);
                    p.setCantidadStock(stock != null ? stock : 0.0);
                    p.setUnidad(unidad != null ? unidad.toUpperCase() : "UNIDAD");
                    p.setActivo(true);
                    p.setNegocio(negocio); // Asignamos el negocio automáticamente

                    productosNuevos.add(p);

                } catch (Exception e) {
                    errores.add("Fila " + numFila + ": Error de formato o datos inválidos.");
                }
            }

            if (!errores.isEmpty()) {
                return ImportacionExcelResponseDTO.builder()
                        .exito(false)
                        .errores(errores)
                        .mensaje("Se encontraron errores en el archivo.")
                        .build();
            }

            productoRepository.saveAll(productosNuevos);
            return ImportacionExcelResponseDTO.builder()
                    .exito(true)
                    .filasProcesadas(productosNuevos.size())
                    .mensaje("Importación completada con éxito.")
                    .build();

        } catch (Exception e) {
            return ImportacionExcelResponseDTO.builder()
                    .exito(false)
                    .mensaje("Error crítico: " + e.getMessage())
                    .build();
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return null;
        DataFormatter formatter = new DataFormatter();
        return formatter.formatCellValue(cell);
    }

    private Double getNumericCellValue(Cell cell) {
        if (cell == null || cell.getCellType() == CellType.BLANK) return 0.0;
        if (cell.getCellType() == CellType.NUMERIC) return cell.getNumericCellValue();
        try {
            return Double.parseDouble(getCellValueAsString(cell));
        } catch (Exception e) {
            return null; // Forzará el error de validación arriba
        }
    }

    private boolean isFilaVacia(Row row) {
        if (row == null) return true;
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK) return false;
        }
        return true;
    }
}