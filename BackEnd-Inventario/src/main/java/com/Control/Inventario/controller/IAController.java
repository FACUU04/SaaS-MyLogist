package com.Control.Inventario.controller;

import com.Control.Inventario.service.AIService;
import com.Control.Inventario.service.ProductoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ia")
@CrossOrigin(origins = "*")
public class IAController {

    private final AIService aiService;
    private final ProductoService productoService;

    public IAController(AIService aiService, ProductoService productoService) {
        this.aiService = aiService;
        this.productoService = productoService;
    }

    @PostMapping("/analizar-inventario")
    public ResponseEntity<?> analizarInventario(@RequestBody Map<String, String> request) {
        String tipo = request.get("tipo");

        // 1. Obtenemos el inventario crudo desde la base de datos
        String datosInventario = productoService.obtenerInventarioParaIA();

        // 2. Armamos la instrucción de la tarea a realizar (la personalidad ya está en el AIService)
        String prompt = "Analiza los siguientes datos de inventario. ";

        if ("REPOSICION".equals(tipo)) {
            prompt += "Tu objetivo es detectar qué productos están con stock crítico (cero o muy bajo) " +
                    "y hacer una lista sugerida de compras priorizada para no perder ventas. ";
        } else if ("ESTANCADOS".equals(tipo)) {
            prompt += "Tu objetivo es identificar productos que tienen mucho stock acumulado. " +
                    "Calcula el capital inmovilizado y sugiere 2 o 3 estrategias de ventas, " +
                    "promociones o descuentos creativos para lograr mover esa mercadería. ";
        } else if ("VALORIZACION".equals(tipo)) {
            prompt += "Tu objetivo es calcular el valor aproximado total del inventario (multiplicando stock por precio). " +
                    "Brinda un reporte ejecutivo destacando qué marcas o artículos concentran la mayor cantidad de dinero retenido. ";
        } else if ("ESTRELLAS".equals(tipo)) {
            // NUEVA LÓGICA PARA PRODUCTOS ESTRELLA
            prompt += "Tu objetivo es identificar los 'Productos Estrella' del negocio basándote en su valor, " +
                    "relevancia o precio. Destaca los 3 mejores artículos que deberían ser el centro de atención en redes sociales " +
                    "para maximizar las ganancias y sugiere una breve acción de marketing. ";
        } else {
            prompt += "Haz un resumen general de la salud del inventario. ";
        }

        // Reglas de formato para la respuesta
        prompt += "No saludes ni des introducciones de relleno, ve directo al análisis. " +
                "Usa un formato estructurado con títulos (###), viñetas y texto en negrita (Markdown) para facilitar la lectura visual.\n\n" +
                "Datos a analizar:\n" + datosInventario;

        // 3. Enviamos al Asistente de IA (Método actualizado)
        String respuestaIA = aiService.consultarAsistente(prompt);

        // 4. Devolvemos el resultado al frontend
        return ResponseEntity.ok(Map.of("mensaje", respuestaIA));
    }
}