package com.Control.Inventario.service;

import com.Control.Inventario.dto.DetalleVentaRequestDTO;
import com.Control.Inventario.dto.VentaDiariaDTO;
import com.Control.Inventario.dto.VentaRequestDTO;
import com.Control.Inventario.dto.VentaResponseDTO;
import com.Control.Inventario.entity.DetalleVenta;
import com.Control.Inventario.entity.Producto;
import com.Control.Inventario.entity.Venta;
import com.Control.Inventario.entity.User;
import com.Control.Inventario.entity.TurnoCaja;
import com.Control.Inventario.entity.EstadoTurno;
import com.Control.Inventario.entity.MetodoPago;
import com.Control.Inventario.mapper.VentaMapper;
import com.Control.Inventario.repository.ProductoRepository;
import com.Control.Inventario.repository.VentaRepository;
import com.Control.Inventario.repository.UserRepository;
import com.Control.Inventario.repository.TurnoCajaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final UserRepository userRepository;
    private final TurnoCajaRepository turnoCajaRepository;
    private final AuditoriaService auditoriaService; // AGREGADO

    public VentaService(VentaRepository ventaRepository,
                        ProductoRepository productoRepository,
                        UserRepository userRepository,
                        TurnoCajaRepository turnoCajaRepository,
                        AuditoriaService auditoriaService) { // INYECTADO
        this.ventaRepository = ventaRepository;
        this.productoRepository = productoRepository;
        this.userRepository = userRepository;
        this.turnoCajaRepository = turnoCajaRepository;
        this.auditoriaService = auditoriaService;
    }

    public Page<VentaResponseDTO> listarVentasDelNegocioPaginadas(Integer mes, Integer anio, String username, Pageable pageable) {
        User usuarioLogueado = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Long negocioId = usuarioLogueado.getNegocio().getId();

        return ventaRepository.findByNegocioIdAndMesAndAnio(negocioId, mes, anio, pageable)
                .map(VentaMapper::toDTO);
    }

    @Transactional
    public Venta crearVenta(VentaRequestDTO request, String username) {

        User usuarioLogueado = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        TurnoCaja turnoActivo = turnoCajaRepository.findByUsuarioAndEstado(usuarioLogueado, EstadoTurno.ABIERTO)
                .orElseThrow(() -> new RuntimeException("Debes abrir la caja antes de registrar una venta."));

        Venta venta = new Venta();
        venta.setNegocioId(usuarioLogueado.getNegocio().getId());
        venta.setTurno(turnoActivo);
        venta.setMetodoPago(request.getMetodoPago() != null ? request.getMetodoPago() : MetodoPago.EFECTIVO);

        if (request.getClienteId() != null) {
            venta.setIdCliente(request.getClienteId().intValue());
        }

        List<DetalleVenta> detalles = new ArrayList<>();
        BigDecimal importeTotal = BigDecimal.ZERO;

        for (DetalleVentaRequestDTO detalleRequest : request.getDetalles()) {

            Producto producto = productoRepository.findById(detalleRequest.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            BigDecimal cantidadVendida = detalleRequest.getCantidad();

            if (BigDecimal.valueOf(producto.getCantidadStock()).compareTo(cantidadVendida) < 0) {
                throw new RuntimeException("Stock insuficiente para el producto: " + producto.getDescripcion());
            }

            producto.setCantidadStock(
                    BigDecimal.valueOf(producto.getCantidadStock())
                            .subtract(cantidadVendida)
                            .doubleValue()
            );
            productoRepository.save(producto);

            BigDecimal precio = BigDecimal.valueOf(producto.getPrecio());
            BigDecimal subtotal = precio.multiply(cantidadVendida);

            DetalleVenta detalle = new DetalleVenta();
            detalle.setVenta(venta);
            detalle.setProducto(producto);
            detalle.setCantidad(cantidadVendida);
            detalle.setUnidadMedida(detalleRequest.getUnidadMedida());
            detalle.setImporte(subtotal);

            detalles.add(detalle);
            importeTotal = importeTotal.add(subtotal);
        }

        venta.setDetalleVentas(detalles);
        venta.setImporte(importeTotal);

        Venta ventaGuardada = ventaRepository.save(venta);

        
        // AUDITORÍA: REGISTRO DE NUEVA VENTA
        auditoriaService.registrarAccion(
                "CREACION",
                "Venta",
                String.valueOf(ventaGuardada.getNroVenta()),
                "Venta registrada por un importe total de $" + ventaGuardada.getImporte() + " usando " + ventaGuardada.getMetodoPago()
        );

        return ventaGuardada;
    }

    public List<VentaDiariaDTO> obtenerEstadisticasMensuales(Integer mes, Integer anio, String username) {
        User usuarioLogueado = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return ventaRepository.obtenerVentasDiarias(usuarioLogueado.getNegocio().getId(), mes, anio);
    }
}