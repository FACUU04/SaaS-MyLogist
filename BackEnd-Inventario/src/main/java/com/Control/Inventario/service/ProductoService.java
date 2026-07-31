package com.Control.Inventario.service;

import com.Control.Inventario.dto.ProductoRequest;
import com.Control.Inventario.dto.ProductoResponseDTO;
import com.Control.Inventario.entity.Categoria;
import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.entity.Producto;
import com.Control.Inventario.entity.MovimientoInventario;
import com.Control.Inventario.entity.TipoMovimiento;
import com.Control.Inventario.repository.MovimientoInventarioRepository;
import com.Control.Inventario.mapper.ProductoMapper;
import com.Control.Inventario.repository.CategoriaRepository;
import com.Control.Inventario.repository.ProductoRepository;
import com.Control.Inventario.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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

    @Transactional
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

        if (productoGuardado.getCantidadStock() != null && productoGuardado.getCantidadStock() > 0) {
            MovimientoInventario mov = new MovimientoInventario(
                    productoGuardado,
                    negocio,
                    productoGuardado.getCantidadStock(),
                    TipoMovimiento.AJUSTE_MANUAL,
                    "Stock inicial al crear producto",
                    obtenerUsuarioActual()
            );
            movimientoInventarioRepository.save(mov);
        }

        auditoriaService.registrarAccion(
                "CREACION", "Producto", String.valueOf(productoGuardado.getId()),
                "Nuevo producto creado: " + productoGuardado.getDescripcion()
        );

        return ProductoMapper.toDto(productoGuardado);
    }

    @Transactional
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

        Double stockAnterior = producto.getCantidadStock() != null ? producto.getCantidadStock() : 0.0;
        Double stockNuevo = request.getCantidadStock() != null ? request.getCantidadStock() : 0.0;
        Double diferencia = stockNuevo - stockAnterior;

        producto.setMarca(request.getMarca());
        producto.setDescripcion(request.getDescripcion());
        producto.setCodigoFabricante(request.getCodigoFabricante());
        producto.setCodigoBarras(request.getCodigoBarras());
        producto.setStockMinimo(request.getStockMinimo() != null ? request.getStockMinimo() : 0.0);
        producto.setPrecio(request.getPrecio());
        producto.setCantidadStock(stockNuevo);
        producto.setUnidad(request.getUnidad());
        producto.setCategoria(categoria);

        Producto productoActualizado = productoRepository.save(producto);

        if (diferencia != 0.0) {
            MovimientoInventario mov = new MovimientoInventario(
                    productoActualizado,
                    negocio,
                    diferencia,
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

    public String obtenerInventarioParaIA() {
        Negocio negocio = obtenerNegocioActual();
        Page<Producto> productos = productoRepository.findAllByNegocioAndActivoTrue(negocio, PageRequest.of(0, 500));

        if (productos.isEmpty()) {
            return "El inventario está completamente vacío.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Inventario actual:\n");
        for (Producto p : productos.getContent()) {
            sb.append("- ").append(p.getDescripcion())
                    .append(" | Marca: ").append(p.getMarca() != null && !p.getMarca().isEmpty() ? p.getMarca() : "Sin marca")
                    .append(" | Stock: ").append(p.getCantidadStock())
                    .append(" | Precio: $").append(p.getPrecio()).append("\n");
        }
        return sb.toString();
    }

    private Negocio obtenerNegocioActual() {
        return userRepository.findByUsername(obtenerUsuarioActual())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getNegocio();
    }

    private String obtenerUsuarioActual() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}