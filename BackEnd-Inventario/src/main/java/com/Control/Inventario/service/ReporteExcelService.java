package com.Control.Inventario.service;

import com.Control.Inventario.entity.MovimientoInventario;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReporteExcelService {

    public byte[] generarReporteMovimientos(List<MovimientoInventario> movimientos, String nombreNegocio) {
        // Creamos un libro de Excel en blanco
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Reporte Inventario");

            // Estilos para la cabecera
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.BLUE_GREY.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Fila 0: Título del negocio
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Reporte de Movimientos - " + nombreNegocio);
            titleCell.setCellStyle(headerCellStyle);

            // Fila 2: Cabeceras de la tabla
            Row headerRow = sheet.createRow(2);
            String[] columns = {"Fecha", "Producto", "Tipo Movimiento", "Cantidad", "Usuario", "Descripción"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            // Llenamos los datos
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            int rowIdx = 3;

            for (MovimientoInventario mov : movimientos) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(mov.getFechaMovimiento().format(dateFormatter));
                row.createCell(1).setCellValue(mov.getProducto().getDescripcion());
                row.createCell(2).setCellValue(mov.getTipoMovimiento().name());
                row.createCell(3).setCellValue(mov.getCantidad());
                row.createCell(4).setCellValue(mov.getUsuarioResponsable());
                row.createCell(5).setCellValue(mov.getDescripcion() != null ? mov.getDescripcion() : "-");
            }

            // Auto-ajustar el ancho de las columnas
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            // Escribimos el archivo en memoria y lo devolvemos como bytes
            workbook.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Error al generar el archivo Excel: " + e.getMessage());
        }
    }
}