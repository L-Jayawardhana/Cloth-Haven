package org.example.clothheaven.DTO;

public class ProductCreateDTO {

    private String productName;

    public ProductCreateDTO() {}

    public ProductCreateDTO(String productName) {
        this.productName = productName;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }
}
