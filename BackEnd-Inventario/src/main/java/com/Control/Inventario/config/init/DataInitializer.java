package com.Control.Inventario.config.init;

import com.Control.Inventario.entity.Role;
import com.Control.Inventario.entity.User;
import com.Control.Inventario.entity.Negocio;
import com.Control.Inventario.repository.NegocioRepository;
import com.Control.Inventario.repository.RoleRepository;
import com.Control.Inventario.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final NegocioRepository negocioRepository;
    private final PasswordEncoder passwordEncoder;

    // Leer variable de entorno. Si no existe, usa "superadmin123" por defecto.
    @Value("${SUPERADMIN_PASSWORD:superadmin123}")
    private String superAdminPassword;

    @Bean
    CommandLineRunner initSuperAdmin() {
        return args -> {

            // Crear roles si no existen
            createRoleIfNotExists("ROLE_SUPERADMIN");
            createRoleIfNotExists("ROLE_ADMIN");
            createRoleIfNotExists("ROLE_USER");

            // Crear negocio base "Sistema"
            Negocio sistema = negocioRepository.findByNombre("Sistema")
                    .orElseGet(() -> negocioRepository.save(
                            Negocio.builder()
                                    .nombre("Sistema")
                                    .build()
                    ));

            // Si ya existe, NO HACE NADA. Así preservamos la contraseña segura que esté en MySQL.
            if (userRepository.existsByUsername("superadmin")) {
                System.out.println("SUPERADMIN ya existe en la base de datos. Omitiendo creación y actualización.");
                return;
            }

            Role superAdminRole = roleRepository.findByName("ROLE_SUPERADMIN")
                    .orElseThrow();

            User superAdmin = User.builder()
                    .username("superadmin")
                    .passwordHash(passwordEncoder.encode(superAdminPassword))
                    .enabled(true)
                    .locked(false)
                    .negocio(sistema)
                    .build();

            superAdmin.addRole(superAdminRole);
            userRepository.save(superAdmin);

            System.out.println("SUPERADMIN creado correctamente.");
        };
    }

    private void createRoleIfNotExists(String roleName) {
        roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .name(roleName)
                                .build()
                ));
    }
}
