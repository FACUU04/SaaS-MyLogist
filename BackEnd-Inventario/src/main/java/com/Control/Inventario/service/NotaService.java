package com.Control.Inventario.service;

import com.Control.Inventario.config.security.SecurityUtils;
import com.Control.Inventario.dto.NotaDTO;
import com.Control.Inventario.entity.Nota;
import com.Control.Inventario.repository.NotaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotaService {

    private final NotaRepository notaRepository;
    private final SecurityUtils securityUtils;

    public List<NotaDTO> obtenerNotas() {
        Long negocioId = securityUtils.getCurrentNegocio().getId();
        return notaRepository.findByNegocioIdOrderByFechaCreacionDesc(negocioId)
                .stream()
                .map(n -> new NotaDTO(n.getId(), n.getContenido(), n.getUsuario(), n.getFechaCreacion()))
                .toList();
    }

    public NotaDTO crearNota(String contenido) {
        String usuario = securityUtils.getCurrentUser().getUsername();
        Long negocioId = securityUtils.getCurrentNegocio().getId();

        Nota nota = Nota.builder()
                .contenido(contenido)
                .usuario(usuario)
                .fechaCreacion(LocalDateTime.now())
                .negocioId(negocioId)
                .build();

        Nota guardada = notaRepository.save(nota);
        return new NotaDTO(guardada.getId(), guardada.getContenido(), guardada.getUsuario(), guardada.getFechaCreacion());
    }

    public void eliminarNota(Long id) {
        // Validamos que la nota pertenezca al negocio actual antes de borrarla
        Nota nota = notaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nota no encontrada"));

        if (!nota.getNegocioId().equals(securityUtils.getCurrentNegocio().getId())) {
            throw new RuntimeException("No tienes permiso para eliminar esta nota");
        }

        notaRepository.delete(nota);
    }
}