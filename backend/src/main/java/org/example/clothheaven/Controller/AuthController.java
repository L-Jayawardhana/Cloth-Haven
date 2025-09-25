package org.example.clothheaven.Controller;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.example.clothheaven.DTO.ForgotPasswordRequest;
import org.example.clothheaven.DTO.LoginRequest;
import org.example.clothheaven.DTO.LoginResponse;
import org.example.clothheaven.DTO.ResetPasswordRequest;
import org.example.clothheaven.DTO.UserCreateDTO;
import org.example.clothheaven.Model.PasswordResetToken;
import org.example.clothheaven.Model.User;
import org.example.clothheaven.Repository.PasswordResetTokenRepository;
import org.example.clothheaven.Repository.UserRepository;
import org.example.clothheaven.Service.EmailService;
import org.example.clothheaven.Service.StaffService;
import org.example.clothheaven.Util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" })
public class AuthController {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtUtil jwtUtil;
        private final PasswordResetTokenRepository tokenRepository;
        private final EmailService emailService;
        private final StaffService staffService;

        public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                        PasswordResetTokenRepository tokenRepository, EmailService emailService, StaffService staffService) {
                this.userRepository = userRepository;
                this.passwordEncoder = passwordEncoder;
                this.jwtUtil = jwtUtil;
                this.tokenRepository = tokenRepository;
                this.emailService = emailService;
                this.staffService = staffService;
        }

        @PostMapping("/register")
        public ResponseEntity<?> register(@Valid @RequestBody UserCreateDTO req) {
                Optional<User> existing = userRepository.findByEmail(req.getEmail());
                if (existing.isPresent()) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                        .body(Map.of("message", "Email already registered"));
                }

                User u = new User();
                u.setUsername(req.getUsername());
                u.setEmail(req.getEmail());
                u.setPhoneNo(req.getPhoneNo());
                u.setAddress(req.getAddress());
                u.setPw(passwordEncoder.encode(req.getPw()));
                u.setRole(req.getRole() == null || req.getRole().isBlank() ? "CUSTOMER" : req.getRole());
                u.setCreatedAt(LocalDateTime.now());
                User savedUser = userRepository.save(u);

                // If the user is being registered as STAFF, create a Staff entity
                if ("STAFF".equals(savedUser.getRole())) {
                    staffService.createStaff(savedUser);
                }

                Map<String, Object> claims = new HashMap<>();
                claims.put("role", savedUser.getRole());
                claims.put("userid", savedUser.getUserId());
                String token = jwtUtil.generateToken(savedUser.getEmail(), claims);

                LoginResponse response = LoginResponse.builder()
                        .userid(savedUser.getUserId())
                        .username(savedUser.getUsername())
                        .email(savedUser.getEmail())
                        .phoneNo(savedUser.getPhoneNo())
                        .address(savedUser.getAddress())
                        .role(savedUser.getRole())
                        .createdAt(savedUser.getCreatedAt())
                        .token(token)
                        .build();

                return ResponseEntity.status(HttpStatus.CREATED).body(response);
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

                // Determine redirect URL based on user role
                String redirectUrl = "ADMIN".equals(user.getRole()) ? "http://localhost:5173/admin" : "http://localhost:5173/";

                LoginResponse response = LoginResponse.builder()
                        .userid(user.getUserId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .phoneNo(user.getPhoneNo())
                        .address(user.getAddress())
                        .role(user.getRole())
                        .createdAt(user.getCreatedAt())
                        .token(token)
                        .redirectUrl(redirectUrl)
                        .build();

                return ResponseEntity.ok(response);
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
}
