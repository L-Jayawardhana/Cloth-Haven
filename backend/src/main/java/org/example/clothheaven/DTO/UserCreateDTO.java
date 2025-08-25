package org.example.clothheaven.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.example.clothheaven.Model.Role;

public class UserCreateDTO {

    @NotBlank(message = "Username is required")
    private String username;

    @NotNull(message = "Role is required")
    private Role role;

    public UserCreateDTO() {}

    public UserCreateDTO(String username, Role role) {
        this.username = username;
        this.role = role;
    }

    // Getters and Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
