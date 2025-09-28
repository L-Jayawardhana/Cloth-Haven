package org.example.clothheaven.DTO;

import jakarta.validation.constraints.NotNull;

public class CreateOrderDTO {
    @NotNull(message = "User ID is required")
    private Long userId;

    // Constructors
    public CreateOrderDTO() {}

    public CreateOrderDTO(Long userId) {
        this.userId = userId;
    }

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
