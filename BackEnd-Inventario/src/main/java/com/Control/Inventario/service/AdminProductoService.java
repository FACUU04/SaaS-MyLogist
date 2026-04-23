package com.Control.Inventario.service;

import com.Control.Inventario.dto.ProductoResponseDTO;
import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.mapper.ProductoMapper;
import com.Control.Inventario.repository.NegocioRepository;
import com.Control.Inventario.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminProductoService {

    private final ProductoRepository productoRepository;
    private final NegocioRepository negocioRepository;

    public Page<ProductoResponseDTO> listarProductosPorNegocio(
            Long negocioId,
            Pageable pageable
    ) {
        Negocio negocio = negocioRepository.findById(negocioId)
                .orElseThrow(() ->
                        new RuntimeException("Negocio no encontrado")
                );

        return productoRepository
                .findAllByNegocio(negocio, pageable)
                .map(ProductoMapper::toDto);
    }
}

