package com.Control.Inventario.controller;

import com.Control.Inventario.dto.ProductoRequest;
import com.Control.Inventario.dto.ProductoResponseDTO;
import com.Control.Inventario.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/productos")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductoController {

    private final ProductoService productoService;


    // LISTAR PRODUCTOS DEL NEGOCIO
    @GetMapping
    public Page<ProductoResponseDTO> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return productoService.listarProductosDelNegocio(
                PageRequest.of(page, size)
        );
    }


    // CREAR PRODUCTO
    @PostMapping
    public ResponseEntity<ProductoResponseDTO> crear(
            @RequestBody ProductoRequest request
    ) {
        return ResponseEntity.ok(
                productoService.crearProducto(request)
        );
    }


    // EDITAR PRODUCTO
    @PutMapping("/{id}")
    public ResponseEntity<ProductoResponseDTO> editar(
            @PathVariable Long id,
            @RequestBody ProductoRequest request
    ) {
        return ResponseEntity.ok(
                productoService.actualizarProducto(id, request)
        );
    }
}

