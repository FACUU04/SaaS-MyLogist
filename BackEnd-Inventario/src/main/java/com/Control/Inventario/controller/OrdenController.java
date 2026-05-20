package com.Control.Inventario.controller;

import com.Control.Inventario.dto.OrdenRequestDTO;
import com.Control.Inventario.entity.OrdenCompra;
import com.Control.Inventario.entity.User;
import com.Control.Inventario.repository.OrdenCompraRepository;
import com.Control.Inventario.repository.UserRepository;
import com.Control.Inventario.service.OrdenCompraService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ordenes-compra")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class OrdenController {

    private final OrdenCompraService ordenCompraService;
    private final OrdenCompraRepository ordenCompraRepository;
    private final UserRepository userRepository;

    /**
     * Endpoint para crear una nueva orden de compra.
     */
    @PostMapping
    public ResponseEntity<OrdenCompra> crearOrden(@Valid @RequestBody OrdenRequestDTO request, Authentication auth) {
        // Le pasamos el username al service
        OrdenCompra nuevaOrden = ordenCompraService.crearOrden(request, auth.getName());
        return new ResponseEntity<>(nuevaOrden, HttpStatus.CREATED);
    }

    /**
     * Endpoint para confirmar que los productos llegaron.
     */
    @PutMapping("/{id}/recibir")
    public ResponseEntity<OrdenCompra> confirmarRecepcion(@PathVariable Long id, Authentication auth) {
        // Le pasamos el username al service
        OrdenCompra ordenActualizada = ordenCompraService.confirmarRecepcionOrden(id, auth.getName());
        return ResponseEntity.ok(ordenActualizada);
    }

    /**
     * Obtener órdenes de un proveedor, pero SOLO las de este negocio
     */
    @GetMapping("/proveedor/{proveedorId}")
    public ResponseEntity<List<OrdenCompra>> obtenerOrdenesPorProveedor(@PathVariable Integer proveedorId, Authentication auth) {
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<OrdenCompra> ordenes = ordenCompraRepository.findByProveedorIdAndNegocioId(proveedorId, user.getNegocio().getId());
        return ResponseEntity.ok(ordenes);
    }

    /**
     * Endpoint general filtrado herméticamente
     */
    @GetMapping
    public ResponseEntity<List<OrdenCompra>> listarTodas(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return ResponseEntity.ok(ordenCompraRepository.findByNegocioId(user.getNegocio().getId()));
    }
}