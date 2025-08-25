package org.example.clothheaven.Service;

import org.example.clothheaven.DTO.ProductCreateDTO;
import org.example.clothheaven.DTO.ProductResponseDTO;
import org.example.clothheaven.Mapper.ProductMapper;
import org.example.clothheaven.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    private final ProductMapper productMapper;

    @Autowired
    public ProductService(ProductRepository productRepository, ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }

    public ProductResponseDTO addProduct(ProductCreateDTO dto) {
        var product = productMapper.toEntity(dto);
        var savedProduct = productRepository.save(product);

        return productMapper.toResponseDTO(savedProduct);
    }
}
