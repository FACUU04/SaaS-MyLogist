package com.Control.Inventario.controller;

import com.Control.Inventario.dto.NegocioRequest;
import com.Control.Inventario.dto.NegocioResponseDTO;
import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.entity.User;
import com.Control.Inventario.repository.NegocioRepository;
import com.Control.Inventario.service.SuperAdminService;
import com.Control.Inventario.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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

    // LISTAR NEGOCIOS
    @GetMapping
    public List<NegocioResponseDTO> listarNegocios() {
        return negocioRepository.findAll()
                .stream()
                .map(n -> {

                    Optional<User> admin = n.getUsuarios()
                            .stream()
                            .findFirst(); // asumimos 1 admin por negocio

                    // Ahora pasamos los 8 parámetros del DTO
                    return new NegocioResponseDTO(
                            n.getId(),
                            n.getNombre(),
                            n.getContactoEmail(),
                            n.getTelefono(),
                            n.isActivo(),
                            admin.map(User::getUsername).orElse(null),
                            n.getTicketCabecera(),
                            n.getTicketPie()
                    );
                })
                .toList();
    }

    // CREAR NEGOCIO + ADMIN INICIAL
    @PostMapping
    public ResponseEntity<?> crearNegocio(@RequestBody NegocioRequest request) {

        Negocio negocio = Negocio.builder()
                .nombre(request.getNombre())
                .nroNegocio(request.getNroNegocio())
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

    // ELIMINAR NEGOCIO
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarNegocio(@PathVariable Long id) {

        // Usamos el borrado en cascada en vez del deleteById
        superAdminService.eliminarNegocioDefinitivamente(id);

        return ResponseEntity.ok(
                Map.of("message", "Negocio eliminado correctamente")
        );
    }
}