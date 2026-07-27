package com.Control.Inventario.controller;

import com.Control.Inventario.dto.PageResponse;
import com.Control.Inventario.dto.ProductoRequest;
import com.Control.Inventario.dto.ProductoResponseDTO;
import com.Control.Inventario.dto.ImportacionExcelResponseDTO;
import com.Control.Inventario.entity.Producto;
import com.Control.Inventario.repository.ProductoRepository;
import com.Control.Inventario.service.ProductoService;
import com.Control.Inventario.service.ImportacionExcelService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;
    private final ImportacionExcelService importacionExcelService;
    private final ProductoRepository productoRepository; // <-- 1. INYECTAMOS EL REPOSITORIO AQUÍ

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

    // --- ENDPOINT PARA EL ESCÁNER ---

    @GetMapping("/codigo-barras/{codigo}")
    @PreAuthorize("@permisos.puedeGestionarInventario(authentication.name) or @permisos.puedeVender(authentication.name)")
    public ResponseEntity<ProductoResponseDTO> buscarPorCodigoBarras(@PathVariable String codigo) {
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


    // --- NUEVO ENDPOINT ALTA RÁPIDA (Corregido) ---
    @PostMapping("/rapido")
    public ResponseEntity<?> crearProductoRapido(@RequestBody Map<String, Object> payload) {
        try {
            Producto nuevoProducto = new Producto();

            nuevoProducto.setCodigoBarras(payload.get("codigo_barras").toString());
            nuevoProducto.setDescripcion(payload.get("descripcion").toString());
            nuevoProducto.setPrecio(Double.parseDouble(payload.get("precio").toString()));

            // 2. CORREGIDO: Usamos Double.valueOf en lugar de Integer.parseInt
            nuevoProducto.setCantidadStock(Double.valueOf(payload.get("cantidad_stock").toString()));

            nuevoProducto.setMarca("Sin Marca");
            nuevoProducto.setActivo(true);

            // 3. CORREGIDO: Usamos la instancia con minúscula (productoRepository)
            Producto productoGuardado = productoRepository.save(nuevoProducto);

            return ResponseEntity.ok(productoGuardado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear producto rápido: " + e.getMessage());
        }
    }
}