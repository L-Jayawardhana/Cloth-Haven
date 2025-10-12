package org.example.clothheaven.DTO;

import java.time.LocalDateTime;

import org.example.clothheaven.Model.ChangeType;
import org.example.clothheaven.Model.Product;

public class InventoryLogsResponseDTO {
    private Long logId;
    private Product product;
    private String color;
    private String size;
    private ChangeType changeType;
    private Integer quantityChanged;
    private LocalDateTime inventoryLogsDate;

    public InventoryLogsResponseDTO() {
    }

    public InventoryLogsResponseDTO(Long logId, Product product, String color, String size, ChangeType changeType, LocalDateTime inventoryLogsDate) {
        this.logId = logId;
        this.product = product;
        this.color = color;
        this.size = size;
        this.changeType = changeType;
        this.inventoryLogsDate = inventoryLogsDate;
    }

    public Long getLogId() {
        return logId;
    }

    public void setLogId(Long logId) {
        this.logId = logId;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
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

    public ChangeType getChangeType() {
        return changeType;
    }

    public void setChangeType(ChangeType changeType) {
        this.changeType = changeType;
    }

    public Integer getQuantityChanged() {
        return quantityChanged;
    }

    public void setQuantityChanged(Integer quantityChanged) {
        this.quantityChanged = quantityChanged;
    }

    public LocalDateTime getInventoryLogsDate() {
        return inventoryLogsDate;
    }

    public void setInventoryLogsDate(LocalDateTime inventoryLogsDate) {
        this.inventoryLogsDate = inventoryLogsDate;
    }
}
