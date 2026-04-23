package com.Control.Inventario.mapper;

import com.Control.Inventario.dto.ClienteRequest;
import com.Control.Inventario.dto.ClienteResponseDTO;
import com.Control.Inventario.entity.Cliente;
import org.springframework.stereotype.Component;

@Component
public class ClienteMapper {

    public Cliente toEntity(ClienteRequest request) {
        return Cliente.builder()
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .fechaNacimiento(request.getFechaNacimiento())
                .dni(request.getDni())
                .telefono(request.getTelefono())
                .correo(request.getCorreo())
                .activo(true) //  Todo cliente nuevo nace activo
                .build();
    }

    public ClienteResponseDTO toDto(Cliente cliente) {
        return ClienteResponseDTO.builder()
                .id(cliente.getId())
                .nombre(cliente.getNombre())
                .apellido(cliente.getApellido())
                .fechaNacimiento(cliente.getFechaNacimiento())
                .dni(cliente.getDni())
                .telefono(cliente.getTelefono())
                .correo(cliente.getCorreo())
                .activo(cliente.getActivo())
                .build();
    }

    public void updateEntity(Cliente cliente, ClienteRequest request) {
        cliente.setNombre(request.getNombre());
        cliente.setApellido(request.getApellido());
        cliente.setFechaNacimiento(request.getFechaNacimiento());
        cliente.setDni(request.getDni());
        cliente.setTelefono(request.getTelefono());
        cliente.setCorreo(request.getCorreo());
    }
}