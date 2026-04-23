package com.Control.Inventario.controller;

import com.Control.Inventario.dto.CompraMultipleDTO;
import com.Control.Inventario.model.Compra;
import com.Control.Inventario.model.CompraDetalle;
import com.Control.Inventario.repository.CompraRepository;
import com.Control.Inventario.service.CompraService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/compras")
@RequiredArgsConstructor
public class CompraController {

    private final CompraRepository compraRepository;
    private final CompraService compraService;

    // listar compras
    @GetMapping
    public List<Compra> listar() {
        return compraRepository.findAll();
    }

    // listar por proveedor
    @GetMapping("/proveedor/{idProveedor}")
    public List<Compra> listarPorProveedor(@PathVariable Long idProveedor) {
        return compraRepository.findByIdProveedor(idProveedor);
    }

    // crear compra simple
    @PostMapping("/simple")
    public ResponseEntity<Compra> crearSimple(@RequestBody Compra compra, Principal principal) {
        // Le pasamos el nombre del usuario logueado al servicio
        String username = principal.getName();
        Compra guardada = compraService.save(compra, username);
        return ResponseEntity.ok(guardada);
    }

    // crear compra múltiple
    @PostMapping("/multiple")
    public ResponseEntity<?> crearMultiple(@RequestBody CompraMultipleDTO dto, Principal principal) {

        // Obtenemos el usuario que está haciendo la petición (del token JWT o sesión)
        String username = principal.getName();

        // Le pasamos el username al servicio
        Compra guardada = compraService.saveMultiple(dto, username);

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("id", guardada.getId());
        respuesta.put("mensaje", "Compra creada correctamente");

        return ResponseEntity.ok(respuesta);
    }

    // obtener detalles
    @GetMapping("/{idCompra}/detalles")
    public ResponseEntity<List<CompraDetalle>> obtenerDetalles(@PathVariable Long idCompra) {
        List<CompraDetalle> detalles = compraService.getDetalles(idCompra);
        return ResponseEntity.ok(detalles);
    }
}