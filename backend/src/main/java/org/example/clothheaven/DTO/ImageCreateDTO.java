package org.example.clothheaven.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public class ImageCreateDTO {

    @NotBlank(message = "Image URL is required and cannot be empty")
    @Pattern(regexp = "^(https?://).*\\.(jpg|jpeg|png|gif|bmp|webp)$",
            message = "Image URL must be a valid URL ending with a supported image format (jpg, jpeg, png, gif, bmp, webp)")
    private String imageUrl;

    @NotNull(message = "Product ID is required")
    @Positive(message = "Product ID must be a positive number")
    private Long productId;

    public ImageCreateDTO() {}

    public ImageCreateDTO(String imageUrl, Long productId) {
        this.imageUrl = imageUrl;
        this.productId = productId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    @Override
    public String toString() {
        return "ImageCreateDTO{" +
                "imageUrl='" + imageUrl + '\'' +
                ", productId=" + productId +
                '}';
    }
}