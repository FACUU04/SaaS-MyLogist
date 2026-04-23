package com.Control.Inventario.controller;

import com.Control.Inventario.dto.NegocioAdminDTO;
import com.Control.Inventario.service.NegocioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/negocio")
@RequiredArgsConstructor
// 🔥 Sacamos el @PreAuthorize general de la clase
public class AdminNegocioController {

    private final NegocioService negocioService;


    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLEADO')")
    public NegocioAdminDTO miNegocio() {
        return negocioService.obtenerNegocioDelAdmin();
    }


    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public NegocioAdminDTO actualizarNegocio(
            @RequestBody NegocioAdminDTO request
    ) {
        return negocioService.actualizarNegocioDelAdmin(request);
    }
}