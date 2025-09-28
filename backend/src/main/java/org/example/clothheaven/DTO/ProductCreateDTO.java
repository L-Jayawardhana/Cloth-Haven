package org.example.clothheaven.DTO;

public class ProductCreateDTO {
    private Long productId;
    private String name;
    private String description;
    private Double productPrice;
    private Long categoryId;
    private String categoryName;

    public ProductCreateDTO() {
    }

    public ProductCreateDTO(Long productId, String name, String description, Double productPrice, Long categoryId, String categoryName) {
        this.productId = productId;
        this.name = name;
        this.description = description;
        this.productPrice = productPrice;
        this.categoryId = categoryId;
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


    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
}
