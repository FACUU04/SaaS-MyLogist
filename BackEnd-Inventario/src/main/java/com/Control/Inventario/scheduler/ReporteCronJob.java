package com.Control.Inventario.scheduler;

import com.Control.Inventario.entity.ConfiguracionReporte;
import com.Control.Inventario.entity.MovimientoInventario;
import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.repository.ConfiguracionReporteRepository;
import com.Control.Inventario.repository.MovimientoInventarioRepository;
import com.Control.Inventario.service.AIService;
import com.Control.Inventario.service.ReporteExcelService;
import com.Control.Inventario.notification.NotificacionService;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ReporteCronJob {

    private static final Logger logger = LoggerFactory.getLogger(ReporteCronJob.class);

    private final ConfiguracionReporteRepository configuracionRepo;
    private final MovimientoInventarioRepository movimientoRepo;
    private final ReporteExcelService excelService;
    private final AIService aiService;

    // Usamos @Qualifier para especificar que queremos usar la implementación de Email
    @Qualifier("emailNotification")
    private final NotificacionService emailService;

    @Scheduled(cron = "0 0 3 * * ?") // Todos los días a las 03:00 AM
    public void procesarReportesAutomaticos() {
        logger.info("Iniciando envío de reportes automáticos - Fecha: {}", LocalDate.now());

        // 1. Buscamos qué negocios tienen el reporte activo
        List<ConfiguracionReporte> configuraciones = configuracionRepo.findAllByActivoTrue();

        for (ConfiguracionReporte config : configuraciones) {
            try {
                Negocio negocio = config.getNegocio();

                // NOTA: Para este ejemplo traemos los movimientos de los últimos 7 días.
                // Asegúrate de tener este método en tu MovimientoInventarioRepository:
                // List<MovimientoInventario> findByNegocioAndFechaMovimientoAfter(Negocio negocio, LocalDateTime fecha);
                LocalDateTime haceUnaSemana = LocalDateTime.now().minusDays(7);
                List<MovimientoInventario> movimientos = movimientoRepo.findByNegocioAndFechaMovimientoAfter(negocio, haceUnaSemana);

                if (movimientos.isEmpty()) {
                    logger.info("El negocio {} no tuvo movimientos esta semana. Omitiendo reporte.", negocio.getNombre());
                    continue;
                }

                // 2. Armamos un texto "crudo" para que la IA lo entienda
                long totalVentas = movimientos.stream()
                        .filter(m -> m.getTipoMovimiento().name().equals("VENTA"))
                        .count();

                String datosParaIA = String.format(
                        "Negocio: %s. Total de movimientos registrados esta semana: %d. De los cuales %d fueron ventas. (Nota: Lee el excel adjunto para más detalle de productos).",
                        negocio.getNombre(), movimientos.size(), totalVentas
                );

                // 3. Generamos el resumen inteligente con Gemini
                String mensajeInteligente = aiService.generarResumenGerencial(datosParaIA);

                // 4. Generamos el Excel con los detalles
                byte[] archivoExcel = excelService.generarReporteMovimientos(movimientos, negocio.getNombre());
                String nombreArchivo = "Reporte_Inventario_" + negocio.getNombre().replace(" ", "_") + ".xlsx";
                String asunto = "📊 Tu reporte semanal de MyLogist está listo";

                // 5. ¡Enviamos el correo!
                emailService.enviarReporte(config.getEmailsDestino(), asunto, mensajeInteligente, archivoExcel, nombreArchivo);

                // 6. Actualizamos la fecha de último envío
                config.setFechaUltimoEnvio(LocalDate.now());
                configuracionRepo.save(config);

                logger.info("✅ Reporte IA enviado con éxito para: {}", negocio.getNombre());

            } catch (Exception e) {
                logger.error("❌ Error al generar reporte para negocio ID {}: {}", config.getNegocio().getId(), e.getMessage());
            }
        }

        logger.info("Procesamiento finalizado.");
    }
}