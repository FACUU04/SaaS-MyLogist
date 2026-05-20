package com.Control.Inventario.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
public class NegocioRequest {
    private String nombre;
    private String nroNegocio;
    private LocalDate fundacion;
    private String rubro;
    private String ubicacionLocal;
    private String contactoEmail;
    private String telefono;
    private Integer umbralStock;

    // Nuevo campo para configurar el período de prueba desde el SuperAdmin
    private Integer diasPrueba;

    // Datos del admin inicial
    private String adminUsername;
    private String adminPassword;
    private String adminEmail;

    // Datos del ticket
    private String ticketCabecera;
    private String ticketPie;
}