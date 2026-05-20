package com.Control.Inventario.service;

import com.Control.Inventario.config.security.CustomUserDetails;
import com.Control.Inventario.entity.Role;
import com.Control.Inventario.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${security.jwt.secret}")
    private String secret;

    @Value("${security.jwt.expiration.access-ms}")
    private long accessExpMs;

    @Value("${security.jwt.expiration.refresh-ms}")
    private long refreshExpMs;


    // GENERAR TOKENS
    public String generateAccessToken(User user) {
        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim(
                        "roles",
                        user.getRoles()
                                .stream()
                                .map(Role::getName) // ROLE_ADMIN, ROLE_USER
                                .toList()
                )
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis() + accessExpMs)
                )
                .signWith(
                        Keys.hmacShaKeyFor(secret.getBytes()),
                        SignatureAlgorithm.HS256
                )
                .compact();
    }

    public String generateRefreshToken(User user) {
        return Jwts.builder()
                .setSubject(user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis() + refreshExpMs)
                )
                .signWith(
                        Keys.hmacShaKeyFor(secret.getBytes()),
                        SignatureAlgorithm.HS256
                )
                .compact();
    }

    // --- NUEVO: MÉTODO ADAPTADOR PARA SOPORTE (Impersonation) ---
    public String generateToken(UserDetails userDetails) {
        // Verificamos que sea tu clase personalizada para poder extraer la entidad User real
        if (userDetails instanceof CustomUserDetails customUser) {
            return generateAccessToken(customUser.getUser());
        }
        throw new IllegalArgumentException("El UserDetails debe ser una instancia de CustomUserDetails");
    }


    // EXTRAER DATOS
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public List<String> extractRoles(String token) {
        return extractClaim(token, claims ->
                claims.get("roles", List.class)
        );
    }


    // HELPERS
    private <T> T extractClaim(
            String token,
            Function<Claims, T> claimsResolver
    ) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(
                        Keys.hmacShaKeyFor(secret.getBytes())
                )
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}