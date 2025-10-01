package org.example.clothheaven.DTO;

import java.math.BigDecimal;

public class OrderItemResponseDTO {
    private Long orderItemId;
    private Long productId;
    private Integer quantity;
    private BigDecimal price;

    // Constructors
    public OrderItemResponseDTO() {}

    public OrderItemResponseDTO(Long orderItemId, Long productId, Integer quantity, BigDecimal price) {
        this.orderItemId = orderItemId;
        this.productId = productId;
        this.quantity = quantity;
        this.price = price;
    }

    // Getters and Setters
    public Long getOrderItemId() { return orderItemId; }
    public void setOrderItemId(Long orderItemId) { this.orderItemId = orderItemId; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}