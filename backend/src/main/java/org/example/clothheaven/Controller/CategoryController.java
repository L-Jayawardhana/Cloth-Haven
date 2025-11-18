package org.example.clothheaven.Controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.example.clothheaven.DTO.CategoryCreateDTO;
import org.example.clothheaven.DTO.CategoryResponseDTO;
import org.example.clothheaven.DTO.DeleteAccountRequest;
import org.example.clothheaven.Service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {
    private final CategoryService categoryService;

    @Autowired
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping("/add-category")
    public ResponseEntity<CategoryResponseDTO> addCategory(
            @RequestBody CategoryCreateDTO categoryCreateDTO) {

        try {
            CategoryResponseDTO response = categoryService.addCategory(categoryCreateDTO);
            if (response.isSuccess()) {
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            CategoryResponseDTO errorResponse = new CategoryResponseDTO(
                    false,
                    "Internal server error: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<CategoryResponseDTO> getAllCategories() {
        try {
            List<CategoryCreateDTO> categories = categoryService.getAllCategories();
            List<String> categoryNames = categories.stream()
                    .map(CategoryCreateDTO::getCategoryName)
                    .collect(Collectors.toList());
            CategoryResponseDTO response = new CategoryResponseDTO(
                    true,
                    "Categories retrieved successfully",
                    categoryNames,
                    categories  // Include full category data
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            CategoryResponseDTO errorResponse = new CategoryResponseDTO(
                    false,
                    "Failed to retrieve categories: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<CategoryResponseDTO> getCategory(@PathVariable Long categoryId) {
        try {
            CategoryCreateDTO category = categoryService.getCategoryById(categoryId);
            if (category != null) {
                CategoryResponseDTO response = new CategoryResponseDTO(
                        true,
                        "Category retrieved successfully",
                        List.of(category.getCategoryName())
                );
                return ResponseEntity.ok(response);
            } else {
                CategoryResponseDTO response = new CategoryResponseDTO(
                        false,
                        "Category not found with ID: " + categoryId
                );
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            CategoryResponseDTO errorResponse = new CategoryResponseDTO(
                    false,
                    "Failed to retrieve category: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/update/{categoryId}")
    public ResponseEntity<CategoryResponseDTO> updateCategory(
            @PathVariable Long categoryId,
            @RequestBody CategoryCreateDTO categoryCreateDTO) {

        try {
            CategoryResponseDTO response = categoryService.updateCategory(categoryId, categoryCreateDTO);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            CategoryResponseDTO errorResponse = new CategoryResponseDTO(
                    false,
                    "Internal server error: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/delete/{categoryId}")
    public ResponseEntity<CategoryResponseDTO> deleteCategory(@PathVariable Long categoryId) {
        try {
            CategoryResponseDTO response = categoryService.deleteCategory(categoryId);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            CategoryResponseDTO errorResponse = new CategoryResponseDTO(
                    false,
                    "Failed to delete category: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/{categoryId}/admin-delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adminDeleteCategory(@PathVariable Long categoryId, @Valid @RequestBody DeleteAccountRequest req) {
        // Get the current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        System.out.println("=== CONTROLLER DEBUG ===");
        System.out.println("Authenticated user email: " + currentUserEmail);
        System.out.println("Target category ID: " + categoryId);
        System.out.println("Password provided: " + (req.getPassword() != null ? "[PROVIDED]" : "[NULL]"));
        
        boolean deleted = categoryService.adminDeleteCategory(categoryId, currentUserEmail, req.getPassword());
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Category deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Admin password is incorrect or category cannot be deleted"));
    }

    @GetMapping("/names")
    public ResponseEntity<CategoryResponseDTO> getAllCategoryNames() {
        try {
            List<String> categoryNames = categoryService.getAllCategoryNames();
            CategoryResponseDTO response = new CategoryResponseDTO(
                    true,
                    "Category names retrieved successfully",
                    categoryNames
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            CategoryResponseDTO errorResponse = new CategoryResponseDTO(
                    false,
                    "Failed to retrieve category names: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}