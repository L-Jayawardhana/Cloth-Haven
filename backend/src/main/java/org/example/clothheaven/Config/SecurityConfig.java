package org.example.clothheaven.Config;

import java.util.Map;

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

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

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
                        // Health check
                        .requestMatchers("/actuator/**").permitAll()
                        
                        // Authentication endpoints - public
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        
                        // Product endpoints
                        .requestMatchers("GET", "/api/v1/products/**").permitAll() // Anyone can view products
                        .requestMatchers("POST", "/api/v1/products/**").hasAnyRole("ADMIN", "STAFF") // Only admin/staff can create
                        .requestMatchers("PUT", "/api/v1/products/**").hasAnyRole("ADMIN", "STAFF") // Only admin/staff can update
                        .requestMatchers("DELETE", "/api/v1/products/**").hasRole("ADMIN") // Only admin can delete
                        
                        // Category endpoints
                        .requestMatchers("GET", "/api/v1/categories/**").permitAll() // Anyone can view categories
                        .requestMatchers("POST", "/api/v1/categories/**").hasAnyRole("ADMIN", "STAFF") // Only admin/staff can create
                        .requestMatchers("PUT", "/api/v1/categories/**").hasAnyRole("ADMIN", "STAFF") // Only admin/staff can update
                        .requestMatchers("DELETE", "/api/v1/categories/**").hasRole("ADMIN") // Only admin can delete
                        
                        // Sub-category endpoints
                        .requestMatchers("GET", "/api/v1/sub-categories/**").permitAll() // Anyone can view subcategories
                        .requestMatchers("POST", "/api/v1/sub-categories/**").hasAnyRole("ADMIN", "STAFF") // Only admin/staff can create
                        .requestMatchers("PUT", "/api/v1/sub-categories/**").hasAnyRole("ADMIN", "STAFF") // Only admin/staff can update
                        .requestMatchers("DELETE", "/api/v1/sub-categories/**").hasRole("ADMIN") // Only admin can delete
                        
                        // Image endpoints
                        .requestMatchers("GET", "/api/v1/images/**").permitAll() // Anyone can view images
                        .requestMatchers("POST", "/api/v1/images/**").hasAnyRole("ADMIN", "STAFF") // Only admin/staff can upload
                        .requestMatchers("PUT", "/api/v1/images/**").hasAnyRole("ADMIN", "STAFF") // Only admin/staff can update
                        .requestMatchers("DELETE", "/api/v1/images/**").hasRole("ADMIN") // Only admin can delete
                        
                        // Color/Size/Quantity endpoints
                        .requestMatchers("GET", "/api/v1/colors-size-quantity-availability/**").permitAll() // Anyone can view inventory
                        .requestMatchers("POST", "/api/v1/colors-size-quantity-availability/**").hasAnyRole("ADMIN", "STAFF") // Only admin/staff can add
                        .requestMatchers("PUT", "/api/v1/colors-size-quantity-availability/**").hasAnyRole("ADMIN", "STAFF") // Only admin/staff can update
                        .requestMatchers("DELETE", "/api/v1/colors-size-quantity-availability/**").hasRole("ADMIN") // Only admin can delete
                        
                        // Inventory logs endpoints - admin and staff only
                        .requestMatchers("/api/v1/inventoryLogs/**").hasAnyRole("ADMIN", "STAFF")
                        
                        // Sales report endpoints - admin and staff only
                        .requestMatchers("/api/v1/sales-report/**").hasAnyRole("ADMIN", "STAFF")
                        
                        // User management endpoints
                        .requestMatchers("GET", "/api/v1/users").hasRole("ADMIN") // Only admin can list all users
                        .requestMatchers("GET", "/api/v1/users/{id}").authenticated() // Users can view their own profile
                        .requestMatchers("PUT", "/api/v1/users/**").authenticated() // Users can update their own profile
                        .requestMatchers("DELETE", "/api/v1/users/**").hasRole("ADMIN") // Only admin can delete users
                        
                        // Staff endpoints - admin only
                        .requestMatchers("/api/v1/staff/**").hasRole("ADMIN")
                        
                        // Cart endpoints - authenticated users only
                        .requestMatchers("/api/v1/cart/**").authenticated()
                        
                        // Order endpoints - authenticated users only
                        .requestMatchers("/api/v1/orders/**").authenticated()
                        
                        // Any other request requires authentication
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
