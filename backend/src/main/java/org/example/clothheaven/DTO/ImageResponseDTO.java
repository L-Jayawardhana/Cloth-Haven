package org.example.clothheaven.DTO;

public class ImageResponseDTO {
    private Long imageId;
    private String imageUrl;
    private Long productId;

    public ImageResponseDTO() {}

    public ImageResponseDTO(Long imageId, String imageUrl, Long productId) {
        this.imageId = imageId;
        this.imageUrl = imageUrl;
        this.productId = productId;
    }

    public Long getImageId() {
        return imageId;
    }

    public void setImageId(Long imageId) {
        this.imageId = imageId;
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
}
