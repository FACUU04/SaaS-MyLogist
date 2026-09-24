package com.Control.Inventario.service;

import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.repository.NegocioRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SuscripcionScheduler {

    private static final Logger log = LoggerFactory.getLogger(SuscripcionScheduler.class);
    private final NegocioRepository negocioRepository;
    private final EmailService emailService; // Inyectado para notificar el corte

    /**
     * Este método se ejecuta automáticamente todos los días a la 01:00 AM.
     */
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void verificarVencimientosPrueba() {
        log.info("Iniciando revisión automática de vencimientos de suscripción...");

        List<Negocio> negociosEnPrueba = negocioRepository.findByEstadoSuscripcionAndActivo("PRUEBA", true);
        LocalDate hoy = LocalDate.now();
        int negociosSuspendidos = 0;

        for (Negocio negocio : negociosEnPrueba) {
            LocalDate fechaVencimiento = negocio.getFechaAlta().plusDays(negocio.getDiasPrueba());

            if (hoy.isEqual(fechaVencimiento) || hoy.isAfter(fechaVencimiento)) {
                log.info("El negocio '{}' superó su prueba (Vencimiento: {}). Suspendiendo servicio...",
                        negocio.getNombre(), fechaVencimiento);

                negocio.setEstadoSuscripcion("VENCIDO");
                negocio.setActivo(false);

                negocioRepository.save(negocio);
                negociosSuspendidos++;

                // Enviar correo de notificación de suspensión al cliente
                if (negocio.getContactoEmail() != null && !negocio.getContactoEmail().isEmpty()) {
                    String subject = "Tu prueba en MyLogist ha finalizado";
                    String body = "Hola " + negocio.getNombre() + ",\n\n" +
                            "Tus 14 días de prueba gratuita han concluido y tu acceso ha sido suspendido temporalmente.\n\n" +
                            "No te preocupes, toda tu información sigue guardada segura en nuestros servidores. Para recuperar el acceso a tu inventario y aprovechar la promoción exclusiva, responde a este correo para activar tu plan.\n\n" +
                            "Saludos,\nFacundo de MyLogist";

                    emailService.sendEmail(negocio.getContactoEmail(), subject, body);
                }
            }
        }

        log.info("Revisión de suscripciones finalizada. Se suspendieron {} negocios hoy.", negociosSuspendidos);
    }
}