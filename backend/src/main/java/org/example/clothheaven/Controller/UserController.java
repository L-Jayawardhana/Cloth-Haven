package org.example.clothheaven.Controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.example.clothheaven.DTO.DeleteAccountRequest;
import org.example.clothheaven.DTO.PasswordChangeRequest;
import org.example.clothheaven.DTO.UserCreateDTO;
import org.example.clothheaven.DTO.UserResponseDTO;
import org.example.clothheaven.DTO.UserUpdateDTO;
import org.example.clothheaven.Model.User;
import org.example.clothheaven.Service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping({"/api/v1/users"})
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" })
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable Long userId) {
        Optional<User> user = userService.getUserById(userId);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@Valid @RequestBody UserCreateDTO req) {
        // Get the current authenticated user's role
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserRole = authentication.getAuthorities().toString();
        
        // Double-check authorization (redundant with @PreAuthorize but adds explicit validation)
        if (!currentUserRole.contains("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Access denied", 
                           "message", "Only ADMIN users can create new users"));
        }
        
        UserResponseDTO createdUser = userService.addUser(req);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @Valid @RequestBody UserUpdateDTO req) {
        try {
            User userDetails = new User();
            userDetails.setUsername(req.getUsername());
            userDetails.setEmail(req.getEmail());
            userDetails.setPhoneNo(req.getPhoneNo());
            userDetails.setAddress(req.getAddress());
            // Don't set role - users can't change their own role

            User updatedUser = userService.updateUser(userId, userDetails);
            return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully",
                "user", updatedUser
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Update failed", "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error", "message", "Unable to update profile"));
        }
    }

    @PutMapping("/{userId}/password")
    public ResponseEntity<?> changePassword(@PathVariable Long userId, @Valid @RequestBody PasswordChangeRequest req,
            Authentication authentication) {
        
        // Get the authenticated user's email from the security context
        String authenticatedUserEmail = authentication.getName();
        
        // Find the authenticated user to get their ID
        Optional<User> authenticatedUserOpt = userService.getUserByEmail(authenticatedUserEmail);
        if (authenticatedUserOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not found"));
        }
        
        Long authenticatedUserId = authenticatedUserOpt.get().getUserId();

        // Users can only change their own password (unless they're admin)
        if (!userId.equals(authenticatedUserId) && !authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only change your own password"));
        }

        boolean success = userService.changePassword(userId, req.getCurrentPassword(), req.getNewPassword());

        if (success) {
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Current password is incorrect"));
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{userId}/delete-account")
    public ResponseEntity<?> deleteAccount(@PathVariable Long userId, @Valid @RequestBody DeleteAccountRequest req) {
        boolean deleted = userService.deleteUserWithPassword(userId, req.getPassword());
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Password is incorrect"));
    }

    @PostMapping("/{userId}/admin-delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adminDeleteUser(@PathVariable Long userId, @Valid @RequestBody DeleteAccountRequest req) {
        // Get the current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        System.out.println("=== CONTROLLER DEBUG ===");
        System.out.println("Authenticated user email: " + currentUserEmail);
        System.out.println("Target user ID: " + userId);
        System.out.println("Password provided: " + (req.getPassword() != null ? "[PROVIDED]" : "[NULL]"));
        
        boolean deleted = userService.adminDeleteUser(userId, currentUserEmail, req.getPassword());
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Admin password is incorrect"));
    }
}
