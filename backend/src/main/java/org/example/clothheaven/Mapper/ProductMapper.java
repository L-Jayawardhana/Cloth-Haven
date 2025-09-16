package org.example.clothheaven.Mapper;

import org.example.clothheaven.DTO.*;
import org.example.clothheaven.Model.Product;
import org.example.clothheaven.Model.Category;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductMapper {

    // ==================== Core Entity Conversions ====================

    /**
     * Convert ProductResponseDTO to new Product entity (for creation)
     */
    public Product toNewEntity(ProductResponseDTO request, Category category) {
        if (request == null) {
            return null;
        }
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setStockQuantity(request.getStockQuantity());
        product.setProductPrice(request.getProductPrice());
        product.setSize(request.getSize());
        product.setColour(request.getColour());
        product.setCategory(category);
        return product;
    }

    /**
     * Update existing Product entity with ProductResponseDTO data
     */
    public Product updateEntity(Product existingProduct, ProductResponseDTO request, Category category) {
        if (request == null || existingProduct == null) {
            return existingProduct;
        }
        existingProduct.setName(request.getName());
        existingProduct.setDescription(request.getDescription());
        existingProduct.setStockQuantity(request.getStockQuantity());
        existingProduct.setProductPrice(request.getProductPrice());
        existingProduct.setSize(request.getSize());
        existingProduct.setColour(request.getColour());
        existingProduct.setCategory(category);
        return existingProduct;
    }

    /**
     * Convert Product entity to ProductCreateDTO
     */
    public ProductCreateDTO toProductCreateDTO(Product product) {
        if (product == null) {
            return null;
        }
        ProductCreateDTO dto = new ProductCreateDTO();
        dto.setProductId(product.getProductId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setProductPrice(product.getProductPrice());
        dto.setSize(product.getSize());
        dto.setColour(product.getColour());
        dto.setCategoryId(product.getCategory() != null ? product.getCategory().getCategoryId() : null);
        dto.setCategoryName(product.getCategory() != null ? product.getCategory().getCategoryName() : null);
        return dto;
    }

    /**
     * Convert ProductResponseDTO to Product entity (with image)
     */
    public Product toEntity(ProductResponseDTO request, Category category, MultipartFile image) {
        Product product = toNewEntity(request, category);
        // If image handling is needed, add logic here (e.g., set image URL or bytes)
        // Example: product.setImage(image.getBytes()); // if Product has an image field
        return product;
    }

    // ==================== Response Builders ====================

    /**
     * Create ProductResponseDTO for successful operations
     */
    public ProductResponseDTO toSuccessResponse(Product product, String message) {
        return new ProductResponseDTO(
                true,
                message,
                product,
                product.getName(),
                product.getDescription(),
                product.getStockQuantity(),
                product.getProductPrice(),
                product.getCategory() != null ? product.getCategory().getCategoryId() : null,
                product.getSize(),
                product.getColour(),
                product.getProductId()
        );
    }

    /**
     * Create ProductResponseDTO for error operations
     */
    public ProductResponseDTO toErrorResponse(String errorMessage) {
        return new ProductResponseDTO(
                false,
                errorMessage,
                null,   // data field is null when error occurs
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );
    }

    /**
     * Convert Product entity to ProductResponseDTO
     */
    public ProductResponseDTO toResponseDTO(Product product) {
        if (product == null) return null;
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setProductId(product.getProductId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setProductPrice(product.getProductPrice());
        dto.setSize(product.getSize());
        dto.setColour(product.getColour());
        dto.setCategoryId(product.getCategory() != null ? product.getCategory().getCategoryId() : null);
        dto.setSuccess(true);
        dto.setMessage("Success");
        return dto;
    }


    public List<ProductResponseDTO> toResponseDTOList(List<Product> products) {
        if (products == null) return null;
        return products.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }
}
