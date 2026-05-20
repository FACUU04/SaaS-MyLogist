package com.Control.Inventario.service;

import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.repository.NegocioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SuscripcionScheduler {

    private final NegocioRepository negocioRepository;
    private final NotificacionService notificacionService;

    // Se ejecuta automáticamente todos los días a las 00:00 horas
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void verificarVencimientosDePrueba() {

        System.out.println("Iniciando auditoría automática de suscripciones...");

        // Reutilizamos la consulta que armamos antes
        List<Negocio> negociosEnPrueba = negocioRepository.findNegociosEnPruebaOrdenadosPorAntiguedad();
        LocalDate hoy = LocalDate.now();
        int vencidosHoy = 0;

        for (Negocio negocio : negociosEnPrueba) {
            // Calculamos cuándo se le termina la prueba
            LocalDate fechaVencimiento = negocio.getFechaAlta().plusDays(negocio.getDiasPrueba());

            // Si la fecha de vencimiento es hoy o ya quedó en el pasado...
            if (!fechaVencimiento.isAfter(hoy)) {

                // 1. Le cambiamos el estado en la base de datos
                negocio.setEstadoSuscripcion("VENCIDO");
                negocioRepository.save(negocio);

                // 2. Le disparamos una notificación automática de nivel DANGER
                notificacionService.crearNotificacion(
                        "⚠️ Atención: Tu período de prueba ha finalizado. Por favor, regulariza tu pago para continuar utilizando la plataforma sin interrupciones.",
                        "DANGER",
                        negocio.getId(),
                        null // Le pasamos null en días de expiración para que el cartel no se borre hasta que pague
                );

                vencidosHoy++;
                System.out.println("[-] Suscripción vencida para el negocio: " + negocio.getNombre());
            }
        }

        System.out.println("Auditoría finalizada. Negocios vencidos hoy: " + vencidosHoy);
    }
}