package org.example.clothheaven.Controller;

import org.example.clothheaven.DTO.ProductCreateDTO;
import org.example.clothheaven.DTO.ProductResponseDTO;
import org.example.clothheaven.Service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping("/addProduct")
    public ResponseEntity<ProductResponseDTO> addProduct(@RequestBody ProductCreateDTO productCreateDTO) {
        ProductResponseDTO createdProduct = productService.addProduct(productCreateDTO);
        return ResponseEntity.status(201).body(createdProduct);
    }
}
