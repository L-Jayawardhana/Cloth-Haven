package org.example.clothheaven.DTO;

public class ProductCreateDTO {
    private Long productId;
    private String name;
    private String description;
    private Integer stockQuantity;
    private Double productPrice;
    private Long categoryId;
    private String size;
    private String colour;
    private String categoryName;

    public ProductCreateDTO() {
    }

    public ProductCreateDTO(Long productId, String name, String description, Integer stockQuantity, Double productPrice, Long categoryId, String size, String colour, String categoryName) {
        this.productId = productId;
        this.name = name;
        this.description = description;
        this.stockQuantity = stockQuantity;
        this.productPrice = productPrice;
        this.categoryId = categoryId;
        this.size = size;
        this.colour = colour;
        this.categoryName = categoryName;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
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

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
}