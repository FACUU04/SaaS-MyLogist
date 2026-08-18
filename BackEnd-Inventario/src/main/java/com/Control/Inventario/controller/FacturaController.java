package com.Control.Inventario.controller;

import com.Control.Inventario.dto.FacturaEscaneadaDTO;
import com.Control.Inventario.service.FacturaVisionService;
import com.Control.Inventario.service.ProductoMatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@RestController
@RequestMapping("/api/proveedores")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class FacturaController {

    private final FacturaVisionService facturaVisionService;
    private final ProductoMatchingService productoMatchingService;

    @PostMapping(value = "/escanear-factura", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> escanearFactura(@RequestParam("imagen") MultipartFile imagen, Principal principal) {
        try {
            if (imagen.isEmpty()) {
                return ResponseEntity.badRequest().body("La imagen no puede estar vacía.");
            }

            // 1. Extraer datos con el modelo Vision de Groq
            FacturaEscaneadaDTO facturaDto = facturaVisionService.analizarImagen(imagen);

            // 2. Hacer matching con la base de datos del Negocio del usuario
            String username = principal.getName();
            FacturaEscaneadaDTO facturaProcesada = productoMatchingService.procesarCoincidencias(facturaDto, username);

            return ResponseEntity.ok(facturaProcesada);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al procesar la factura: " + e.getMessage());
        }
    }
}