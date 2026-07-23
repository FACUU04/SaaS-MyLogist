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
    private final ImportacionExcelService importacionExcelService;

    // --- ENDPOINTS EXISTENTES ---

    @GetMapping
    @PreAuthorize("@permisos.puedeGestionarInventario(authentication.name) or @permisos.puedeVender(authentication.name)")
    public PageResponse<ProductoResponseDTO> listar(
            @RequestParam(required = false) String buscar,
            Pageable pageable) {
        Page<ProductoResponseDTO> page = productoService.listarProductosDelNegocio(buscar, pageable);
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getTotalPages(),
                page.getTotalElements()
        );
    }

    @GetMapping("/eliminados")
    @PreAuthorize("@permisos.puedeGestionarInventario(authentication.name) or @permisos.puedeVender(authentication.name)")
    public PageResponse<ProductoResponseDTO> listarEliminados(
            @RequestParam(required = false) String buscar,
            Pageable pageable) {
        Page<ProductoResponseDTO> page = productoService.listarProductosEliminados(buscar, pageable);
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getTotalPages(),
                page.getTotalElements()
        );
    }

    // --- NUEVO ENDPOINT PARA EL ESCÁNER ---

    @GetMapping("/codigo-barras/{codigo}")
    @PreAuthorize("@permisos.puedeGestionarInventario(authentication.name) or @permisos.puedeVender(authentication.name)")
    public ResponseEntity<ProductoResponseDTO> buscarPorCodigoBarras(@PathVariable String codigo) {
        // Delegamos al servicio para que busque por código y filtre por el negocio del usuario actual
        ProductoResponseDTO producto = productoService.buscarPorCodigoBarras(codigo);
        return ResponseEntity.ok(producto);
    }

    // --------------------------------------

    @PostMapping
    @PreAuthorize("@permisos.puedeGestionarInventario(authentication.name)")
    public ProductoResponseDTO crear(@RequestBody ProductoRequest request) {
        return productoService.crearProducto(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@permisos.puedeGestionarInventario(authentication.name)")
    public ProductoResponseDTO actualizar(
            @PathVariable Long id,
            @RequestBody ProductoRequest request
    ) {
        return productoService.actualizarProducto(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@permisos.puedeGestionarInventario(authentication.name)")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoService.eliminarProducto(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/restaurar")
    @PreAuthorize("@permisos.puedeGestionarInventario(authentication.name)")
    public ResponseEntity<Void> restaurar(@PathVariable Long id) {
        productoService.restaurarProducto(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/importar")
    @PreAuthorize("@permisos.puedeGestionarInventario(authentication.name)")
    public ResponseEntity<ImportacionExcelResponseDTO> importarExcel(@RequestParam("file") MultipartFile file) {
        ImportacionExcelResponseDTO resultado = importacionExcelService.procesarExcel(file);
        if (resultado.isExito()) {
            return ResponseEntity.ok(resultado);
        } else {
            return ResponseEntity.badRequest().body(resultado);
        }
    }
}