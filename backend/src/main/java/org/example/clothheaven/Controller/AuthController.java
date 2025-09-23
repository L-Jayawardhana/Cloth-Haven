package org.example.clothheaven.Controller;

import jakarta.validation.Valid;
import org.example.clothheaven.DTO.LoginRequest;
import org.example.clothheaven.Model.User;
import org.example.clothheaven.Repository.UserRepository;
import org.example.clothheaven.Util.JwtUtil;
import org.example.clothheaven.DTO.ForgotPasswordRequest;
import org.example.clothheaven.DTO.ResetPasswordRequest;
import org.example.clothheaven.Model.PasswordResetToken;
import org.example.clothheaven.Repository.PasswordResetTokenRepository;
import org.example.clothheaven.Service.EmailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
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
        private final PasswordResetTokenRepository tokenRepository;
        private final EmailService emailService;

        public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                        PasswordResetTokenRepository tokenRepository, EmailService emailService) {
                this.userRepository = userRepository;
                this.passwordEncoder = passwordEncoder;
                this.jwtUtil = jwtUtil;
                this.tokenRepository = tokenRepository;
                this.emailService = emailService;
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
                u.setAddress(req.address());
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
                body.put("phoneNo", u.getPhoneNo());
                body.put("address", u.getAddress());
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
                body.put("phoneNo", user.getPhoneNo());
                body.put("address", user.getAddress());
                body.put("role", user.getRole());
                body.put("createdAt", user.getCreatedAt());
                body.put("token", token);

                return ResponseEntity.ok(body);
        }

        @PostMapping("/forgot-password")
        public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
                Optional<User> userOpt = userRepository.findByEmail(req.getEmail());
                if (userOpt.isEmpty()) {
                        // Don't reveal if email exists or not for security
                        return ResponseEntity.ok(Map.of("message", "If the email exists, a reset code has been sent"));
                }

                // Generate 6-digit verification code
                String resetCode = generateResetCode();

                // Save or update reset token
                Optional<PasswordResetToken> existingToken = tokenRepository.findByEmailAndUsedFalse(req.getEmail());
                PasswordResetToken token = existingToken.orElse(new PasswordResetToken());
                token.setEmail(req.getEmail());
                token.setToken(resetCode);
                token.setExpiryDate(LocalDateTime.now().plusHours(1));
                token.setUsed(false);
                tokenRepository.save(token);

                // Send email
                emailService.sendPasswordResetEmail(req.getEmail(), resetCode);

                return ResponseEntity.ok(Map.of("message", "If the email exists, a reset code has been sent"));
        }

        @PostMapping("/reset-password")
        public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
                Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(req.getToken());
                if (tokenOpt.isEmpty() || tokenOpt.get().isUsed() ||
                                tokenOpt.get().getExpiryDate().isBefore(LocalDateTime.now())) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(Map.of("message", "Invalid or expired reset code"));
                }

                PasswordResetToken token = tokenOpt.get();
                Optional<User> userOpt = userRepository.findByEmail(token.getEmail());
                if (userOpt.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(Map.of("message", "User not found"));
                }

                // Update password
                User user = userOpt.get();
                user.setPw(passwordEncoder.encode(req.getNewPassword()));
                userRepository.save(user);

                // Mark token as used
                token.setUsed(true);
                tokenRepository.save(token);

                return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        }

        private String generateResetCode() {
                SecureRandom random = new SecureRandom();
                int code = 100000 + random.nextInt(900000); // 6-digit code
                return String.valueOf(code);
        }

        public record RegisterRequest(
                        String username,
                        String email,
                        String phoneNo,
                        String address,
                        String pw,
                        String role) {
        }
}
