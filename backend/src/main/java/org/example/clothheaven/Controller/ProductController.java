package org.example.clothheaven.Controller;

import java.util.List;
import java.util.Map;

import org.example.clothheaven.DTO.DeleteAccountRequest;
import org.example.clothheaven.DTO.ProductResponseDTO;
import org.example.clothheaven.Service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {
    private static final Logger log = LoggerFactory.getLogger(ProductController.class);
    private final ProductService productService;


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

    @PutMapping("/soft-delete/{productId}")
    public ResponseEntity<Boolean> softDeleteProduct(@PathVariable Long productId) {
        boolean deleted = productService.softDeleteProduct(productId);
        return ResponseEntity.ok(deleted);
    }

    @PostMapping("/{productId}/admin-soft-delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adminSoftDeleteProduct(@PathVariable Long productId, @Valid @RequestBody DeleteAccountRequest req) {
        // Get the current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        System.out.println("=== CONTROLLER DEBUG ===");
        System.out.println("Authenticated user email: " + currentUserEmail);
        System.out.println("Target product ID: " + productId);
        System.out.println("Password provided: " + (req.getPassword() != null ? "[PROVIDED]" : "[NULL]"));
        
        boolean deleted = productService.adminSoftDeleteProduct(productId, currentUserEmail, req.getPassword());
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Admin password is incorrect or product cannot be deleted"));
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
