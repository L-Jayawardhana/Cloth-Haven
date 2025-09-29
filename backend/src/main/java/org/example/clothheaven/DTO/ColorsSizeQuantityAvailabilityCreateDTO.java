package org.example.clothheaven.DTO;

public class ColorsSizeQuantityAvailabilityCreateDTO {
    private Long productId;
    private String color;
    private String size;
    private int quantity;
    private Boolean availability;

    public ColorsSizeQuantityAvailabilityCreateDTO() {}

    public ColorsSizeQuantityAvailabilityCreateDTO(Long productId, String color, String size, Boolean availability, int quantity) {
        this.productId = productId;
        this.color = color;
        this.size = size;
        this.availability = availability;
        this.quantity = quantity;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public Boolean getAvailability() { return availability; }
    public void setAvailability(Boolean availability) { this.availability = availability; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}
