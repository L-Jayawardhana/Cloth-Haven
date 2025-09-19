package org.example.clothheaven.Controller;

import org.example.clothheaven.DTO.ProductResponseDTO;
import org.example.clothheaven.Model.Product;
import org.example.clothheaven.Service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private static final Logger log = LoggerFactory.getLogger(ProductController.class);
    private final ProductService productService;

    // Explicit constructor for final fields
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping("/add-product")
    public ResponseEntity<ProductResponseDTO> addProduct(@RequestBody ProductResponseDTO productRequest) {
        log.info("Received product request: {}", productRequest);
        try {
            ProductResponseDTO response = productService.addProduct(productRequest, null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error adding product: {}", e.getMessage(), e);
            ProductResponseDTO errorResponse = new ProductResponseDTO();
            errorResponse.setSuccess(false);
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/get-products")
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProductCreateDTO());
    }

    @GetMapping("/get-products-with-category")
    public ResponseEntity<List<ProductResponseDTO>> getAllProductsWithCategory() {
        return ResponseEntity.ok(productService.getAllProductCreateDTO());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductResponseDTO>> getProductsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
    }

    @GetMapping("/sub-category/{subCategoryId}")
    public ResponseEntity<List<ProductResponseDTO>> getProductsBySubCategory(@PathVariable Long subCategoryId) {
        return ResponseEntity.ok(productService.getProductsBySubCategory(subCategoryId));
    }

    // The following endpoints are obsolete since size and colour are no longer in Product.
    // Use ColorsSizeQuantityAvailabilityController for filtering by size/colour instead.
    // @GetMapping("/size/{size}")
    // public ResponseEntity<List<ProductResponseDTO>> getProductsBySize(@PathVariable String size) {
    //     return ResponseEntity.ok(productService.getProductsBySize(size));
    // }

    // @GetMapping("/colour/{colour}")
    // public ResponseEntity<List<ProductResponseDTO>> getProductsByColour(@PathVariable String colour) {
    //     return ResponseEntity.ok(productService.getProductsByColour(colour));
    // }

    @GetMapping("/price-range")
    public ResponseEntity<List<ProductResponseDTO>> getProductsByPriceRange(@RequestParam Double minPrice, @RequestParam Double maxPrice) {
        return ResponseEntity.ok(productService.getProductsByPriceRange(minPrice, maxPrice));
    }

    @DeleteMapping("/delete/{productId}")
    public ResponseEntity<Boolean> deleteProduct(@PathVariable Long productId) {
        boolean deleted = productService.deleteProduct(productId);
        return ResponseEntity.ok(deleted);
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponseDTO> getProductById(@PathVariable Long productId) {
        ProductResponseDTO product = productService.getProductById(productId);
        if (product != null) {
            return ResponseEntity.ok(product);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/update/{productId}")
    public ResponseEntity<ProductResponseDTO> updateProduct(@PathVariable Long productId, @RequestBody ProductResponseDTO productRequest) {
        ProductResponseDTO response = productService.updateProduct(productId, productRequest);
        return ResponseEntity.ok(response);
    }
}
