package com.Control.Inventario.dto;

import java.util.List;

public record PageResponse<T>(
        List<T> content,
        int page,
        int totalPages,
        long totalElements
) {}
