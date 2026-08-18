package com.Control.Inventario.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.Control.Inventario.dto.FacturaEscaneadaDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
public class FacturaVisionService {

    @Value("${groq.api.key}")
    private String groqApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public FacturaEscaneadaDTO analizarImagen(MultipartFile imagen) throws Exception {
        String base64Image = Base64.getEncoder().encodeToString(imagen.getBytes());
        String mimeType = imagen.getContentType() != null ? imagen.getContentType() : "image/jpeg";
        String dataUrl = "data:" + mimeType + ";base64," + base64Image;

        // Endpoint compatible de Groq
        String url = "https://api.groq.com/openai/v1/chat/completions";

        String prompt = "Actúa como un sistema experto de extracción de datos contables. " +
                "Extrae el nombre del proveedor, la fecha y la lista de productos con cantidad y precio unitario de costo de esta factura. " +
                "REGLA ESTRICTA: Tu respuesta debe ser ÚNICAMENTE un JSON válido, sin Markdown, sin saludos. " +
                "Estructura obligatoria: " +
                "{ \"proveedor\": \"Nombre del proveedor\", \"fecha\": \"YYYY-MM-DD\", " +
                "\"productos\": [ { \"descripcion\": \"Nombre del producto\", \"cantidad\": 10, \"precioCosto\": 1500.50 } ] }";

        // Armamos el payload estilo OpenAI/Groq Vision
        Map<String, Object> textContent = Map.of("type", "text", "text", prompt);
        Map<String, Object> imageContent = Map.of("type", "image_url", "image_url", Map.of("url", dataUrl));

        Map<String, Object> message = Map.of(
                "role", "user",
                "content", List.of(textContent, imageContent)
        );

        Map<String, Object> requestBody = new HashMap<>();
        // Modelo Vision de Groq (muy rápido)
        requestBody.put("model", "llama-3.2-11b-vision-preview");
        requestBody.put("messages", List.of(message));
        requestBody.put("temperature", 0.1); // Baja temp para que no alucine datos

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        String responseJson = restTemplate.postForObject(url, request, String.class);
        return parsearRespuestaGroq(responseJson);
    }

    private FacturaEscaneadaDTO parsearRespuestaGroq(String jsonResponse) throws Exception {
        JsonNode rootNode = objectMapper.readTree(jsonResponse);
        String extractedText = rootNode.path("choices").get(0).path("message").path("content").asText();

        // Limpiamos la respuesta por si la IA devuelve tags de markdown
        String cleanJson = extractedText.replaceAll("```json", "").replaceAll("```", "").trim();
        return objectMapper.readValue(cleanJson, FacturaEscaneadaDTO.class);
    }
}