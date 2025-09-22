package org.example.clothheaven.Controller;

import jakarta.validation.Valid;
import org.example.clothheaven.DTO.PasswordChangeRequest;
import org.example.clothheaven.Model.User;
import org.example.clothheaven.Service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
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
    public ResponseEntity<User> createUser(@Valid @RequestBody CreateUserRequest req) {
        User user = new User();
        user.setUsername(req.username());
        user.setEmail(req.email());
        user.setPhoneNo(req.phoneNo());
        user.setAddress(req.address());
        user.setPw(req.pw());
        user.setRole(req.role());

        User savedUser = userService.createUser(user);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable Long userId, @Valid @RequestBody UpdateUserRequest req) {
        try {
            User userDetails = new User();
            userDetails.setUsername(req.username());
            userDetails.setEmail(req.email());
            userDetails.setPhoneNo(req.phoneNo());
            userDetails.setAddress(req.address());
            userDetails.setRole(req.role());

            User updatedUser = userService.updateUser(userId, userDetails);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{userId}/password")
    public ResponseEntity<?> changePassword(@PathVariable Long userId, @Valid @RequestBody PasswordChangeRequest req) {
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

    public record CreateUserRequest(
            String username,
            String email,
            String phoneNo,
            String address,
            String pw,
            String role) {
    }

    public record UpdateUserRequest(
            String username,
            String email,
            String phoneNo,
            String address,
            String role) {
    }
}
