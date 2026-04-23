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

    public NegocioAdminDTO(Long id, String nombre, String rubro, String ubicacion, Integer umbralStock, String ticketCabecera, String ticketPie) {
        this.id = id;
        this.nombre = nombre;
        this.rubro = rubro;
        this.ubicacion = ubicacion;
        this.umbralStock = umbralStock;
        this.ticketCabecera = ticketCabecera;
        this.ticketPie = ticketPie;
    }

    public NegocioAdminDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getRubro() {
        return rubro;
    }

    public void setRubro(String rubro) {
        this.rubro = rubro;
    }

    public String getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }

    public Integer getUmbralStock() {
        return umbralStock;
    }

    public void setUmbralStock(Integer umbralStock) {
        this.umbralStock = umbralStock;
    }

    public String getTicketCabecera() {
        return ticketCabecera;
    }

    public void setTicketCabecera(String ticketCabecera) {
        this.ticketCabecera = ticketCabecera;
    }

    public String getTicketPie() {
        return ticketPie;
    }

    public void setTicketPie(String ticketPie) {
        this.ticketPie = ticketPie;
    }
}