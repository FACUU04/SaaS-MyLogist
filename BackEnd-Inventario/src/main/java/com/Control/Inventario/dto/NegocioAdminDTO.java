package com.Control.Inventario.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class NegocioAdminDTO {

    private Long id;
    private String nombre;
    private String rubro;
    private String ubicacion;

    @JsonProperty("umbral_stock")
    private Integer umbralStock;

    @JsonProperty("ticket_cabecera")
    private String ticketCabecera;

    @JsonProperty("ticket_pie")
    private String ticketPie;

    // --- NUEVOS CAMPOS DE CONFIGURACIÓN IA ---
    @JsonProperty("reporte_ia_activo")
    private Boolean reporteIaActivo;

    @JsonProperty("reporte_ia_frecuencia")
    private String reporteIaFrecuencia;

    @JsonProperty("reporte_ia_canal")
    private String reporteIaCanal;

    @JsonProperty("reporte_ia_destino")
    private String reporteIaDestino;

    // Constructor completo
    public NegocioAdminDTO(Long id, String nombre, String rubro, String ubicacion, Integer umbralStock, String ticketCabecera, String ticketPie, Boolean reporteIaActivo, String reporteIaFrecuencia, String reporteIaCanal, String reporteIaDestino) {
        this.id = id;
        this.nombre = nombre;
        this.rubro = rubro;
        this.ubicacion = ubicacion;
        this.umbralStock = umbralStock;
        this.ticketCabecera = ticketCabecera;
        this.ticketPie = ticketPie;
        this.reporteIaActivo = reporteIaActivo;
        this.reporteIaFrecuencia = reporteIaFrecuencia;
        this.reporteIaCanal = reporteIaCanal;
        this.reporteIaDestino = reporteIaDestino;
    }

    public NegocioAdminDTO() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getRubro() { return rubro; }
    public void setRubro(String rubro) { this.rubro = rubro; }

    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }

    public Integer getUmbralStock() { return umbralStock; }
    public void setUmbralStock(Integer umbralStock) { this.umbralStock = umbralStock; }

    public String getTicketCabecera() { return ticketCabecera; }
    public void setTicketCabecera(String ticketCabecera) { this.ticketCabecera = ticketCabecera; }

    public String getTicketPie() { return ticketPie; }
    public void setTicketPie(String ticketPie) { this.ticketPie = ticketPie; }

    public Boolean getReporteIaActivo() { return reporteIaActivo; }
    public void setReporteIaActivo(Boolean reporteIaActivo) { this.reporteIaActivo = reporteIaActivo; }

    public String getReporteIaFrecuencia() { return reporteIaFrecuencia; }
    public void setReporteIaFrecuencia(String reporteIaFrecuencia) { this.reporteIaFrecuencia = reporteIaFrecuencia; }

    public String getReporteIaCanal() { return reporteIaCanal; }
    public void setReporteIaCanal(String reporteIaCanal) { this.reporteIaCanal = reporteIaCanal; }

    public String getReporteIaDestino() { return reporteIaDestino; }
    public void setReporteIaDestino(String reporteIaDestino) { this.reporteIaDestino = reporteIaDestino; }
}