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

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;

    public AIService() {
        this.restTemplate = new RestTemplate();
    }

    public String generarResumenGerencial(String datosCrudos) {
        String promptUsuario = "Analiza los siguientes datos del inventario y genera un reporte estructurado.\n" +
                "Obligatorio usar este formato (sin saludos ni introducciones largas):\n" +
                "### 🚨 Stock Crítico\n" +
                "- (Lista máximo los 3 más urgentes)\n\n" +
                "### ⭐ Productos Estrella\n" +
                "- (Destaca 2 o 3 productos con mejor rendimiento)\n\n" +
                "### 💡 Sugerencia\n" +
                "- (Una recomendación breve de 1 línea)\n\n" +
                "Datos: " + datosCrudos;

        return procesarPeticionGroq(promptUsuario);
    }

    public String consultarAsistente(String prompt) {
        return procesarPeticionGroq(prompt);
    }

    private String procesarPeticionGroq(String promptUsuario) {
        // Creamos el rol de "Sistema" para forzar la identidad y el comportamiento
        String systemPrompt = "Eres el 'Asistente de IA de MyLogist'. " +
                "Regla 1: NUNCA menciones a Gemini, OpenAI, Groq o qué modelo de IA eres. " +
                "Regla 2: Tus respuestas deben ser EXTREMADAMENTE cortas, prolijas y directas al grano. " +
                "Regla 3: Usa siempre viñetas y texto en negrita para facilitar la lectura visual.";

        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.1-8b-instant",
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", promptUsuario)
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            Map<String, Object> response = restTemplate.postForObject(apiUrl, requestEntity, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");

            return (String) message.get("content");

        } catch (Exception e) {
            logger.error("Error al comunicarse con la API de Groq: {}", e.getMessage());
            return "Lo siento, el Asistente IA está temporalmente fuera de servicio. Intenta nuevamente más tarde.";
        }
    }
}