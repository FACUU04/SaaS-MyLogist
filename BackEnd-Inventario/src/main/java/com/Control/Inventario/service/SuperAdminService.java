package com.Control.Inventario.service;

import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final NegocioRepository negocioRepository;
    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ClienteRepository clienteRepository;
    private final EmpleadoRepository empleadoRepository;
    private final UserRepository userRepository;

    @Transactional
    public void eliminarNegocioDefinitivamente(Long negocioId) {
        Negocio negocio = negocioRepository.findById(negocioId)
                .orElseThrow(() -> new RuntimeException("Negocio no encontrado"));

        // Borrado en cascada manual
        ventaRepository.deleteByNegocioId(negocioId);
        productoRepository.deleteByNegocioId(negocioId);
        categoriaRepository.deleteByNegocioId(negocioId);
        clienteRepository.deleteByNegocioId(negocioId);
        empleadoRepository.deleteByNegocioId(negocioId);
        userRepository.deleteByNegocioId(negocioId);

        negocioRepository.delete(negocio);
    }
}
