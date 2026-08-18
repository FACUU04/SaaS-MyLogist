package com.Control.Inventario.service;

import com.Control.Inventario.dto.FacturaEscaneadaDTO;
import com.Control.Inventario.dto.ProductoFacturaDTO;
import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.entity.Producto;
import com.Control.Inventario.entity.User;
import com.Control.Inventario.repository.ProductoRepository;
import com.Control.Inventario.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductoMatchingService {

    private final ProductoRepository productoRepository;
    private final UserRepository userRepository;

    public FacturaEscaneadaDTO procesarCoincidencias(FacturaEscaneadaDTO factura, String username) {
        if (factura.getProductos() == null) return factura;

        // Obtenemos el negocio del usuario logueado
        User usuario = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Negocio negocio = usuario.getNegocio();

        for (ProductoFacturaDTO prodExtraido : factura.getProductos()) {

            // Buscamos si el producto ya existe en el negocio del cliente
            Optional<Producto> prodExistente = productoRepository
                    .findFirstByNegocioAndActivoTrueAndDescripcionContainingIgnoreCase(negocio, prodExtraido.getDescripcion().trim());

            if (prodExistente.isPresent()) {
                Producto p = prodExistente.get();
                prodExtraido.setIdProductoExistente(p.getId());
                prodExtraido.setPrecioVenta(p.getPrecio()); // Le mandamos su precio de venta actual
                prodExtraido.setEsNuevo(false);
            } else {
                prodExtraido.setIdProductoExistente(null);
                prodExtraido.setPrecioVenta(0.0); // Lo dejamos en 0 para que lo complete en React
                prodExtraido.setEsNuevo(true);
            }
        }
        return factura;
    }
}