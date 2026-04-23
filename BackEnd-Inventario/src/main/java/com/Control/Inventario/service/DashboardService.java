package com.Control.Inventario.service;

import com.Control.Inventario.dto.DashboardDTO;
import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate; // FIX: Cambiado a LocalDate
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final VentaRepository ventaRepo;
    private final ProductoRepository productoRepo;
    private final AuditoriaRepository auditoriaRepo;
    private final ClienteRepository clienteRepo;
    private final EmpleadoRepository empleadoRepo;

    public DashboardDTO obtenerResumen(Negocio negocio) {
        // FIX: Calculamos la fecha de hace un mes usando LocalDate
        LocalDate mesAtras = LocalDate.now().minusMonths(1);

        // 1. Armamos el Top 5 de productos
        List<Object[]> topCrudo = ventaRepo.obtenerTopProductos(negocio.getId(), mesAtras, PageRequest.of(0, 5));
        List<DashboardDTO.TopProductoDTO> topProductos = topCrudo.stream().map(obj -> {
            String marca = (obj[0] != null) ? obj[0].toString() : "Sin marca";
            String desc = (obj[1] != null) ? obj[1].toString() : "Sin descripción";
            BigDecimal cant = (BigDecimal) obj[2];
            return new DashboardDTO.TopProductoDTO(marca + " — " + desc, cant);
        }).collect(Collectors.toList());

        // 2. Armamos la lista de Bajo Stock
        Integer umbralInt = negocio.getUmbralStock();
        List<DashboardDTO.ProductoBajoStockDTO> bajoStock = List.of();

        if (umbralInt != null) {
            Double umbralDouble = Double.valueOf(umbralInt);
            bajoStock = productoRepo.findBajoStockList(negocio, umbralDouble).stream().map(p ->
                    new DashboardDTO.ProductoBajoStockDTO(
                            p.getId(),
                            p.getDescripcion(),
                            p.getMarca(),
                            p.getDescripcion(),
                            p.getCantidadStock()
                    )
            ).collect(Collectors.toList());
        }

        // 3. Armamos los últimos 10 registros de Auditoría
        List<DashboardDTO.AuditoriaResumenDTO> ultimosAuditoria = auditoriaRepo
                .findByNegocioIdOrderByFechaHoraDesc(negocio.getId(), PageRequest.of(0, 10))
                .getContent().stream().map(a ->
                        new DashboardDTO.AuditoriaResumenDTO(
                                a.getId(),
                                a.getFechaHora(), // Esto sigue siendo LocalDateTime porque la Auditoría sí guarda la hora
                                a.getUsuario(),
                                a.getAccion(),
                                a.getEntidad(),
                                a.getEntidadId(),
                                a.getDetalles()
                        )
                ).collect(Collectors.toList());

        // 4. Retornamos la "Caja" completa
        return DashboardDTO.builder()
                .totalProductos(productoRepo.countByNegocioAndActivoTrue(negocio))
                .totalClientes(clienteRepo.countByNegocioAndActivoTrue(negocio))
                .totalEmpleados(empleadoRepo.countByNegocioId(negocio.getId()))
                .ventasTotales(ventaRepo.countByNegocioId(negocio.getId()))
                .ventasUltimoMes(ventaRepo.countVentasRecientes(negocio.getId(), mesAtras))
                .topProductos(topProductos)
                .bajoStock(bajoStock)
                .auditoria(ultimosAuditoria)
                .build();
    }
}