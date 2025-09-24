package org.example.clothheaven.DTO;

import jakarta.validation.constraints.NotNull;
import org.example.clothheaven.Model.OrderStatus;

public class UpdateOrderStatusDTO {
    @NotNull(message = "Status is required")
    private OrderStatus status;

    // Constructors
    public UpdateOrderStatusDTO() {}

    public UpdateOrderStatusDTO(OrderStatus status) {
        this.status = status;
    }

    // Getters and Setters
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
}