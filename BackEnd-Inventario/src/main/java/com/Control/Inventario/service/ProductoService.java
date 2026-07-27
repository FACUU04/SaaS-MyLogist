package com.Control.Inventario.service;

import com.Control.Inventario.dto.ProductoRequest;
import com.Control.Inventario.dto.ProductoResponseDTO;
import com.Control.Inventario.entity.Categoria;
import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.entity.Producto;
// NUEVAS IMPORTACIONES
import com.Control.Inventario.entity.MovimientoInventario;
import com.Control.Inventario.entity.TipoMovimiento;
import com.Control.Inventario.repository.MovimientoInventarioRepository;

import com.Control.Inventario.mapper.ProductoMapper;
import com.Control.Inventario.repository.CategoriaRepository;
import com.Control.Inventario.repository.ProductoRepository;
import com.Control.Inventario.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final UserRepository userRepository;
    private final AuditoriaService auditoriaService;
    // INYECTAMOS EL NUEVO REPOSITORIO
    private final MovimientoInventarioRepository movimientoInventarioRepository;

    public ProductoResponseDTO buscarPorCodigoBarras(String codigoBarras) {
        Negocio negocio = obtenerNegocioActual();

        Producto producto = productoRepository
                .findByCodigoBarrasAndNegocioAndActivoTrue(codigoBarras, negocio)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado o inactivo para este código de barras"));

        return ProductoMapper.toDto(producto);
    }

    public Page<ProductoResponseDTO> listarProductosDelNegocio(String busqueda, Pageable pageable) {
        Negocio negocio = obtenerNegocioActual();
        if (busqueda == null || busqueda.trim().isEmpty()) {
            return productoRepository
                    .findAllByNegocioAndActivoTrue(negocio, pageable)
                    .map(ProductoMapper::toDto);
        }
        return productoRepository
                .buscarConFiltro(negocio, true, busqueda, pageable)
                .map(ProductoMapper::toDto);
    }

    public Page<ProductoResponseDTO> listarProductosEliminados(String busqueda, Pageable pageable) {
        Negocio negocio = obtenerNegocioActual();
        if (busqueda == null || busqueda.trim().isEmpty()) {
            return productoRepository
                    .findAllByNegocioAndActivoFalse(negocio, pageable)
                    .map(ProductoMapper::toDto);
        }
        return productoRepository
                .buscarConFiltro(negocio, false, busqueda, pageable)
                .map(ProductoMapper::toDto);
    }

    @Transactional // Agregamos Transactional para asegurar que se guarde el producto y el movimiento juntos
    public ProductoResponseDTO crearProducto(ProductoRequest request) {
        Negocio negocio = obtenerNegocioActual();
        Categoria categoria = null;

        if (request.getCategoriaId() != null) {
            categoria = categoriaRepository
                    .findByIdAndNegocio(request.getCategoriaId(), negocio)
                    .orElseThrow(() -> new RuntimeException("Categoría inválida"));
        }

        Producto producto = new Producto();
        producto.setMarca(request.getMarca());
        producto.setDescripcion(request.getDescripcion());
        producto.setCodigoFabricante(request.getCodigoFabricante());
        producto.setCodigoBarras(request.getCodigoBarras());
        producto.setStockMinimo(request.getStockMinimo() != null ? request.getStockMinimo() : 0.0);
        producto.setPrecio(request.getPrecio());
        producto.setCantidadStock(request.getCantidadStock());
        producto.setUnidad(request.getUnidad());
        producto.setCategoria(categoria);
        producto.setNegocio(negocio);

        Producto productoGuardado = productoRepository.save(producto);

        // NUEVO: SI EL PRODUCTO SE CREA CON STOCK INICIAL > 0, REGISTRAMOS EL MOVIMIENTO
        if (productoGuardado.getCantidadStock() != null && productoGuardado.getCantidadStock() > 0) {
            MovimientoInventario mov = new MovimientoInventario(
                    productoGuardado,
                    negocio,
                    productoGuardado.getCantidadStock(),
                    TipoMovimiento.AJUSTE_MANUAL,
                    "Stock inicial al crear producto",
                    obtenerUsuarioActual() // Método auxiliar que creé abajo
            );
            movimientoInventarioRepository.save(mov);
        }

        auditoriaService.registrarAccion(
                "CREACION", "Producto", String.valueOf(productoGuardado.getId()),
                "Nuevo producto creado: " + productoGuardado.getDescripcion()
        );

        return ProductoMapper.toDto(productoGuardado);
    }

    @Transactional // Fundamental para el Delta
    public ProductoResponseDTO actualizarProducto(Long id, ProductoRequest request) {
        Negocio negocio = obtenerNegocioActual();
        Producto producto = productoRepository
                .findByIdAndNegocio(id, negocio)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Categoria categoria = null;
        if (request.getCategoriaId() != null) {
            categoria = categoriaRepository
                    .findByIdAndNegocio(request.getCategoriaId(), negocio)
                    .orElseThrow(() -> new RuntimeException("Categoría inválida"));
        }

        // NUEVO: GUARDAMOS EL STOCK ANTERIOR PARA CALCULAR LA DIFERENCIA
        Double stockAnterior = producto.getCantidadStock() != null ? producto.getCantidadStock() : 0.0;
        Double stockNuevo = request.getCantidadStock() != null ? request.getCantidadStock() : 0.0;
        Double diferencia = stockNuevo - stockAnterior;

        producto.setMarca(request.getMarca());
        producto.setDescripcion(request.getDescripcion());
        producto.setCodigoFabricante(request.getCodigoFabricante());
        producto.setCodigoBarras(request.getCodigoBarras());
        producto.setStockMinimo(request.getStockMinimo() != null ? request.getStockMinimo() : 0.0);
        producto.setPrecio(request.getPrecio());
        producto.setCantidadStock(stockNuevo); // Asignamos el nuevo stock
        producto.setUnidad(request.getUnidad());
        producto.setCategoria(categoria);

        Producto productoActualizado = productoRepository.save(producto);

        // NUEVO: SI HUBO MODIFICACIÓN DE STOCK, GUARDAMOS EL REGISTRO
        if (diferencia != 0.0) {
            MovimientoInventario mov = new MovimientoInventario(
                    productoActualizado,
                    negocio,
                    diferencia, // Puede ser positivo o negativo
                    TipoMovimiento.AJUSTE_MANUAL,
                    "Ajuste manual de stock desde el panel",
                    obtenerUsuarioActual()
            );
            movimientoInventarioRepository.save(mov);
        }

        auditoriaService.registrarAccion(
                "ACTUALIZACION", "Producto", String.valueOf(productoActualizado.getId()),
                "Producto actualizado: " + productoActualizado.getDescripcion()
        );

        return ProductoMapper.toDto(productoActualizado);
    }

    @Transactional
    public void eliminarProducto(Long id) {
        Negocio negocio = obtenerNegocioActual();
        Producto producto = productoRepository
                .findByIdAndNegocio(id, negocio)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        producto.setActivo(false);
        productoRepository.save(producto);

        auditoriaService.registrarAccion(
                "ELIMINACION", "Producto", String.valueOf(producto.getId()),
                "Producto dado de baja lógica: " + producto.getDescripcion()
        );
    }

    @Transactional
    public void restaurarProducto(Long id) {
        Negocio negocio = obtenerNegocioActual();
        Producto producto = productoRepository
                .findByIdAndNegocio(id, negocio)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        producto.setActivo(true);
        productoRepository.save(producto);

        auditoriaService.registrarAccion(
                "RESTAURACION", "Producto", String.valueOf(producto.getId()),
                "Producto restaurado (activo nuevamente): " + producto.getDescripcion()
        );
    }

    private Negocio obtenerNegocioActual() {
        return userRepository.findByUsername(obtenerUsuarioActual())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getNegocio();
    }

    // Método auxiliar para evitar repetir código
    private String obtenerUsuarioActual() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}