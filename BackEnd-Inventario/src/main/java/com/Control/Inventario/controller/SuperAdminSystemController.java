package com.Control.Inventario.controller;

import com.sun.management.OperatingSystemMXBean;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.util.Map;

@RestController
@RequestMapping("/api/superadmin/system")
@PreAuthorize("hasRole('SUPERADMIN')")
public class SuperAdminSystemController {

    @GetMapping("/metrics")
    public ResponseEntity<?> getSystemMetrics() {
        // Usamos el MXBean de Java para leer datos directos del SO (Amazon Linux)
        OperatingSystemMXBean osBean = ManagementFactory.getPlatformMXBean(OperatingSystemMXBean.class);

        // CPU: getCpuLoad() devuelve un valor entre 0.0 y 1.0. Lo multiplicamos por 100 para porcentaje.
        double cpuLoad = osBean.getCpuLoad() * 100;
        if (cpuLoad < 0) cpuLoad = 0.0; // A veces en el primer instante devuelve negativo

        // RAM: Lectura en bytes
        long totalRam = osBean.getTotalMemorySize();
        long freeRam = osBean.getFreeMemorySize();
        long usedRam = totalRam - freeRam;

        // Calculamos porcentaje de RAM usada
        double ramUsagePercent = ((double) usedRam / totalRam) * 100;

        // Formateamos para mandar 2 decimales limpios al frontend
        double cpuRounded = Math.round(cpuLoad * 100.0) / 100.0;
        double ramRounded = Math.round(ramUsagePercent * 100.0) / 100.0;

        // Pasamos la RAM total a Gigabytes para mostrarla en el dashboard
        long totalRamGb = totalRam / (1024 * 1024 * 1024);

        return ResponseEntity.ok(Map.of(
                "status", "ONLINE",
                "cpuUsagePercent", cpuRounded,
                "ramUsagePercent", ramRounded,
                "totalRamGb", totalRamGb
        ));
    }
}