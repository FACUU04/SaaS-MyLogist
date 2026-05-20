package com.Control.Inventario.controller;

import com.Control.Inventario.entity.Notificacion;
import com.Control.Inventario.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/superadmin/notificaciones")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPERADMIN')")
public class SuperAdminNotificacionController {

    private final NotificacionService notificacionService;

    public record NotificacionRequest(
            String mensaje,
            String nivelAlerta,
            Long negocioId,
            Integer diasExpiracion
    ) {}

    @PostMapping
    public ResponseEntity<?> enviarAviso(@RequestBody NotificacionRequest request) {
        Notificacion nueva = notificacionService.crearNotificacion(
                request.mensaje(),
                request.nivelAlerta(),
                request.negocioId(),
                request.diasExpiracion()
        );
        return ResponseEntity.ok(Map.of("message", "Aviso despachado correctamente"));
    }

    @GetMapping
    public ResponseEntity<?> listarAvisosEnviados() {
        // Limpiamos los datos para evitar el ByteBuddyInterceptor (Lazy Loading)
        List<Map<String, Object>> respuestaLimpia = notificacionService.obtenerHistorialCompleto().stream().map(n -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", n.getId());
            map.put("mensaje", n.getMensaje());
            map.put("nivelAlerta", n.getNivelAlerta());
            map.put("activa", n.getActiva()); 

            if (n.getNegocio() != null) {
                map.put("negocio", Map.of("id", n.getNegocio().getId()));
            } else {
                map.put("negocio", null);
            }
            return map;
        }).toList();

        return ResponseEntity.ok(respuestaLimpia);
    }

    @PutMapping("/{id}/desactivar")
    public ResponseEntity<?> apagarAviso(@PathVariable Long id) {
        notificacionService.desactivarNotificacion(id);
        return ResponseEntity.ok(Map.of("message", "El aviso fue desactivado"));
    }
}