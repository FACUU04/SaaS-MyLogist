package com.Control.Inventario.controller;

import com.Control.Inventario.dto.EmpleadoRequestDTO;
import com.Control.Inventario.dto.EmpleadoResponseDTO;
import com.Control.Inventario.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/empleados")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class EmpleadoController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<EmpleadoResponseDTO> listarEmpleados(Authentication auth) {
        return userService.listarEmpleadosDelNegocio(auth.getName());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public EmpleadoResponseDTO crearEmpleado(@Valid @RequestBody EmpleadoRequestDTO request, Authentication auth) {
        return userService.crearEmpleado(request, auth.getName());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public EmpleadoResponseDTO actualizarEmpleado(@PathVariable Long id, @Valid @RequestBody EmpleadoRequestDTO request, Authentication auth) {
        return userService.actualizarEmpleado(id, request, auth.getName());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminarEmpleado(@PathVariable Long id, Authentication auth) {
        userService.eliminarEmpleado(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}

