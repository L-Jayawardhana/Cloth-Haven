package org.example.clothheaven.Config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.Map;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final org.example.clothheaven.Util.JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(org.example.clothheaven.Util.JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {
                })
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        // Product endpoints - allow all access
                        .requestMatchers("/api/v1/products/**").permitAll()
                        // Category endpoints - allow all access
                        .requestMatchers("/api/v1/categories/**").permitAll()
                        // Sub-category endpoints - allow all access
                        .requestMatchers("/api/v1/sub-categories/**").permitAll()
                        // Image endpoints - allow all access
                        .requestMatchers("/api/v1/images/**").permitAll()
                        // Color/Size/Quantity endpoints - allow all access
                        .requestMatchers("/api/v1/colors-size-quantity-availability/**").permitAll()
                        // Inventory logs endpoints - allow all access for now (TODO: Add admin auth)
                        .requestMatchers("/api/v1/inventoryLogs/**").permitAll()
                        // Admin endpoints - require ADMIN role
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/users/**").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(customAuthenticationEntryPoint())
                        .accessDeniedHandler(customAccessDeniedHandler()))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthenticationEntryPoint customAuthenticationEntryPoint() {
        return (HttpServletRequest request, HttpServletResponse response, AuthenticationException ex) -> {
            response.setContentType("application/json");
            response.setStatus(HttpStatus.UNAUTHORIZED.value());

            ObjectMapper mapper = new ObjectMapper();
            String jsonResponse = mapper.writeValueAsString(Map.of(
                    "error", "Authentication required",
                    "message", "Please sign in as admin to access this resource",
                    "status", HttpStatus.UNAUTHORIZED.value(),
                    "path", request.getRequestURI()));

            response.getWriter().write(jsonResponse);
        };
    }

    @Bean
    public AccessDeniedHandler customAccessDeniedHandler() {
        return (HttpServletRequest request, HttpServletResponse response,
                org.springframework.security.access.AccessDeniedException ex) -> {
            response.setContentType("application/json");
            response.setStatus(HttpStatus.FORBIDDEN.value());

            ObjectMapper mapper = new ObjectMapper();
            String message = "Access denied";

            // Check if the request is for admin resources
            if (request.getRequestURI().contains("/admin")) {
                message = "Admin access required. Please sign in as admin to access this resource.";
            }

            String jsonResponse = mapper.writeValueAsString(Map.of(
                    "error", "Access denied",
                    "message", message,
                    "status", HttpStatus.FORBIDDEN.value(),
                    "path", request.getRequestURI()));

            response.getWriter().write(jsonResponse);
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
