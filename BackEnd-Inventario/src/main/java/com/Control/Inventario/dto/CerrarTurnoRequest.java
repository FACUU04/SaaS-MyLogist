package com.Control.Inventario.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CerrarTurnoRequest {
    private Double montoCierreFisicoReal;
    private String observaciones;
}