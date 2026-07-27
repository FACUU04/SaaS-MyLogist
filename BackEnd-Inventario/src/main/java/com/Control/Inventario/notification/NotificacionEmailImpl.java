package com.Control.Inventario.notification;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service("emailNotification")
@Primary
@RequiredArgsConstructor
public class NotificacionEmailImpl implements NotificacionService {

    private final JavaMailSender mailSender;

    @Override
    public void enviarReporte(String destinatario, String asunto, String mensajeIA, byte[] archivoExcel, String nombreArchivo) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            // El 'true' indica que el correo tendrá archivos adjuntos (multipart)
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(mensajeIA, false); // false = texto plano. Ponelo en true si luego quieres usar HTML.

            // Adjuntamos el Excel generado en memoria
            if (archivoExcel != null && archivoExcel.length > 0) {
                helper.addAttachment(nombreArchivo, new ByteArrayResource(archivoExcel));
            }

            mailSender.send(message);

        } catch (Exception e) {
            throw new RuntimeException("Error al enviar el correo a " + destinatario + ": " + e.getMessage());
        }
    }
}