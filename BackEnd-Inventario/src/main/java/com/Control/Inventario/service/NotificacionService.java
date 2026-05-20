package com.Control.Inventario.service;

import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.entity.Notificacion;
import com.Control.Inventario.repository.NegocioRepository;
import com.Control.Inventario.repository.NotificacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final NegocioRepository negocioRepository;

    // CREAR NOTIFICACIÓN (Global o Específica)
    public Notificacion crearNotificacion(String mensaje, String nivelAlerta, Long negocioId, Integer diasExpiracion) {

        Notificacion.NotificacionBuilder builder = Notificacion.builder()
                .mensaje(mensaje)
                .nivelAlerta(nivelAlerta)
                .activa(true);

        // Si mandamos un ID, es para un cliente específico. Si es null, es GLOBAL.
        if (negocioId != null) {
            Negocio negocio = negocioRepository.findById(negocioId)
                    .orElseThrow(() -> new RuntimeException("Negocio no encontrado para asignar la notificación"));
            builder.negocio(negocio);
        }

        // Si queremos que el aviso se borre solo después de X días
        if (diasExpiracion != null && diasExpiracion > 0) {
            builder.fechaExpiracion(LocalDateTime.now().plusDays(diasExpiracion));
        }

        return notificacionRepository.save(builder.build());
    }

    // LISTAR PARA EL PANEL DEL SUPER ADMIN (Historial completo)
    public List<Notificacion> obtenerHistorialCompleto() {
        // Acá podríamos usar paginación también en el futuro si crece mucho
        return notificacionRepository.findAll();
    }

    // LISTAR PARA EL CLIENTE (Avisos activos globales + los suyos)
    public List<Notificacion> obtenerAvisosParaNegocio(Long negocioId) {
        return notificacionRepository.findActivasByNegocioOrGlobal(negocioId);
    }

    // APAGAR UNA NOTIFICACIÓN MANUALMENTE
    public void desactivarNotificacion(Long notificacionId) {
        Notificacion notificacion = notificacionRepository.findById(notificacionId)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));

        notificacion.setActiva(false);
        notificacionRepository.save(notificacion);
    }
}