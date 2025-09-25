package org.example.clothheaven.Mapper;

import org.example.clothheaven.DTO.ProductCreateDTO;
import org.example.clothheaven.DTO.ProductResponseDTO;
import org.example.clothheaven.Model.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public Product toEntity(ProductCreateDTO dto) {
        if (dto == null) {
            return null;
        }

        var product = new Product();
        product.setProductName(dto.getProductName());
        return product;
    }

    public ProductResponseDTO toResponseDTO(Product product) {
        if (product == null) {
            return null;
        }

        var responseDTO = new ProductResponseDTO();
        responseDTO.setProductId(product.getProductId());
        responseDTO.setProductName(product.getProductName());
        return responseDTO;
    }
}
