package org.example.clothheaven.Controller;

import org.example.clothheaven.DTO.CategoryResponseDTO;
import org.example.clothheaven.DTO.CategoryCreateDTO;
import org.example.clothheaven.Service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*") // Add CORS support if needed
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
            CategoryResponseDTO response = new CategoryResponseDTO(
                    true,
                    "Categories retrieved successfully",
                    categories
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
                        category
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