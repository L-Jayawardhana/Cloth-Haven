package org.example.clothheaven.DTO;

import org.example.clothheaven.Model.ChangeType;

public class InventoryStockUpdateDTO {
    private Long productId;
    private String color;
    private String size;
    private ChangeType changeType;
    private Integer quantityChange;
    private String reason; // optional reason for the change

    public InventoryStockUpdateDTO() {}

    public InventoryStockUpdateDTO(Long productId, String color, String size, ChangeType changeType, Integer quantityChange, String reason) {
        this.productId = productId;
        this.color = color;
        this.size = size;
        this.changeType = changeType;
        this.quantityChange = quantityChange;
        this.reason = reason;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    
    public ChangeType getChangeType() { return changeType; }
    public void setChangeType(ChangeType changeType) { this.changeType = changeType; }
    
    public Integer getQuantityChange() { return quantityChange; }
    public void setQuantityChange(Integer quantityChange) { this.quantityChange = quantityChange; }
    
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}