package org.example.clothheaven.Controller;

import org.example.clothheaven.DTO.CartResponseDTO;
import org.example.clothheaven.DTO.ProductCreateDTO;
import org.example.clothheaven.DTO.ProductResponseDTO;
import org.example.clothheaven.Service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    @GetMapping("{productId}")
    public ResponseEntity<ProductResponseDTO> getProductByproductId(@PathVariable Long productId) {
        ProductResponseDTO productResponse = productService.getProductByproductId(productId);
        return ResponseEntity.ok(productResponse);
    }
    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }
}