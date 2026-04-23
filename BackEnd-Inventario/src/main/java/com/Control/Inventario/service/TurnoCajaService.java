package com.Control.Inventario.service;

import com.Control.Inventario.dto.AbrirTurnoRequest;
import com.Control.Inventario.dto.CerrarTurnoRequest;
import com.Control.Inventario.dto.MessageResponse;
import com.Control.Inventario.entity.EstadoTurno;
import com.Control.Inventario.entity.MetodoPago;
import com.Control.Inventario.entity.TurnoCaja;
import com.Control.Inventario.entity.User;
import com.Control.Inventario.repository.TurnoCajaRepository;
import com.Control.Inventario.repository.VentaRepository; // IMPORTANTE: Agregamos la importación
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TurnoCajaService {

    private final TurnoCajaRepository turnoRepo;
    private final AuthService authService;
    private final VentaRepository ventaRepo; // DESCOMENTADO: Ahora sí lo usamos


    // =====================
    // ABRIR TURNO
    // =====================
    public ResponseEntity<?> abrirTurno(AbrirTurnoRequest req) {
        User currentUser = authService.getCurrentUser();

        // 1. Validar que no tenga ya un turno abierto
        Optional<TurnoCaja> turnoExistente = turnoRepo.findByUsuarioAndEstado(currentUser, EstadoTurno.ABIERTO);
        if (turnoExistente.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Ya tienes un turno abierto. Debes cerrarlo primero."));
        }

        // 2. Crear el nuevo turno
        TurnoCaja nuevoTurno = TurnoCaja.builder()
                .usuario(currentUser)
                .negocio(currentUser.getNegocio())
                .fechaApertura(LocalDateTime.now())
                .montoAperturaFisico(req.getMontoAperturaFisico() != null ? req.getMontoAperturaFisico() : 0.0)
                .totalVentasEfectivoSistema(0.0)
                .totalVentasTransferenciaSistema(0.0)
                .estado(EstadoTurno.ABIERTO)
                .build();

        turnoRepo.save(nuevoTurno);

        return ResponseEntity.ok(nuevoTurno);
    }


    // =====================
    // OBTENER TURNO ACTIVO
    // =====================
    public ResponseEntity<?> obtenerTurnoActivo() {
        User currentUser = authService.getCurrentUser();
        Optional<TurnoCaja> turno = turnoRepo.findByUsuarioAndEstado(currentUser, EstadoTurno.ABIERTO);

        if (turno.isPresent()) {
            return ResponseEntity.ok(turno.get());
        } else {
            return ResponseEntity.ok().body(null);
        }
    }


    // =====================
    // CERRAR TURNO (CON LÓGICA CONTABLE)
    // =====================
    public ResponseEntity<?> cerrarTurno(CerrarTurnoRequest req) {
        User currentUser = authService.getCurrentUser();

        TurnoCaja turnoActivo = turnoRepo.findByUsuarioAndEstado(currentUser, EstadoTurno.ABIERTO)
                .orElse(null);

        if (turnoActivo == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("No hay ningún turno abierto para cerrar."));
        }

        // 1. Calculamos las ventas reales con BigDecimal
        BigDecimal totalEfectivo = ventaRepo.sumVentasByTurnoAndMetodoPago(turnoActivo, MetodoPago.EFECTIVO);
        BigDecimal totalTransferencia = ventaRepo.sumVentasByTurnoAndMetodoPago(turnoActivo, MetodoPago.TRANSFERENCIA);

        // 2. Pasamos a Double y guardamos en el turno
        turnoActivo.setTotalVentasEfectivoSistema(totalEfectivo.doubleValue());
        turnoActivo.setTotalVentasTransferenciaSistema(totalTransferencia.doubleValue());

        // 3. Guardamos los datos físicos y cerramos
        turnoActivo.setFechaCierre(LocalDateTime.now());
        turnoActivo.setMontoCierreFisicoReal(req.getMontoCierreFisicoReal());
        turnoActivo.setObservaciones(req.getObservaciones());
        turnoActivo.setEstado(EstadoTurno.CERRADO);

        turnoRepo.save(turnoActivo);

        return ResponseEntity.ok(new MessageResponse("Turno cerrado correctamente. Totales calculados con éxito."));
    }
}