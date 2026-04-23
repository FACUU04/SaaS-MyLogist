package com.Control.Inventario.controller;

import com.Control.Inventario.dto.NotaDTO;
import com.Control.Inventario.service.NotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notas")
@RequiredArgsConstructor
public class NotaController {

    private final NotaService notaService;

    @GetMapping
    public ResponseEntity<List<NotaDTO>> listarNotas() {
        return ResponseEntity.ok(notaService.obtenerNotas());
    }

    @PostMapping
    public ResponseEntity<NotaDTO> crearNota(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(notaService.crearNota(request.get("contenido")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarNota(@PathVariable Long id) {
        notaService.eliminarNota(id);
        return ResponseEntity.ok("Nota eliminada");
    }
}