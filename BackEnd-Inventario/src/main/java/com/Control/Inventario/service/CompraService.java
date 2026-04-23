package com.Control.Inventario.service;

import com.Control.Inventario.dto.CompraMultipleDTO;
import com.Control.Inventario.mapper.CompraMultipleMapper;
import com.Control.Inventario.model.Compra;
import com.Control.Inventario.model.CompraDetalle;
import com.Control.Inventario.model.Proveedor;
import com.Control.Inventario.entity.User;
import com.Control.Inventario.repository.CompraDetalleRepository;
import com.Control.Inventario.repository.CompraRepository;
import com.Control.Inventario.repository.ProveedorRepository;
import com.Control.Inventario.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompraService {

    private final CompraRepository compraRepository;
    private final CompraDetalleRepository compraDetalleRepository;
    private final UserRepository userRepository;
    private final ProveedorRepository proveedorRepository;

    // compra simple
    @Transactional
    public Compra save(Compra compra, String username) {
        User usuarioLogueado = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Validar que el proveedor esté activo
        Proveedor proveedor = proveedorRepository.findById(compra.getIdProveedor().intValue()) // Ajustá el intValue() si tu ID es Long en Proveedor
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));

        if (proveedor.getActivo() != null && !proveedor.getActivo()) {
            throw new RuntimeException("No se puede registrar una compra a un proveedor inactivo.");
        }

        compra.setNegocioId(usuarioLogueado.getNegocio().getId());
        return compraRepository.save(compra);
    }

    // compra con múltiples detalles
    @Transactional
    public Compra saveMultiple(CompraMultipleDTO dto, String username) {

        User usuarioLogueado = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));


        Proveedor proveedor = proveedorRepository.findById(dto.getIdProveedor().intValue()) // Ajustá el intValue() si es necesario
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));

        if (proveedor.getActivo() != null && !proveedor.getActivo()) {
            throw new RuntimeException("No se puede registrar una compra a un proveedor inactivo.");
        }

        Compra compra = CompraMultipleMapper.toCompraEntity(dto);
        compra.setNegocioId(usuarioLogueado.getNegocio().getId());

        Compra compraGuardada = compraRepository.save(compra);
        Long idCompra = compraGuardada.getId();

        List<CompraDetalle> detalles = CompraMultipleMapper.toDetalleEntities(idCompra, dto);
        compraDetalleRepository.saveAll(detalles);

        return compraGuardada;
    }

    public List<CompraDetalle> getDetalles(Long idCompra) {
        return compraDetalleRepository.findByIdCompra(idCompra);
    }
}