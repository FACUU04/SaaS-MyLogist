package com.Control.Inventario.service;

import com.Control.Inventario.dto.ProductoRequest;
import com.Control.Inventario.dto.ProductoResponseDTO;
import com.Control.Inventario.entity.Categoria;
import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.entity.Producto;
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

    // -------- NUEVO MÉTODO PARA EL ESCÁNER --------
    public ProductoResponseDTO buscarPorCodigoBarras(String codigoBarras) {
        Negocio negocio = obtenerNegocioActual();

        Producto producto = productoRepository
                .findByCodigoBarrasAndNegocioAndActivoTrue(codigoBarras, negocio)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado o inactivo para este código de barras"));

        return ProductoMapper.toDto(producto);
    }

    // -------- LISTAR (SOLO ACTIVOS) CON BÚSQUEDA --------
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

    // -------- LISTAR ELIMINADOS (INACTIVOS) CON BÚSQUEDA --------
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

    // -------- CREAR --------
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

        // NUEVOS CAMPOS
        producto.setCodigoBarras(request.getCodigoBarras());
        producto.setStockMinimo(request.getStockMinimo() != null ? request.getStockMinimo() : 0.0);

        producto.setPrecio(request.getPrecio());
        producto.setCantidadStock(request.getCantidadStock());
        producto.setUnidad(request.getUnidad());
        producto.setCategoria(categoria);
        producto.setNegocio(negocio);

        Producto productoGuardado = productoRepository.save(producto);

        // AUDITORIA
        auditoriaService.registrarAccion(
                "CREACION",
                "Producto",
                String.valueOf(productoGuardado.getId()),
                "Nuevo producto creado: " + productoGuardado.getDescripcion() + " (Stock inicial: " + productoGuardado.getCantidadStock() + ")"
        );

        return ProductoMapper.toDto(productoGuardado);
    }

    // -------- ACTUALIZAR --------
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

        producto.setMarca(request.getMarca());
        producto.setDescripcion(request.getDescripcion());
        producto.setCodigoFabricante(request.getCodigoFabricante());

        // NUEVOS CAMPOS
        producto.setCodigoBarras(request.getCodigoBarras());
        producto.setStockMinimo(request.getStockMinimo() != null ? request.getStockMinimo() : 0.0);

        producto.setPrecio(request.getPrecio());
        producto.setCantidadStock(request.getCantidadStock());
        producto.setUnidad(request.getUnidad());
        producto.setCategoria(categoria);

        Producto productoActualizado = productoRepository.save(producto);

        // AUDITORIA
        auditoriaService.registrarAccion(
                "ACTUALIZACION",
                "Producto",
                String.valueOf(productoActualizado.getId()),
                "Producto actualizado: " + productoActualizado.getDescripcion()
        );

        return ProductoMapper.toDto(productoActualizado);
    }

    // -------- ELIMINAR (BORRADO LÓGICO) --------
    @Transactional
    public void eliminarProducto(Long id) {
        // ... (El resto queda igual, no hay cambios acá)
        Negocio negocio = obtenerNegocioActual();
        Producto producto = productoRepository
                .findByIdAndNegocio(id, negocio)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        producto.setActivo(false);
        productoRepository.save(producto);

        auditoriaService.registrarAccion(
                "ELIMINACION",
                "Producto",
                String.valueOf(producto.getId()),
                "Producto dado de baja lógica: " + producto.getDescripcion()
        );
    }

    // -------- RESTAURAR (DESHACER BORRADO LÓGICO) --------
    @Transactional
    public void restaurarProducto(Long id) {
        // ... (El resto queda igual, no hay cambios acá)
        Negocio negocio = obtenerNegocioActual();
        Producto producto = productoRepository
                .findByIdAndNegocio(id, negocio)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        producto.setActivo(true);
        productoRepository.save(producto);

        auditoriaService.registrarAccion(
                "RESTAURACION",
                "Producto",
                String.valueOf(producto.getId()),
                "Producto restaurado (activo nuevamente): " + producto.getDescripcion()
        );
    }

    private Negocio obtenerNegocioActual() {
        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getNegocio();
    }
}