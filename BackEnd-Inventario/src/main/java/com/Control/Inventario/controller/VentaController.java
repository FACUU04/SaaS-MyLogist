package com.Control.Inventario.controller;

import com.Control.Inventario.dto.PageResponse;
import com.Control.Inventario.dto.VentaDiariaDTO;
import com.Control.Inventario.dto.VentaRequestDTO;
import com.Control.Inventario.dto.VentaResponseDTO;
import com.Control.Inventario.mapper.VentaMapper;
import com.Control.Inventario.service.VentaService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class VentaController {

    private final VentaService ventaService;

    public VentaController(VentaService ventaService) {
        this.ventaService = ventaService;
    }

    @GetMapping
    @PreAuthorize("@permisos.puedeVender(authentication.name)")
    public PageResponse<VentaResponseDTO> listar(
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) Integer anio,
            Pageable pageable,
            Authentication authentication) {

        Page<VentaResponseDTO> page = ventaService.listarVentasDelNegocioPaginadas(mes, anio, authentication.getName(), pageable);

        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getTotalPages(),
                page.getTotalElements()
        );
    }

    @PostMapping
    @PreAuthorize("@permisos.puedeVender(authentication.name)")
    public VentaResponseDTO crear(@RequestBody VentaRequestDTO request, Authentication authentication) {
        com.Control.Inventario.entity.Venta nuevaVenta = ventaService.crearVenta(request, authentication.getName());
        return VentaMapper.toDTO(nuevaVenta);
    }

    @GetMapping("/estadisticas")
    @PreAuthorize("@permisos.puedeVender(authentication.name)")
    public List<VentaDiariaDTO> obtenerEstadisticas(
            @RequestParam Integer mes,
            @RequestParam Integer anio,
            Authentication authentication) {
        return ventaService.obtenerEstadisticasMensuales(mes, anio, authentication.getName());
    }
}