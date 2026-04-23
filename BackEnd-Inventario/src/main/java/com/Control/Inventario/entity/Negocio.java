package com.Control.Inventario.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "negocio")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Negocio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50)
    private String nombre;

    @Column(name = "nro_negocio", length = 20)
    private String nroNegocio;

    private LocalDate fundacion;

    @Column(length = 50)
    private String rubro;

    @Column(name = "ubicacion_local", length = 100)
    private String ubicacionLocal;

    @Column(name = "contacto_email", length = 220)
    private String contactoEmail;

    @Column(length = 20)
    private String telefono;

    @Column(name = "umbral_stock")
    private Integer umbralStock;

    @Column(name = "ticket_cabecera")
    private String ticketCabecera;

    @Column(name = "ticket_pie")
    private String ticketPie;

    @Column(nullable = false)
    @Builder.Default
    private boolean activo = true;

    @OneToMany(mappedBy = "negocio", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<User> usuarios = new HashSet<>();
}
