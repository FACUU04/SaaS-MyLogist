package com.Control.Inventario.controller;

import com.Control.Inventario.repository.NegocioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/superadmin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPERADMIN')")
public class SuperAdminDashboardController {

    private final NegocioRepository negocioRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        // Obtenemos los contadores reales
        long totalActivos = negocioRepository.countByActivo(true);
        long totalPrueba = negocioRepository.countByEstadoSuscripcion("PRUEBA");

        // Traemos la lista de negocios que están en período de prueba, ordenados por antigüedad
        var proximosVencimientos = negocioRepository.findNegociosEnPruebaOrdenadosPorAntiguedad();

        return ResponseEntity.ok(Map.of(
                "totalActivos", totalActivos,
                "totalPrueba", totalPrueba,
                "proximosVencimientos", proximosVencimientos
        ));
    }
}