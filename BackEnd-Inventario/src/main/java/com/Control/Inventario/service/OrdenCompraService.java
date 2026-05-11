package com.Control.Inventario.service;

import com.Control.Inventario.dto.DetalleOrdenRequestDTO;
import com.Control.Inventario.dto.OrdenRequestDTO;
import com.Control.Inventario.entity.DetalleOrdenCompra;
import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.entity.OrdenCompra;
import com.Control.Inventario.entity.Producto;
import com.Control.Inventario.entity.User;
import com.Control.Inventario.model.Proveedor;
import com.Control.Inventario.model.EstadoOrden;
import com.Control.Inventario.repository.OrdenCompraRepository;
import com.Control.Inventario.repository.ProductoRepository;
import com.Control.Inventario.repository.ProveedorRepository;
import com.Control.Inventario.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class OrdenCompraService {

    private final OrdenCompraRepository ordenCompraRepository;
    private final ProveedorRepository proveedorRepository;
    private final ProductoRepository productoRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrdenCompra crearOrden(OrdenRequestDTO request, String username) {
        // Obtenemos al usuario y su negocio
        User usuario = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Negocio negocio = usuario.getNegocio();

        // Validamos que el proveedor sea de SU negocio
        Proveedor proveedor = proveedorRepository.findByIdAndNegocioId(request.getProveedorId(), negocio.getId())
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado o no pertenece a su negocio"));

        OrdenCompra nuevaOrden = new OrdenCompra();
        nuevaOrden.setNegocio(negocio); // ATAMOS LA ORDEN AL NEGOCIO
        nuevaOrden.setProveedor(proveedor);
        nuevaOrden.setFechaRecepcionEsperada(request.getFechaRecepcionEsperada());
        nuevaOrden.setEstado(EstadoOrden.PENDIENTE);
        nuevaOrden.setMetodoPago(request.getMetodoPago());
        nuevaOrden.setObservaciones(request.getObservaciones());

        double totalOrden = 0.0;

        for (DetalleOrdenRequestDTO detalleDTO : request.getDetalles()) {
            Producto producto = productoRepository.findById(detalleDTO.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            // Opcional: Validar que el producto también sea del negocio
            if (!producto.getNegocio().getId().equals(negocio.getId())) {
                throw new RuntimeException("El producto no pertenece a su negocio");
            }

            DetalleOrdenCompra detalle = new DetalleOrdenCompra();
            detalle.setProducto(producto);
            detalle.setCantidad(detalleDTO.getCantidad());
            detalle.setPrecioUnitario(detalleDTO.getPrecioUnitario());
            detalle.setObservaciones(detalleDTO.getObservaciones());

            totalOrden += detalle.getSubtotal();
            nuevaOrden.agregarDetalle(detalle);
        }

        nuevaOrden.setTotal(totalOrden);
        return ordenCompraRepository.save(nuevaOrden);
    }

    @Transactional
    public OrdenCompra confirmarRecepcionOrden(Long ordenId, String username) {
        User usuario = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Long negocioId = usuario.getNegocio().getId();

        // Validamos que la orden a recibir sea de SU negocio
        OrdenCompra orden = ordenCompraRepository.findByIdAndNegocioId(ordenId, negocioId)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada o no autorizada"));

        if (orden.getEstado() == EstadoOrden.RECIBIDA) {
            throw new RuntimeException("La orden ya fue recibida y procesada anteriormente.");
        }

        orden.setEstado(EstadoOrden.RECIBIDA);

        for (DetalleOrdenCompra detalle : orden.getDetalles()) {
            Producto producto = detalle.getProducto();
            Double nuevoStock = producto.getCantidadStock() + detalle.getCantidad();
            producto.setCantidadStock(nuevoStock);
            productoRepository.save(producto);
        }

        Proveedor proveedor = orden.getProveedor();
        proveedor.setFechaUltimaCompra(LocalDate.now());
        proveedorRepository.save(proveedor);

        return ordenCompraRepository.save(orden);
    }
}