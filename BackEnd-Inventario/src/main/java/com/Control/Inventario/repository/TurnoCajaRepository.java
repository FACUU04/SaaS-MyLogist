package com.Control.Inventario.repository;

import com.Control.Inventario.entity.EstadoTurno;
import com.Control.Inventario.entity.TurnoCaja;
import com.Control.Inventario.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TurnoCajaRepository extends JpaRepository<TurnoCaja, Long> {

    // Busca si el usuario tiene un turno en un estado específico (ej: ABIERTO)
    Optional<TurnoCaja> findByUsuarioAndEstado(User usuario, EstadoTurno estado);
}