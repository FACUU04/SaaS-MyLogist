package com.Control.Inventario.controller;

import com.Control.Inventario.dto.AuditoriaResponseDTO;
import com.Control.Inventario.service.AuditoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/auditoria")
@RequiredArgsConstructor
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    @GetMapping
    public ResponseEntity<List<AuditoriaResponseDTO>> obtenerHistorial() {
        // El servicio ya filtra por el negocio del usuario logueado
        List<AuditoriaResponseDTO> historial = auditoriaService.obtenerHistorial();
        return ResponseEntity.ok(historial);
    }
}