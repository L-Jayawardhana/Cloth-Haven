// CartResponseDTO.java
package org.example.clothheaven.DTO;

import java.time.LocalDateTime;
import java.util.List;

public class CartResponseDTO {
    private Long cartId;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<CartItemResponseDTO> items;

    // Constructors
    public CartResponseDTO() {}

    public CartResponseDTO(Long cartId, Long userId, LocalDateTime createdAt,
                           LocalDateTime updatedAt, List<CartItemResponseDTO> items) {
        this.cartId = cartId;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.items = items;
    }

    // Getters and Setters
    public Long getCartId() { return cartId; }
    public void setCartId(Long cartId) { this.cartId = cartId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<CartItemResponseDTO> getItems() { return items; }
    public void setItems(List<CartItemResponseDTO> items) { this.items = items; }
}
