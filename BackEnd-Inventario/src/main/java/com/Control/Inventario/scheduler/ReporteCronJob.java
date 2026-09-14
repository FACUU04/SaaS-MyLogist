package com.Control.Inventario.scheduler;

import com.Control.Inventario.entity.MovimientoInventario;
import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.repository.MovimientoInventarioRepository;
import com.Control.Inventario.repository.NegocioRepository;
import com.Control.Inventario.service.AIService;
import com.Control.Inventario.service.EmailService;
import com.Control.Inventario.service.NotificacionService; // Usamos tu servicio de notificaciones
import com.Control.Inventario.service.ReporteExcelService;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.DayOfWeek;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ReporteCronJob {

    private static final Logger logger = LoggerFactory.getLogger(ReporteCronJob.class);

    private final NegocioRepository negocioRepo;
    private final MovimientoInventarioRepository movimientoRepo;
    private final ReporteExcelService excelService;
    private final AIService aiService;
    private final EmailService emailService;
    private final NotificacionService notificacionService;

    @Scheduled(cron = "0 0 3 * * ?") // Todos los días a las 03:00 AM
    public void procesarReportesAutomaticos() {
        logger.info("Iniciando envío de reportes automáticos - Fecha: {}", LocalDate.now());
        LocalDate hoy = LocalDate.now();

        // 1. Buscamos directamente en Negocio quién tiene la IA activa
        List<Negocio> negociosActivosConIA = negocioRepo.findByReporteIaActivoTrueAndActivoTrue();

        for (Negocio negocio : negociosActivosConIA) {
            try {
                // 2. Verificamos si HOY le toca reporte según su frecuencia
                if (!debeEjecutarseHoy(negocio.getReporteIaFrecuencia(), hoy)) {
                    continue;
                }

                // Traemos los movimientos (ejemplo últimos 7 días, o podrías ajustarlo según frecuencia)
                LocalDateTime haceUnaSemana = LocalDateTime.now().minusDays(7);
                List<MovimientoInventario> movimientos = movimientoRepo.findByNegocioAndFechaMovimientoAfter(negocio, haceUnaSemana);

                if (movimientos.isEmpty()) {
                    logger.info("El negocio {} no tuvo movimientos. Omitiendo reporte.", negocio.getNombre());
                    continue;
                }

                // 3. Generamos texto para la IA y consultamos a Groq
                long totalVentas = movimientos.stream()
                        .filter(m -> m.getTipoMovimiento().name().equals("VENTA"))
                        .count();

                String datosParaIA = String.format(
                        "Negocio: %s. Total movimientos periodo: %d. Ventas: %d.",
                        negocio.getNombre(), movimientos.size(), totalVentas
                );
                String mensajeInteligente = aiService.generarResumenGerencial(datosParaIA);

                // 4. DECISIÓN DE CANAL: ¿Mail o Sistema?
                if ("EMAIL".equalsIgnoreCase(negocio.getReporteIaCanal())) {

                    byte[] archivoExcel = excelService.generarReporteMovimientos(movimientos, negocio.getNombre());
                    String nombreArchivo = "Reporte_Inventario_" + negocio.getNombre().replace(" ", "_") + ".xlsx";
                    String asunto = "📊 Tu reporte inteligente de MyLogist está listo";
                    String destino = negocio.getReporteIaDestino();

                    if (destino != null && !destino.isEmpty()) {
                        emailService.enviarReporteConAdjunto(destino, asunto, mensajeInteligente, archivoExcel, nombreArchivo);
                        logger.info("✅ Reporte IA enviado por EMAIL a: {}", negocio.getNombre());
                    }

                } else if ("SISTEMA".equalsIgnoreCase(negocio.getReporteIaCanal())) {

                    // Si eligió SISTEMA, le creamos una Notificación interna
                    notificacionService.crearNotificacion(
                            "Reporte IA de hoy:\n" + mensajeInteligente,
                            "INFO",
                            negocio.getId(),
                            7 // Días antes de que expire la notificación
                    );
                    logger.info("✅ Reporte IA generado en SISTEMA para: {}", negocio.getNombre());
                }

            } catch (Exception e) {
                logger.error("❌ Error al generar reporte para negocio {}: {}", negocio.getNombre(), e.getMessage());
            }
        }
        logger.info("Procesamiento de reportes finalizado.");
    }

    // Función auxiliar para saber cuándo disparar el reporte
    private boolean debeEjecutarseHoy(String frecuencia, LocalDate hoy) {
        if (frecuencia == null) return false;

        switch (frecuencia.toUpperCase()) {
            case "DIARIO":
                return true;
            case "SEMANAL":
                return hoy.getDayOfWeek() == DayOfWeek.MONDAY; // Solo los lunes
            case "QUINCENAL":
                return hoy.getDayOfMonth() == 1 || hoy.getDayOfMonth() == 15;
            case "MENSUAL":
                return hoy.getDayOfMonth() == 1; // Solo el día 1 del mes
            default:
                return false;
        }
    }
}