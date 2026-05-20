package com.Control.Inventario.controller;

import com.Control.Inventario.entity.User;
import com.Control.Inventario.service.NotificacionService;
import com.Control.Inventario.config.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class ClienteNotificacionController {

    private final NotificacionService notificacionService;

    @GetMapping("/mis-avisos")
    public ResponseEntity<?> obtenerMisAvisos(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User usuario = userDetails.getUser();

        // Si por algún motivo el usuario no pertenece a un negocio, devolvemos lista vacía
        if (usuario.getNegocio() == null) {
            return ResponseEntity.ok(List.of());
        }

        // Usamos TU método obtenerAvisosParaNegocio y limpiamos el JSON
        List<Map<String, Object>> avisosLimpios = notificacionService.obtenerAvisosParaNegocio(usuario.getNegocio().getId())
                .stream().map(n -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", n.getId());
                    map.put("mensaje", n.getMensaje());
                    map.put("nivelAlerta", n.getNivelAlerta());
                    return map;
                }).toList();

        return ResponseEntity.ok(avisosLimpios);
    }
}