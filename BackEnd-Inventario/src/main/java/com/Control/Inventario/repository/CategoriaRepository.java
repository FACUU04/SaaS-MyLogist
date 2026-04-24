package com.Control.Inventario.repository;

import com.Control.Inventario.entity.Categoria;
import com.Control.Inventario.entity.Negocio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
    Optional<Categoria> findByNombreIgnoreCase(String nombre);

    Optional<Categoria> findByIdAndNegocio(Long id, Negocio negocio);

    // --- MÉTODO PARA BORRADO EN CASCADA ---
    void deleteByNegocioId(Long negocioId);
}