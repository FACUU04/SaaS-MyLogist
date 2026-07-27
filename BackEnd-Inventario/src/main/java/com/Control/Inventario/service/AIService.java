package com.Control.Inventario.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.List;

@Service
public class AIService {

    private static final Logger logger = LoggerFactory.getLogger(AIService.class);

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;

    public AIService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * @param datosCrudos Un texto simple armado con los totales. Ej: "Ventas: $50K, Más vendido: X..."
     * @return El resumen redactado por la IA.
     */
    public String generarResumenGerencial(String datosCrudos) {
        String urlConKey = apiUrl + "?key=" + apiKey;

        // 1. Armamos el "Prompt" (Las instrucciones para la IA)
        String prompt = "Actúa como un asesor financiero experto para comercios minoristas. " +
                "Te daré un resumen de los datos de inventario y ventas de esta semana. " +
                "Escribe un breve mensaje de máximo 3 párrafos cortos (puedes usar emojis y viñetas) " +
                "destacando: 1) Cómo estuvieron las ventas, 2) Qué producto es el estrella, " +
                "y 3) Una advertencia sobre productos con bajo stock o sin movimiento. " +
                "Háblale directamente al dueño de forma amigable y profesional. " +
                "Datos de esta semana: " + datosCrudos;

        // 2. Construimos el JSON exacto que pide la API de Gemini
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            // 3. Enviamos la petición a Google
            Map<String, Object> response = restTemplate.postForObject(urlConKey, requestEntity, Map.class);

            // 4. Navegamos el JSON de respuesta para extraer solo el texto generado
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");

            return (String) parts.get(0).get("text");

        } catch (Exception e) {
            logger.error("Error al comunicarse con Gemini API: {}", e.getMessage());
            return "Aquí tienes el reporte de esta semana. (Nota: El análisis inteligente no está disponible en este momento).";
        }
    }
}