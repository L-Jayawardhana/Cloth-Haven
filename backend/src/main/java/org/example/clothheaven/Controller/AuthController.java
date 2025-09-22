package org.example.clothheaven.Controller;

import jakarta.validation.Valid;
import org.example.clothheaven.DTO.LoginRequest;
import org.example.clothheaven.DTO.LoginResponse;
import org.example.clothheaven.Model.User;
import org.example.clothheaven.Repository.UserRepository;
import org.example.clothheaven.Util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" })
public class AuthController {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtUtil jwtUtil;

        public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
                this.userRepository = userRepository;
                this.passwordEncoder = passwordEncoder;
                this.jwtUtil = jwtUtil;
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
                u.setPw(passwordEncoder.encode(req.pw()));
                u.setRole(req.role() == null || req.role().isBlank() ? "CUSTOMER" : req.role());
                u.setCreatedAt(LocalDateTime.now());
                userRepository.save(u);

                Map<String, Object> claims = new HashMap<>();
                claims.put("role", u.getRole());
                claims.put("userid", u.getUserId());
                String token = jwtUtil.generateToken(u.getEmail(), claims);

                Map<String, Object> body = new HashMap<>();
                body.put("userid", u.getUserId());
                body.put("username", u.getUsername());
                body.put("email", u.getEmail());
                body.put("role", u.getRole());
                body.put("token", token);

                return ResponseEntity.status(HttpStatus.CREATED).body(body);
        }

        @PostMapping("/login")
        public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
                Optional<User> u = userRepository.findByEmail(req.getEmail());
                if (u.isEmpty() || !passwordEncoder.matches(req.getPassword(), u.get().getPw())) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                        .body(Map.of("message", "Invalid email or password"));
                }

                User user = u.get();

                Map<String, Object> claims = new HashMap<>();
                claims.put("role", user.getRole());
                claims.put("userid", user.getUserId());
                String token = jwtUtil.generateToken(user.getEmail(), claims);

                Map<String, Object> body = new HashMap<>();
                body.put("userid", user.getUserId());
                body.put("username", user.getUsername());
                body.put("email", user.getEmail());
                body.put("role", user.getRole());
                body.put("token", token);

                return ResponseEntity.ok(body);
        }

        public record RegisterRequest(
                        String username,
                        String email,
                        String phoneNo,
                        String pw,
                        String role) {
        }
}
