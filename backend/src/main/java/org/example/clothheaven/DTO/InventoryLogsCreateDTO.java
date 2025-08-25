package org.example.clothheaven.DTO;

import org.example.clothheaven.Model.ChangeType;
import org.example.clothheaven.Model.Product;

import java.time.LocalDateTime;

public class InventoryLogsCreateDTO {
    private Product product;
    private ChangeType changeType;
    private Integer quantityChanged;
    private LocalDateTime inventoryLogsDate;

    public InventoryLogsCreateDTO() {
    }

    public InventoryLogsCreateDTO(Product product, ChangeType changeType, LocalDateTime inventoryLogsDate) {
        this.product = product;
        this.changeType = changeType;
        this.inventoryLogsDate = inventoryLogsDate;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
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
