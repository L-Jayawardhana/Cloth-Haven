package org.example.clothheaven.Controller;

import jakarta.validation.Valid;
import org.example.clothheaven.DTO.LoginRequest;
import org.example.clothheaven.DTO.LoginResponse;
import org.example.clothheaven.Model.User;
import org.example.clothheaven.Repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" })
public class AuthController {

        private final UserRepository userRepository;

        public AuthController(UserRepository userRepository) {
                this.userRepository = userRepository;
        }

        @PostMapping("/register")
        public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
                Optional<User> existing = userRepository.findByEmail(req.email());
                if (existing.isPresent()) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                        .body(Map.of("message", "Email already registered"));
                }

                User u = new User();
                u.setUsername(req.username());
                u.setEmail(req.email());
                u.setPhoneNo(req.phoneNo());
                u.setPw(req.pw()); // NOTE: In production, add password hashing
                u.setRole(req.role() == null || req.role().isBlank() ? "CUSTOMER" : req.role());
                u.setCreatedAt(LocalDateTime.now());
                userRepository.save(u);

                LoginResponse response = LoginResponse.builder()
                                .userid(u.getUserId())
                                .username(u.getUsername())
                                .email(u.getEmail())
                                .role(u.getRole())
                                .build();

                return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }

        @PostMapping("/login")
        public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
                Optional<User> u = userRepository.findByEmail(req.getEmail());
                if (u.isEmpty() || !u.get().getPw().equals(req.getPassword())) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                        .body(Map.of("message", "Invalid email or password"));
                }

                User user = u.get();
                LoginResponse response = LoginResponse.builder()
                                .userid(user.getUserId())
                                .username(user.getUsername())
                                .email(user.getEmail())
                                .role(user.getRole())
                                .build();

                return ResponseEntity.ok(response);
        }

        public record RegisterRequest(
                        String username,
                        String email,
                        String phoneNo,
                        String pw,
                        String role) {
        }
}
