package com.Control.Inventario.controller;

import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.entity.User;
import com.Control.Inventario.repository.NegocioRepository;
import com.Control.Inventario.config.security.CustomUserDetailsService;
import com.Control.Inventario.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/superadmin/support")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPERADMIN')")
public class SuperAdminSupportController {

    private final NegocioRepository negocioRepository;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;

    @PostMapping("/impersonate/{negocioId}")
    public ResponseEntity<?> iniciarSesionComoCliente(@PathVariable Long negocioId) {

        Negocio negocio = negocioRepository.findById(negocioId)
                .orElseThrow(() -> new RuntimeException("Negocio no encontrado"));

        // FIX: Buscamos específicamente al usuario que tenga el rol de ADMIN dentro de ese negocio
        User adminCliente = negocio.getUsuarios().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN")))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Este negocio no tiene un usuario administrador registrado"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(adminCliente.getUsername());
        String nuevoTokenJwt = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(Map.of(
                "message", "Sesión generada exitosamente",
                "username", adminCliente.getUsername(),
                "token", nuevoTokenJwt
        ));
    }
}