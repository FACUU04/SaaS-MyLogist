package com.Control.Inventario.controller;

import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.repository.NegocioRepository;
import com.Control.Inventario.service.SuperAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/superadmin")
@RequiredArgsConstructor
public class SuperAdminController {

    private final NegocioRepository negocioRepository;
    private final SuperAdminService superAdminService;

    // ---  MÉTODO ORIGINAL INTACTO ---
    @GetMapping("/negocios/paginado")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public Page<Negocio> listarNegociosPaginado(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return negocioRepository.findAll(PageRequest.of(page, size));
    }

    // ---  NUEVO MÉTODO DE BORRADO ---
    @DeleteMapping("/negocio/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<String> eliminarNegocioDefinitivo(@PathVariable Long id) {
        try {
            superAdminService.eliminarNegocioDefinitivamente(id);
            return ResponseEntity.ok("Negocio y todos sus datos eliminados correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar negocio: " + e.getMessage());
        }
    }
}
