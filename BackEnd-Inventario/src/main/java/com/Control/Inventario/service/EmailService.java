package com.Control.Inventario.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    // Mail simple sin adjuntos
    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        message.setFrom("contactomylogist@gmail.com");
        mailSender.send(message);
    }

    // NUEVO: Mail con el reporte Excel adjunto
    public void enviarReporteConAdjunto(String to, String subject, String body, byte[] attachment, String fileName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            // El 'true' indica que es multipart (soporta adjuntos)
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom("contactomylogist@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body);

            // Agregamos el archivo Excel
            helper.addAttachment(fileName, new ByteArrayResource(attachment));

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar el correo con adjunto: " + e.getMessage());
        }
    }
}