// CartItemResponseDTO.java
package org.example.clothheaven.DTO;

public class CartItemResponseDTO {
    private Long cartItemId;
    private Long productId;
    private Integer quantity;
    private String size;
    private String color;

    // Constructors
    public CartItemResponseDTO() {
    }

    public CartItemResponseDTO(Long cartItemId, Long productId, Integer quantity) {
        this.cartItemId = cartItemId;
        this.productId = productId;
        this.quantity = quantity;
    }

    public CartItemResponseDTO(Long cartItemId, Long productId, Integer quantity, String size, String color) {
        this.cartItemId = cartItemId;
        this.productId = productId;
        this.quantity = quantity;
        this.size = size;
        this.color = color;
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

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
}