package com.Control.Inventario.controller;

import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.entity.User;
import com.Control.Inventario.model.Proveedor;
import com.Control.Inventario.repository.ProveedorRepository;
import com.Control.Inventario.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProveedorController {

    private final ProveedorRepository proveedorRepository;
    private final UserRepository userRepository;

    private Negocio obtenerNegocioDelUsuario(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getNegocio();
    }

    @GetMapping
    @PreAuthorize("@permisos.puedeGestionarProveedores(authentication.name)")
    public List<Proveedor> listar(Authentication auth) {
        Long negocioId = obtenerNegocioDelUsuario(auth.getName()).getId();
        return proveedorRepository.findByNegocioIdAndActivoTrue(negocioId);
    }

    @PostMapping
    @PreAuthorize("@permisos.puedeGestionarProveedores(authentication.name)")
    public Proveedor crear(@RequestBody Proveedor proveedor, Authentication auth) {
        Negocio negocio = obtenerNegocioDelUsuario(auth.getName());

        proveedor.setNegocio(negocio); // Lo atamos al negocio del usuario
        proveedor.setFechaRegistro(LocalDateTime.now());
        proveedor.setActivo(true);
        return proveedorRepository.save(proveedor);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@permisos.puedeGestionarProveedores(authentication.name)")
    public ResponseEntity<Proveedor> actualizar(@PathVariable int id, @RequestBody Proveedor proveedorActualizado, Authentication auth) {
        Long negocioId = obtenerNegocioDelUsuario(auth.getName()).getId();

        return proveedorRepository.findByIdAndNegocioId(id, negocioId)
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
                    return ResponseEntity.ok(proveedorRepository.save(proveedor));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@permisos.puedeGestionarProveedores(authentication.name)")
    public ResponseEntity<Void> eliminar(@PathVariable int id, Authentication auth) {
        Long negocioId = obtenerNegocioDelUsuario(auth.getName()).getId();

        return proveedorRepository.findByIdAndNegocioId(id, negocioId)
                .map(proveedor -> {
                    proveedor.setActivo(false);
                    proveedorRepository.save(proveedor);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reactivar")
    @PreAuthorize("@permisos.puedeGestionarProveedores(authentication.name)")
    public ResponseEntity<Proveedor> reactivar(@PathVariable int id, Authentication auth) {
        Long negocioId = obtenerNegocioDelUsuario(auth.getName()).getId();

        return proveedorRepository.findByIdAndNegocioId(id, negocioId)
                .map(proveedor -> {
                    proveedor.setActivo(true);
                    return ResponseEntity.ok(proveedorRepository.save(proveedor));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}