package org.example.clothheaven.DTO;

public class ProductResponseDTO {
    private boolean success;
    private String message;
    private Object data;
    private String name;
    private String description;
    private Integer stockQuantity;
    private Double productPrice;
    private Long categoryId;
    private String size;
    private String colour;
    private Long productId;

    public ProductResponseDTO() {
    }

    public ProductResponseDTO(boolean success, String message, Object data, String name, String description, Integer stockQuantity, Double productPrice, Long categoryId, String size, String colour, Long productId) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.name = name;
        this.description = description;
        this.stockQuantity = stockQuantity;
        this.productPrice = productPrice;
        this.categoryId = categoryId;
        this.size = size;
        this.colour = colour;
        this.productId = productId;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Double getProductPrice() {
        return productPrice;
    }

    public void setProductPrice(Double productPrice) {
        this.productPrice = productPrice;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getColour() {
        return colour;
    }

    public void setColour(String colour) {
        this.colour = colour;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }
}
