package org.example.clothheaven.user;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<User> list() {
        return userRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<User> create(@Valid @RequestBody CreateUserRequest req) {
        User u = new User();
        u.setUsername(req.username());
        u.setEmail(req.email());
        u.setPhoneNo(req.phoneNo());
        u.setPw(req.pw());
        u.setRole(req.role());
        u.setCreatedAt(LocalDateTime.now());
        return new ResponseEntity<>(userRepository.save(u), HttpStatus.CREATED);
    }

    public record CreateUserRequest(
            @NotBlank String username,
            @Email String email,
            String phoneNo,
            @NotBlank String pw,
            @NotBlank String role) {
    }
}
