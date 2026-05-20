package com.Control.Inventario.service;

import com.Control.Inventario.config.security.SecurityUtils;
import com.Control.Inventario.dto.AuditoriaResponseDTO;
import com.Control.Inventario.entity.Auditoria;
import com.Control.Inventario.repository.AuditoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditoriaService {

    private final AuditoriaRepository auditoriaRepository;
    private final SecurityUtils securityUtils;


    public void registrarAccion(String accion, String entidad, String entidadId, String detalles) {

        // Extraemos los datos usando  SecurityUtils (Usuario y Negocio)
        String usuarioActual = securityUtils.getCurrentUser().getUsername();
        Long negocioIdActual = securityUtils.getCurrentNegocio().getId();

        Auditoria auditoria = Auditoria.builder()
                .usuario(usuarioActual)
                .accion(accion)
                .entidad(entidad)
                .entidadId(entidadId)
                .detalles(detalles)
                .fechaHora(LocalDateTime.now())
                .negocioId(negocioIdActual)
                .build();

        auditoriaRepository.save(auditoria);
    }


    public List<AuditoriaResponseDTO> obtenerHistorial() {
        Long negocioId = securityUtils.getCurrentNegocio().getId();

        // TOP 15 para no saturar el Dashboard
        return auditoriaRepository.findTop15ByNegocioIdOrderByFechaHoraDesc(negocioId)
                .stream()
                .map(aud -> new AuditoriaResponseDTO(
                        aud.getId(),
                        aud.getUsuario(),
                        aud.getAccion(),
                        aud.getEntidad(),
                        aud.getEntidadId(),
                        aud.getDetalles(),
                        aud.getFechaHora()
                ))
                .toList();
    }
}