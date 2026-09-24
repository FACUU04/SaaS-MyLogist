package com.Control.Inventario.service;

import com.Control.Inventario.dto.EmpleadoRequestDTO;
import com.Control.Inventario.dto.EmpleadoResponseDTO;
import com.Control.Inventario.entity.Empleado;
import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.entity.Role;
import com.Control.Inventario.entity.User;
import com.Control.Inventario.repository.EmpleadoRepository;
import com.Control.Inventario.repository.NegocioRepository;
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

    // Inyectamos lo necesario para el nuevo registro de Negocios
    private final NegocioRepository negocioRepo;
    private final EmailService emailService;

    public User crearAdminInicial(String username, String password, Negocio negocio) {
        Role role = roleRepo.findByName("ROLE_ADMIN").orElseThrow(() -> new RuntimeException("Rol ADMIN no existe"));
        User user = User.builder().username(username).passwordHash(encoder.encode(password)).enabled(true).locked(false).negocio(negocio).build();
        user.addRole(role);
        return userRepo.save(user);
    }

    // =========================================================================
    // NUEVO: REGISTRO COMPLETO DESDE LA LANDING PAGE
    // =========================================================================
    @Transactional
    public User registrarNuevoNegocioCompleto(String username, String negocioName, String contactType, String contactValue, String password) {

        if (userRepo.existsByUsername(username)) {
            throw new RuntimeException("El nombre de usuario ya está en uso. Por favor, elige otro.");
        }

        if (negocioRepo.findByNombre(negocioName).isPresent()) {
            throw new RuntimeException("El nombre del negocio ya está registrado.");
        }

        Negocio nuevoNegocio = new Negocio();
        nuevoNegocio.setNombre(negocioName);
        nuevoNegocio.setActivo(true);
        nuevoNegocio.setEstadoSuscripcion("PRUEBA");
        nuevoNegocio.setDiasPrueba(14);

        if ("email".equalsIgnoreCase(contactType)) {
            nuevoNegocio.setContactoEmail(contactValue);
        } else {
            nuevoNegocio.setTelefono(contactValue);
        }

        Negocio negocioGuardado = negocioRepo.save(nuevoNegocio);

        Role roleAdmin = roleRepo.findByName("ROLE_ADMIN")
                .orElseThrow(() -> new RuntimeException("El rol ADMIN no existe en la base de datos"));

        User nuevoAdmin = User.builder()
                .username(username)
                .passwordHash(encoder.encode(password))
                .enabled(true)
                .locked(false)
                .negocio(negocioGuardado)
                .permisoVentas(true)
                .permisoInventario(true)
                .permisoProveedores(true)
                .build();

        nuevoAdmin.addRole(roleAdmin);
        User usuarioGuardado = userRepo.save(nuevoAdmin);

        // Envío de correos
        if ("email".equalsIgnoreCase(contactType) && contactValue != null) {
            String subjectBienvenida = "¡Bienvenido a MyLogist, " + negocioName + "!";
            String bodyBienvenida = "Hola,\n\n" +
                    "Tu cuenta de prueba gratuita por 14 días ya está activa.\n\n" +
                    "Para sacarle el máximo provecho, te sugerimos ver nuestro video de introducción rápido:\n" +
                    "📺 [AQUI_PONDREMOS_EL_LINK_DEL_VIDEO]\n\n" +
                    "Accede a tu panel desde: https://www.mylogist.com\n\n" +
                    "¡Mucho éxito,\nFacundo de MyLogist!";

            emailService.sendEmail(contactValue, subjectBienvenida, bodyBienvenida);
        }

        String subjectAdmin = "🔥 NUEVO CLIENTE: " + negocioName;
        String bodyAdmin = "Se ha registrado una nueva cuenta en MyLogist.\n\n" +
                "Negocio: " + negocioName + "\n" +
                "Usuario: " + username + "\n" +
                "Vía de contacto: " + contactType + "\n" +
                "Dato: " + contactValue;

        emailService.sendEmail("contactomylogist@gmail.com", subjectAdmin, bodyAdmin);

        return usuarioGuardado;
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
