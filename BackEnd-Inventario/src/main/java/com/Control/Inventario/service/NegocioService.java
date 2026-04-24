package com.Control.Inventario.service;

import com.Control.Inventario.dto.NegocioAdminDTO;
import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.entity.User;
import com.Control.Inventario.repository.NegocioRepository;
import com.Control.Inventario.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NegocioService {

    private final UserRepository userRepository;
    private final NegocioRepository negocioRepository;
    private final AuditoriaService auditoriaService;

    public NegocioAdminDTO obtenerNegocioDelAdmin() {
        Negocio n = obtenerNegocioActual();
        return mapToDto(n);
    }

    public NegocioAdminDTO actualizarNegocioDelAdmin(NegocioAdminDTO request) {

        Negocio negocio = obtenerNegocioActual();

        negocio.setNombre(request.getNombre());
        negocio.setRubro(request.getRubro());
        negocio.setUbicacionLocal(request.getUbicacion());
        negocio.setUmbralStock(request.getUmbralStock());

        // 🔥 NUEVOS CAMPOS DEL TICKET
        negocio.setTicketCabecera(request.getTicketCabecera());
        negocio.setTicketPie(request.getTicketPie());

        Negocio negocioGuardado = negocioRepository.save(negocio);

        // 🔥 AUDITORIA: Registramos que el admin cambió la configuración
        auditoriaService.registrarAccion(
                "ACTUALIZACION",
                "Negocio",
                String.valueOf(negocioGuardado.getId()),
                "Se actualizó la configuración del negocio/ticket"
        );

        return mapToDto(negocioGuardado);
    }

    private Negocio obtenerNegocioActual() {

        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Negocio negocio = user.getNegocio();

        if (negocio == null) {
            throw new RuntimeException("Usuario sin negocio");
        }

        return negocio;
    }

    private NegocioAdminDTO mapToDto(Negocio n) {
        return new NegocioAdminDTO(
                n.getId(),
                n.getNombre(),
                n.getRubro(),
                n.getUbicacionLocal(),
                n.getUmbralStock(),
                n.getTicketCabecera(),
                n.getTicketPie()
        );
    }
}


