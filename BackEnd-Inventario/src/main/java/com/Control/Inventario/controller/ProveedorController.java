package com.Control.Inventario.controller;

import com.Control.Inventario.model.Proveedor;
import com.Control.Inventario.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProveedorController {

    private final ProveedorRepository proveedorRepository;

    @GetMapping
    @PreAuthorize("@permisos.puedeGestionarProveedores(authentication.name)")
    public List<Proveedor> listar() {
        return proveedorRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("@permisos.puedeGestionarProveedores(authentication.name)")
    public Proveedor crear(@RequestBody Proveedor proveedor) {
        proveedor.setFechaRegistro(LocalDateTime.now());
        proveedor.setActivo(true);
        return proveedorRepository.save(proveedor);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@permisos.puedeGestionarProveedores(authentication.name)")
    public ResponseEntity<Proveedor> actualizar(@PathVariable int id, @RequestBody Proveedor proveedorActualizado) {
        return proveedorRepository.findById(id)
                .map(proveedor -> {
                    proveedor.setNombre(proveedorActualizado.getNombre());
                    proveedor.setDescripcion(proveedorActualizado.getDescripcion());
                    proveedor.setContacto(proveedorActualizado.getContacto());
                    proveedor.setFechaInicioRelacion(proveedorActualizado.getFechaInicioRelacion());
                    proveedor.setProductosSuministrados(proveedorActualizado.getProductosSuministrados());
                    proveedor.setSitioWeb(proveedorActualizado.getSitioWeb());
                    proveedor.setEstado(proveedorActualizado.getEstado());
                    proveedor.setEmail(proveedorActualizado.getEmail());
                    proveedor.setTelefono(proveedorActualizado.getTelefono());
                    proveedor.setDireccion(proveedorActualizado.getDireccion());
                    proveedor.setFechaUltimaCompra(proveedorActualizado.getFechaUltimaCompra());
                    proveedor.setFechaRegistro(LocalDateTime.now());
                    return ResponseEntity.ok(proveedorRepository.save(proveedor));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@permisos.puedeGestionarProveedores(authentication.name)")
    public ResponseEntity<Void> eliminar(@PathVariable int id) {
        return proveedorRepository.findById(id)
                .map(proveedor -> {
                    proveedor.setActivo(false);
                    proveedorRepository.save(proveedor);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reactivar")
    @PreAuthorize("@permisos.puedeGestionarProveedores(authentication.name)")
    public ResponseEntity<Proveedor> reactivar(@PathVariable int id) {
        return proveedorRepository.findById(id)
                .map(proveedor -> {
                    proveedor.setActivo(true);
                    return ResponseEntity.ok(proveedorRepository.save(proveedor));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}