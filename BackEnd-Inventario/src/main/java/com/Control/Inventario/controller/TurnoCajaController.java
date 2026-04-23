package com.Control.Inventario.controller;

import com.Control.Inventario.dto.AbrirTurnoRequest;
import com.Control.Inventario.dto.CerrarTurnoRequest;
import com.Control.Inventario.service.TurnoCajaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/turnos")
@RequiredArgsConstructor
public class TurnoCajaController {

    private final TurnoCajaService turnoCajaService;

    @PostMapping("/abrir")
    public ResponseEntity<?> abrirTurno(@RequestBody AbrirTurnoRequest req) {
        return turnoCajaService.abrirTurno(req);
    }

    @GetMapping("/activo")
    public ResponseEntity<?> obtenerTurnoActivo() {
        return turnoCajaService.obtenerTurnoActivo();
    }

    @PostMapping("/cerrar")
    public ResponseEntity<?> cerrarTurno(@RequestBody CerrarTurnoRequest req) {
        return turnoCajaService.cerrarTurno(req);
    }
}