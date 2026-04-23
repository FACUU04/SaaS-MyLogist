package com.Control.Inventario.service;

import com.Control.Inventario.dto.ClienteRequest;
import com.Control.Inventario.dto.ClienteResponseDTO;
import com.Control.Inventario.entity.Cliente;
import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.mapper.ClienteMapper;
import com.Control.Inventario.repository.ClienteRepository;
import com.Control.Inventario.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final ClienteMapper clienteMapper;
    private final UserRepository userRepository;

    // LISTAR (NO EXPLOTA SI NO HAY CLIENTES)
    public Page<ClienteResponseDTO> listar(Pageable pageable) {
        Negocio negocio = obtenerNegocioActual();

        return clienteRepository
                .findAllByNegocio(negocio, pageable)
                .map(clienteMapper::toDto);
    }

    // CREAR
    public ClienteResponseDTO crear(ClienteRequest request) {
        Negocio negocio = obtenerNegocioActual();

        if (request.getDni() != null &&
                clienteRepository.existsByDniAndNegocio(request.getDni(), negocio)) {
            throw new RuntimeException("Ya existe un cliente con ese DNI");
        }

        Cliente cliente = clienteMapper.toEntity(request);
        cliente.setNegocio(negocio);

        Cliente guardado = clienteRepository.save(cliente);
        return clienteMapper.toDto(guardado);
    }

    // ACTUALIZAR
    public ClienteResponseDTO actualizar(Long id, ClienteRequest request) {
        Negocio negocio = obtenerNegocioActual();

        Cliente cliente = clienteRepository
                .findByIdAndNegocio(id, negocio)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        clienteMapper.updateEntity(cliente, request);

        Cliente actualizado = clienteRepository.save(cliente);
        return clienteMapper.toDto(actualizado);
    }


    // NEGOCIO DEL USER
    private Negocio obtenerNegocioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getNegocio();
    }
}
