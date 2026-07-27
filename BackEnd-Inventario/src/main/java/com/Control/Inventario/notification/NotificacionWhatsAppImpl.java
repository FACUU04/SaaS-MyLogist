package com.Control.Inventario.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service("whatsappNotification")
public class NotificacionWhatsAppImpl implements NotificacionService {

    private static final Logger logger = LoggerFactory.getLogger(NotificacionWhatsAppImpl.class);

    @Override
    public void enviarReporte(String destinatario, String asunto, String mensajeIA, byte[] archivoExcel, String nombreArchivo) {
        // Aquí irá la llamada HTTP a la API de Meta / Twilio.
        // Ejemplo conceptual:
        // String url = "https://graph.facebook.com/v17.0/TU_NUMERO/messages";
        // HttpHeaders headers = new HttpHeaders();
        // headers.setBearerAuth("TU_TOKEN");
        // ... armar el JSON con el mensajeIA y la URL del archivo ...
        // restTemplate.postForEntity(url, request, String.class);

        logger.info("Simulando envío de WhatsApp a: {}", destinatario);
        logger.info("Mensaje: {}", mensajeIA);
        logger.info("Archivo adjunto: {} ({} bytes)", nombreArchivo, archivoExcel != null ? archivoExcel.length : 0);

        // TODO: Implementar la API real de WhatsApp
    }
}