package com.Control.Inventario.controller;

import com.Control.Inventario.dto.NegocioRequest;
import com.Control.Inventario.dto.NegocioResponseDTO;
import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.entity.User;
import com.Control.Inventario.repository.NegocioRepository;
import com.Control.Inventario.service.SuperAdminService;
import com.Control.Inventario.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/superadmin/negocios")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPERADMIN')")
public class SuperAdminNegocioController {

    private final NegocioRepository negocioRepository;
    private final UserService userService;
    private final SuperAdminService superAdminService;

    // LISTAR NEGOCIOS CON PAGINACIÓN
    @GetMapping
    public Page<NegocioResponseDTO> listarNegocios(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        return negocioRepository.findAll(pageable)
                .map(n -> {
                    Optional<User> admin = n.getUsuarios()
                            .stream()
                            .findFirst(); // asumimos 1 admin por negocio

                    return new NegocioResponseDTO(
                            n.getId(),
                            n.getNombre(),
                            n.getContactoEmail(),
                            n.getTelefono(),
                            n.isActivo(),
                            admin.map(User::getUsername).orElse(null),
                            n.getTicketCabecera(),
                            n.getTicketPie(),
                            n.getFechaAlta(),
                            n.getDiasPrueba(),
                            n.getEstadoSuscripcion()
                    );
                });
    }

    // CREAR NEGOCIO + ADMIN INICIAL
    @PostMapping
    public ResponseEntity<?> crearNegocio(@RequestBody NegocioRequest request) {

        Negocio negocio = Negocio.builder()
                .nombre(request.getNombre())
                .nroNegocio(request.getNroNegocio())
                .fechaAlta(LocalDate.now())
                // Toma el valor del request, si es null le pone 30 por defecto
                .diasPrueba(request.getDiasPrueba() != null ? request.getDiasPrueba() : 30)
                .estadoSuscripcion("PRUEBA")
                .fundacion(request.getFundacion())
                .rubro(request.getRubro())
                .ubicacionLocal(request.getUbicacionLocal())
                .contactoEmail(request.getContactoEmail())
                .telefono(request.getTelefono())
                .umbralStock(request.getUmbralStock())
                .ticketCabecera(request.getTicketCabecera() != null ? request.getTicketCabecera() : "¡Gracias por su compra!")
                .ticketPie(request.getTicketPie() != null ? request.getTicketPie() : "Vuelva pronto")
                .activo(true)
                .build();

        negocioRepository.save(negocio);

        // CREAR ADMIN INICIAL DEL NEGOCIO
        userService.crearAdminInicial(
                request.getAdminUsername(),
                request.getAdminPassword(),
                negocio
        );

        return ResponseEntity.ok(
                Map.of(
                        "message", "Negocio y admin creados correctamente",
                        "negocioId", negocio.getId()
                )
        );
    }

    // EDITAR NEGOCIO
    @PutMapping("/{id}")
    public ResponseEntity<?> editarNegocio(
            @PathVariable Long id,
            @RequestBody NegocioRequest request
    ) {

        Negocio negocio = negocioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Negocio no encontrado"));

        negocio.setNombre(request.getNombre());
        negocio.setRubro(request.getRubro());
        negocio.setTelefono(request.getTelefono());
        negocio.setContactoEmail(request.getContactoEmail());
        negocio.setUbicacionLocal(request.getUbicacionLocal());
        negocio.setUmbralStock(request.getUmbralStock());

        if (request.getTicketCabecera() != null) negocio.setTicketCabecera(request.getTicketCabecera());
        if (request.getTicketPie() != null) negocio.setTicketPie(request.getTicketPie());

        if (request.getDiasPrueba() != null) negocio.setDiasPrueba(request.getDiasPrueba());

        negocioRepository.save(negocio);

        return ResponseEntity.ok(
                Map.of("message", "Negocio actualizado correctamente")
        );
    }

    // ACTIVAR / DESACTIVAR
    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggleNegocio(@PathVariable Long id) {

        Negocio negocio = negocioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Negocio no encontrado"));

        negocio.setActivo(!negocio.isActivo());
        negocioRepository.save(negocio);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        negocio.isActivo()
                                ? "Negocio activado"
                                : "Negocio desactivado"
                )
        );
    }

    // --- NUEVO: ACTUALIZAR PLAN / SUSCRIPCIÓN ---
    @PutMapping("/{id}/suscripcion")
    public ResponseEntity<?> actualizarSuscripcion(
            @PathVariable Long id,
            @RequestParam String estado,
            @RequestParam(required = false, defaultValue = "0") Integer diasExtra
    ) {
        Negocio negocio = negocioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Negocio no encontrado"));

        negocio.setEstadoSuscripcion(estado);
        // Si le renovamos o mejoramos el plan, lo activamos automáticamente por si estaba suspendido
        negocio.setActivo(true);

        // Si es prueba y mandan días extra, se los sumamos a los días totales
        // (Ej: Si tenía 30 días, y le das 15 más, ahora tendrá 45 días totales desde su fechaAlta)
        if ("PRUEBA".equals(estado) && diasExtra > 0) {
            negocio.setDiasPrueba(negocio.getDiasPrueba() + diasExtra);
        }

        negocioRepository.save(negocio);

        return ResponseEntity.ok(
                Map.of("message", "Suscripción actualizada correctamente")
        );
    }

    // ELIMINAR NEGOCIO
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarNegocio(@PathVariable Long id) {
        superAdminService.eliminarNegocioDefinitivamente(id);
        return ResponseEntity.ok(
                Map.of("message", "Negocio eliminado correctamente")
        );
    }
}