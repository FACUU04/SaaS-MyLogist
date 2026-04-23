package com.Control.Inventario.controller;

import com.Control.Inventario.dto.ClienteRequest;
import com.Control.Inventario.dto.ClienteResponseDTO;
import com.Control.Inventario.service.ClienteService;
import com.Control.Inventario.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AdminClienteController {

    private final ClienteService clienteService;
    private final ClienteRepository clienteRepository;


    @GetMapping
    public Page<ClienteResponseDTO> listar(Pageable pageable) {
        return clienteService.listar(pageable);
    }

    @PostMapping
    public ClienteResponseDTO crear(@RequestBody ClienteRequest request) {
        return clienteService.crear(request);
    }

    @PutMapping("/{id}")
    public ClienteResponseDTO actualizar(
            @PathVariable Long id,
            @RequestBody ClienteRequest request
    ) {
        return clienteService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        return clienteRepository.findById(id)
                .map(cliente -> {
                    // Borrado Lógico: Lo "apagamos" para no romper el historial de ventas
                    cliente.setActivo(false);
                    clienteRepository.save(cliente);

                    // Devolvemos un JSON válido para que el api.js de React no explote
                    return ResponseEntity.ok().body("{\"mensaje\": \"Cliente deshabilitado correctamente\"}");
                })
                .orElse(ResponseEntity.notFound().build());
    }


    @PutMapping("/{id}/reactivar")
    public ResponseEntity<?> reactivar(@PathVariable Long id) {
        return clienteRepository.findById(id)
                .map(cliente -> {
                    cliente.setActivo(true);

                    clienteRepository.save(cliente);

                    return ResponseEntity.ok().body("{\"mensaje\": \"Cliente reactivado correctamente\"}");
                })
                .orElse(ResponseEntity.notFound().build());
    }
}