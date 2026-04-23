package com.Control.Inventario.service;

import com.Control.Inventario.dto.EmpleadoRequestDTO;
import com.Control.Inventario.dto.EmpleadoResponseDTO;
import com.Control.Inventario.entity.Empleado;
import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.entity.Role;
import com.Control.Inventario.entity.User;
import com.Control.Inventario.repository.EmpleadoRepository;
import com.Control.Inventario.repository.RoleRepository;
import com.Control.Inventario.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmpleadoService {

    private final EmpleadoRepository empleadoRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public List<EmpleadoResponseDTO> listar() {
        Negocio negocio = obtenerNegocioActual();

        // Buscamos directamente desde User para tener las credenciales a mano
        return userRepository.findByNegocioId(negocio.getId())
                .stream()
                .filter(u -> u.getEmpleado() != null) // Filtramos para traer solo a los empleados
                .map(this::toDTO)
                .toList();
    }

    @Transactional // IMPORTANTE: Si falla algo, revierte toda la operación
    public EmpleadoResponseDTO crear(EmpleadoRequestDTO dto) {
        Negocio negocio = obtenerNegocioActual();

        if (userRepository.existsByUsername(dto.username())) {
            throw new RuntimeException("El nombre de usuario ya está en uso");
        }

        // 1. Guardar Datos Personales (HR)
        Empleado empleado = new Empleado();
        empleado.setNombre(dto.nombre());
        empleado.setApellido(dto.apellido());
        empleado.setFechaNacimiento(dto.fechaNacimiento());
        empleado.setFechaIngreso(dto.fechaIngreso());
        empleado.setPuestoOcupado(dto.puestoOcupado());
        empleado.setContacto_email(dto.email());
        empleado.setTelefono(dto.telefono());
        empleado.setNegocio(negocio);

        Empleado empleadoGuardado = empleadoRepository.save(empleado);

        // 2. Guardar Credenciales y Permisos (Seguridad)
        Role roleEmpleado = roleRepository.findByName("ROLE_EMPLEADO")
                .orElseThrow(() -> new RuntimeException("Rol ROLE_EMPLEADO no encontrado en BD"));

        User nuevoUsuario = User.builder()
                .username(dto.username())
                .passwordHash(passwordEncoder.encode(dto.password()))
                .negocio(negocio)
                .empleado(empleadoGuardado) // Vinculamos el User con el Empleado
                .permisoVentas(dto.permisoVentas())
                .permisoInventario(dto.permisoInventario())
                .permisoProveedores(dto.permisoProveedores())
                .enabled(true)
                .locked(false)
                .build();

        nuevoUsuario.addRole(roleEmpleado);
        User usuarioGuardado = userRepository.save(nuevoUsuario);

        return toDTO(usuarioGuardado);
    }

    @Transactional
    public EmpleadoResponseDTO actualizar(Long id, EmpleadoRequestDTO dto) {
        Negocio negocio = obtenerNegocioActual();

        // 1. Actualizar HR
        Empleado empleado = empleadoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        if (!empleado.getNegocio().getId().equals(negocio.getId())) {
            throw new RuntimeException("No autorizado");
        }

        empleado.setNombre(dto.nombre());
        empleado.setApellido(dto.apellido());
        empleado.setFechaNacimiento(dto.fechaNacimiento());
        empleado.setFechaIngreso(dto.fechaIngreso());
        empleado.setPuestoOcupado(dto.puestoOcupado());
        empleado.setContacto_email(dto.email());
        empleado.setTelefono(dto.telefono());
        empleadoRepository.save(empleado);

        // 2. Actualizar Seguridad y Permisos
        User user = userRepository.findByEmpleadoId(id)
                .orElseThrow(() -> new RuntimeException("Credenciales no encontradas para este empleado"));

        user.setPermisoVentas(dto.permisoVentas());
        user.setPermisoInventario(dto.permisoInventario());
        user.setPermisoProveedores(dto.permisoProveedores());

        // Si el admin escribió una contraseña nueva, la actualizamos
        if (dto.password() != null && !dto.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(dto.password()));
        }

        User usuarioGuardado = userRepository.save(user);

        return toDTO(usuarioGuardado);
    }

    @Transactional
    public void eliminar(Long id) {
        Negocio negocio = obtenerNegocioActual();

        Empleado empleado = empleadoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        if (!empleado.getNegocio().getId().equals(negocio.getId())) {
            throw new RuntimeException("No autorizado");
        }

        // Hay que borrar el User primero para no romper las Foreign Keys
        userRepository.findByEmpleadoId(id).ifPresent(userRepository::delete);
        empleadoRepository.delete(empleado);
    }

    // 🔹 MAPPER
    private EmpleadoResponseDTO toDTO(User user) {
        Empleado e = user.getEmpleado();
        return new EmpleadoResponseDTO(
                e.getId(),
                e.getNombre(),
                e.getApellido(),
                e.getContacto_email(),
                e.getTelefono(),
                e.getPuestoOcupado(),
                e.getFechaIngreso(),

                // Agregamos los datos de seguridad que pide el DTO unificado
                user.getUsername(),
                user.isEnabled(),
                user.isPermisoVentas(),
                user.isPermisoInventario(),
                user.isPermisoProveedores()
        );
    }

    private Negocio obtenerNegocioActual() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getNegocio();
    }
}


