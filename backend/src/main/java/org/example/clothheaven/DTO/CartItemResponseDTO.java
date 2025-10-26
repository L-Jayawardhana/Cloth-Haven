// CartItemResponseDTO.java
package org.example.clothheaven.DTO;

public class CartItemResponseDTO {
    private Long cartItemId;
    private Long productId;
    private Integer quantity;
    private String color;
    private String size;

    // Constructors
    public CartItemResponseDTO() {
    }

    public CartItemResponseDTO(Long cartItemId, Long productId, Integer quantity, String color, String size) {
        this.cartItemId = cartItemId;
        this.productId = productId;
        this.quantity = quantity;
        this.color = color;
        this.size = size;
    }

    // Getters and Setters
    public Long getCartItemId() {
        return cartItemId;
    }

    public void setCartItemId(Long cartItemId) {
        this.cartItemId = cartItemId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }
}