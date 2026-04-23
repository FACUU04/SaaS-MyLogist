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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final EmpleadoRepository empleadoRepo;
    private final PasswordEncoder encoder;

    public User crearAdminInicial(String username, String password, Negocio negocio) {
        Role role = roleRepo.findByName("ROLE_ADMIN").orElseThrow(() -> new RuntimeException("Rol ADMIN no existe"));
        User user = User.builder().username(username).passwordHash(encoder.encode(password)).enabled(true).locked(false).negocio(negocio).build();
        user.addRole(role);
        return userRepo.save(user);
    }

    @Transactional
    public EmpleadoResponseDTO crearEmpleado(EmpleadoRequestDTO request, String adminUsername) {
        User adminLogueado = userRepo.findByUsername(adminUsername).orElseThrow(() -> new RuntimeException("Admin no encontrado"));
        if (userRepo.existsByUsername(request.username())) throw new RuntimeException("El nombre de usuario ya está en uso");

        Role roleEmpleado = roleRepo.findByName("ROLE_EMPLEADO").orElseThrow(() -> new RuntimeException("Rol ROLE_EMPLEADO no configurado"));

        Empleado empleado = new Empleado();
        empleado.setNombre(request.nombre());
        empleado.setApellido(request.apellido());
        empleado.setFechaNacimiento(request.fechaNacimiento());
        empleado.setFechaIngreso(request.fechaIngreso());
        empleado.setPuestoOcupado(request.puestoOcupado());
        empleado.setContacto_email(request.email());
        empleado.setTelefono(request.telefono());
        empleado.setNegocio(adminLogueado.getNegocio());
        Empleado empleadoGuardado = empleadoRepo.save(empleado);

        User nuevoEmpleado = User.builder()
                .username(request.username())
                .passwordHash(encoder.encode(request.password()))
                .negocio(adminLogueado.getNegocio())
                .empleado(empleadoGuardado)
                .permisoVentas(request.permisoVentas())
                .permisoInventario(request.permisoInventario())
                .permisoProveedores(request.permisoProveedores())
                .enabled(true).locked(false).build();

        nuevoEmpleado.addRole(roleEmpleado);
        return mapToResponse(userRepo.save(nuevoEmpleado));
    }

    // NUEVO: Método para actualizar
    @Transactional
    public EmpleadoResponseDTO actualizarEmpleado(Long id, EmpleadoRequestDTO request, String adminUsername) {
        User adminLogueado = userRepo.findByUsername(adminUsername).orElseThrow(() -> new RuntimeException("Admin no encontrado"));
        User empleadoUser = userRepo.findById(id).orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        if (!empleadoUser.getNegocio().getId().equals(adminLogueado.getNegocio().getId())) {
            throw new RuntimeException("No autorizado");
        }

        Empleado empleado = empleadoUser.getEmpleado();
        if (empleado != null) {
            empleado.setNombre(request.nombre());
            empleado.setApellido(request.apellido());
            empleado.setFechaNacimiento(request.fechaNacimiento());
            empleado.setFechaIngreso(request.fechaIngreso());
            empleado.setPuestoOcupado(request.puestoOcupado());
            empleado.setContacto_email(request.email());
            empleado.setTelefono(request.telefono());
            empleadoRepo.save(empleado);
        }

        empleadoUser.setUsername(request.username());
        if (request.password() != null && !request.password().isBlank()) {
            empleadoUser.setPasswordHash(encoder.encode(request.password()));
        }
        empleadoUser.setPermisoVentas(request.permisoVentas());
        empleadoUser.setPermisoInventario(request.permisoInventario());
        empleadoUser.setPermisoProveedores(request.permisoProveedores());

        return mapToResponse(userRepo.save(empleadoUser));
    }

    // NUEVO: Método para eliminar
    @Transactional
    public void eliminarEmpleado(Long id, String adminUsername) {
        User adminLogueado = userRepo.findByUsername(adminUsername).orElseThrow(() -> new RuntimeException("Admin no encontrado"));
        User empleadoUser = userRepo.findById(id).orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        if (!empleadoUser.getNegocio().getId().equals(adminLogueado.getNegocio().getId())) {
            throw new RuntimeException("No autorizado");
        }

        Empleado empleado = empleadoUser.getEmpleado();
        userRepo.delete(empleadoUser);
        if (empleado != null) empleadoRepo.delete(empleado);
    }

    public List<EmpleadoResponseDTO> listarEmpleadosDelNegocio(String adminUsername) {
        User adminLogueado = userRepo.findByUsername(adminUsername).orElseThrow(() -> new RuntimeException("Admin no encontrado"));
        return userRepo.findByNegocioId(adminLogueado.getNegocio().getId()).stream()
                .filter(u -> u.getRoles().stream().noneMatch(r -> r.getName().equals("ROLE_ADMIN")))
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    private EmpleadoResponseDTO mapToResponse(User user) {
        Empleado e = user.getEmpleado();
        return new EmpleadoResponseDTO(
                user.getId(), e != null ? e.getNombre() : "", e != null ? e.getApellido() : "",
                e != null ? e.getContacto_email() : "", e != null ? e.getTelefono() : "",
                e != null ? e.getPuestoOcupado() : "", e != null ? e.getFechaIngreso() : null,
                user.getUsername(), user.isEnabled(), user.isPermisoVentas(),
                user.isPermisoInventario(), user.isPermisoProveedores()
        );
    }
}
