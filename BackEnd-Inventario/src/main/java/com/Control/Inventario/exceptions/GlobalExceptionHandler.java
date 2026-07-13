package com.Control.Inventario.exceptions;

import com.Control.Inventario.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.time.Instant;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // --- AUTH ---

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex, HttpServletRequest req) {
        return buildResponse("Usuario o contraseña incorrectos", "AUTH_INVALID_CREDENTIALS", HttpStatus.UNAUTHORIZED, req);
    }

    @ExceptionHandler({LockedException.class, DisabledException.class})
    public ResponseEntity<ErrorResponse> handleLocked(RuntimeException ex, HttpServletRequest req) {
        return buildResponse(ex.getMessage(), "AUTH_LOCKED_OR_DISABLED", HttpStatus.FORBIDDEN, req);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UsernameNotFoundException ex, HttpServletRequest req) {
        return buildResponse("Usuario no encontrado", "AUTH_USER_NOT_FOUND", HttpStatus.NOT_FOUND, req);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        return buildResponse("No tiene permisos para realizar esta acción", "ACCESS_DENIED", HttpStatus.FORBIDDEN, req);
    }

    // --- VALIDACIONES DE ENTRADA Y SPRING WEB ---

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        String errores = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        return buildResponse(errores, "VALIDATION_ERROR", HttpStatus.BAD_REQUEST, req);
    }

    // Captura JSON mal formados desde el front (ej. enviaron un String donde iba un Integer)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleMessageNotReadable(HttpMessageNotReadableException ex, HttpServletRequest req) {
        log.warn("Petición mal formada en {}: {}", req.getRequestURI(), ex.getMessage());
        return buildResponse("El formato de los datos enviados no es válido", "MALFORMED_REQUEST", HttpStatus.BAD_REQUEST, req);
    }

    // Captura cuando el front le pega a un endpoint con el método equivocado (ej. GET en vez de POST)
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex, HttpServletRequest req) {
        return buildResponse("Método HTTP no soportado para esta ruta", "METHOD_NOT_SUPPORTED", HttpStatus.METHOD_NOT_ALLOWED, req);
    }

    // Captura errores 404 para que devuelva JSON y no la página HTML por defecto de Spring
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoHandlerFound(NoHandlerFoundException ex, HttpServletRequest req) {
        return buildResponse("El recurso solicitado no existe", "RESOURCE_NOT_FOUND", HttpStatus.NOT_FOUND, req);
    }

    // --- ERRORES DE NEGOCIO Y BASE DE DATOS ---

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest req) {
        log.warn("Error de negocio/argumento en {}: {}", req.getRequestURI(), ex.getMessage());
        return buildResponse(ex.getMessage(), "BUSINESS_ERROR", HttpStatus.BAD_REQUEST, req);
    }

    // Errores de Base de Datos (ej. Constraints de unicidad violados)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest req) {
        log.error("Error de integridad de datos: ", ex);
        return buildResponse("Error al procesar la información. Es posible que el registro ya exista o haya un conflicto de datos.", "DATABASE_CONFLICT", HttpStatus.CONFLICT, req);
    }

    // --- FALLBACK 500 (LA MALLA DE SEGURIDAD FINAL) ---

    // Este atrapa absolutamente todo lo que no hayamos definido arriba (incluyendo NullPointerExceptions)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest req) {
        // Logueamos el error real con toda la traza para nosotros en el servidor
        log.error("Error interno no controlado en la ruta {}", req.getRequestURI(), ex);

        // Al front solo le devolvemos un mensaje genérico, nunca el ex.getMessage() aquí.
        return buildResponse("Ocurrió un error interno en el servidor", "INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR, req);
    }

    // --- HELPER ---

    private ResponseEntity<ErrorResponse> buildResponse(String message, String code, HttpStatus status, HttpServletRequest req) {
        ErrorResponse body = ErrorResponse.builder()
                .message(message)
                .code(code)
                .timestamp(Instant.now())
                .path(req.getRequestURI())
                .build();
        return ResponseEntity.status(status).body(body);
    }
}