package com.Control.Inventario.controller;

import com.Control.Inventario.dto.PageResponse;
import com.Control.Inventario.dto.ProductoRequest;
import com.Control.Inventario.dto.ProductoResponseDTO;
import com.Control.Inventario.dto.ImportacionExcelResponseDTO; 
import com.Control.Inventario.service.ProductoService;
import com.Control.Inventario.service.ImportacionExcelService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;
    private final ImportacionExcelService importacionExcelService; // NUEVO: Se inyecta automáticamente gracias a @RequiredArgsConstructor

    // LISTAR PRODUCTOS (SOLO ACTIVOS) - Lectura permitida para ventas e inventario
    @GetMapping
    @PreAuthorize("@permisos.puedeGestionarInventario(authentication.name) or @permisos.puedeVender(authentication.name)")
    public PageResponse<ProductoResponseDTO> listar(Pageable pageable) {
        Page<ProductoResponseDTO> page = productoService.listarProductosDelNegocio(pageable);
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getTotalPages(),
                page.getTotalElements()
        );
    }

    // LISTAR PRODUCTOS ELIMINADOS (INACTIVOS) - Lectura permitida para ventas e inventario
    @GetMapping("/eliminados")
    @PreAuthorize("@permisos.puedeGestionarInventario(authentication.name) or @permisos.puedeVender(authentication.name)")
    public PageResponse<ProductoResponseDTO> listarEliminados(Pageable pageable) {
        Page<ProductoResponseDTO> page = productoService.listarProductosEliminados(pageable);
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getTotalPages(),
                page.getTotalElements()
        );
    }

    // CREAR PRODUCTO - Escritura solo para inventario
    @PostMapping
    @PreAuthorize("@permisos.puedeGestionarInventario(authentication.name)")
    public ProductoResponseDTO crear(@RequestBody ProductoRequest request) {
        return productoService.crearProducto(request);
    }

    // ACTUALIZAR PRODUCTO - Escritura solo para inventario
    @PutMapping("/{id}")
    @PreAuthorize("@permisos.puedeGestionarInventario(authentication.name)")
    public ProductoResponseDTO actualizar(
            @PathVariable Long id,
            @RequestBody ProductoRequest request
    ) {
        return productoService.actualizarProducto(id, request);
    }

    // ELIMINAR PRODUCTO (BORRADO LÓGICO) - Escritura solo para inventario
    @DeleteMapping("/{id}")
    @PreAuthorize("@permisos.puedeGestionarInventario(authentication.name)")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoService.eliminarProducto(id);
        return ResponseEntity.ok().build();
    }

    // RESTAURAR PRODUCTO - Escritura solo para inventario
    @PutMapping("/{id}/restaurar")
    @PreAuthorize("@permisos.puedeGestionarInventario(authentication.name)")
    public ResponseEntity<Void> restaurar(@PathVariable Long id) {
        productoService.restaurarProducto(id);
        return ResponseEntity.ok().build();
    }

    // IMPORTAR DESDE EXCEL - Escritura solo para inventario
    @PostMapping("/importar")
    @PreAuthorize("@permisos.puedeGestionarInventario(authentication.name)")
    public ResponseEntity<ImportacionExcelResponseDTO> importarExcel(@RequestParam("file") MultipartFile file) {
        ImportacionExcelResponseDTO resultado = importacionExcelService.procesarExcel(file);

        if (resultado.isExito()) {
            return ResponseEntity.ok(resultado);
        } else {
            // Devolvemos 400 Bad Request con la lista de errores si el Excel viene mal armado
            return ResponseEntity.badRequest().body(resultado);
        }
    }
}