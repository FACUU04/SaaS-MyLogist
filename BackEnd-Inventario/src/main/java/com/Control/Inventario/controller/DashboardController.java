package com.Control.Inventario.controller;

import com.Control.Inventario.dto.DashboardDTO;
import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.entity.User;
import com.Control.Inventario.repository.UserRepository;
import com.Control.Inventario.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository; // Lo inyectamos para buscar al usuario logueado

    @GetMapping("/resumen")
    public ResponseEntity<DashboardDTO> getResumenDashboard(Principal principal) {

        // 1. Obtenemos el username directamente del token/sesión de Spring Security
        String username = principal.getName();

        // 2. Buscamos el objeto User completo en la base de datos
        User usuarioLogueado = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado en el sistema"));

        // 3. Extraemos el negocio al que pertenece este usuario (sea admin o empleado)
        Negocio negocioActual = usuarioLogueado.getNegocio();

        // 4. Procesamos los números usando el servicio ultra rápido que armamos
        DashboardDTO resumen = dashboardService.obtenerResumen(negocioActual);

        // 5. Devolvemos el JSON limpio al frontend
        return ResponseEntity.ok(resumen);
    }
}
