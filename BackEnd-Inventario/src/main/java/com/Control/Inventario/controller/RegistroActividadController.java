package com.Control.Inventario.controller;

import com.Control.Inventario.model.RegistroActividad;
import com.Control.Inventario.repository.RegistroActividadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/actividad")
@RequiredArgsConstructor
public class RegistroActividadController {

    private final RegistroActividadRepository registroActividadRepository;

    @GetMapping
    public List<RegistroActividad> listar() {
        return registroActividadRepository.findAll();
    }
}

