package com.Control.Inventario.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class OrdenRequestDTO {

    // Usamos Integer porque en tu clase Proveedor el ID es int
    @NotNull(message = "El ID del proveedor es obligatorio")
    private Integer proveedorId;
    
    private String metodoPago;
    private String observaciones;

    // Este puede venir vacío si el usuario no sabe cuándo le llega
    private LocalDate fechaRecepcionEsperada;

    @NotEmpty(message = "La orden debe tener al menos un producto")
    @Valid // Fundamental para que valide la lista por dentro
    private List<DetalleOrdenRequestDTO> detalles;
}