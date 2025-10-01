package org.example.clothheaven.DTO;

public class ColorsSizeQuantityAvailabilityResponseDTO {
    private Long id;
    private Long productId;
    private String color; // changed from 'colour' to 'color'
    private String size;
    private Boolean availability; // changed from String to Boolean
    private Integer quantity;

    public ColorsSizeQuantityAvailabilityResponseDTO() {}

    public ColorsSizeQuantityAvailabilityResponseDTO(Long id, Long productId, String color, String size, Boolean availability, Integer quantity) {
        this.id = id;
        this.productId = productId;
        this.color = color;
        this.size = size;
        this.availability = availability;
        this.quantity = quantity;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public Boolean getAvailability() { return availability; }
    public void setAvailability(Boolean availability) { this.availability = availability; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
