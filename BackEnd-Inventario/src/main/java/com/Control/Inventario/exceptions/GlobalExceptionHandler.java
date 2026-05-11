package com.Control.Inventario.exceptions;

import com.Control.Inventario.dto.ErrorResponse;
import com.Control.Inventario.dto.ImportacionExcelResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // AUTH

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex, HttpServletRequest req) {
        return buildResponse("Usuario o contraseña incorrectos", "AUTH_INVALID_CREDENTIALS", HttpStatus.UNAUTHORIZED, req);
    }

    @ExceptionHandler({LockedException.class, DisabledException.class})
    public ResponseEntity<ErrorResponse> handleLocked(
            RuntimeException ex, HttpServletRequest req) {
        return buildResponse(ex.getMessage(), "AUTH_LOCKED_OR_DISABLED", HttpStatus.FORBIDDEN, req);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(
            UsernameNotFoundException ex, HttpServletRequest req) {
        return buildResponse("Usuario no encontrado", "AUTH_USER_NOT_FOUND", HttpStatus.NOT_FOUND, req);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest req) {
        return buildResponse("No tiene permisos para realizar esta acción", "ACCESS_DENIED", HttpStatus.FORBIDDEN, req);
    }


    // VALIDACIONES (@Valid)

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest req) {

        String errores = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));

        return buildResponse(errores, "VALIDATION_ERROR", HttpStatus.BAD_REQUEST, req);
    }


    // ERRORES DE NEGOCIO (Controlados)

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest req) {
        return buildResponse(ex.getMessage(), "BUSINESS_ERROR", HttpStatus.BAD_REQUEST, req);
    }

    // Este captura errores de lectura de archivo o negocio
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntime(
            RuntimeException ex,
            HttpServletRequest req) {
        return buildResponse(ex.getMessage(), "BUSINESS_ERROR", HttpStatus.BAD_REQUEST, req);
    }

    // FALLBACK 500

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(
            Exception ex,
            HttpServletRequest req) {
        ex.printStackTrace();
        return buildResponse("Error interno del servidor", "INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR, req);
    }

    // HELPER

    private ResponseEntity<ErrorResponse> buildResponse(
            String message,
            String code,
            HttpStatus status,
            HttpServletRequest req) {

        ErrorResponse body = ErrorResponse.builder()
                .message(message)
                .code(code)
                .timestamp(Instant.now())
                .path(req.getRequestURI())
                .build();

        return ResponseEntity.status(status).body(body);
    }
}