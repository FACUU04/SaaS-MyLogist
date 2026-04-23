package com.Control.Inventario.controller;

import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.repository.NegocioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/superadmin")
@RequiredArgsConstructor
public class SuperAdminController {

    private final NegocioRepository negocioRepository;

    @GetMapping("/negocios/paginado")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public Page<Negocio> listarNegociosPaginado(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return negocioRepository.findAll(PageRequest.of(page, size));
    }
}
