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
public class CategoryController {
    private final CategoryService categoryService;

    @Autowired
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping("/add-category")
    public ResponseEntity<CategoryResponseDTO> addCategory(
            @RequestParam("category") String categoryJson) {

        CategoryResponseDTO response = categoryService.addCategory(categoryJson);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<List<CategoryCreateDTO>> getAllCategories() {
        List<CategoryCreateDTO> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<CategoryCreateDTO> getCategory(@PathVariable Long categoryId) {
        CategoryCreateDTO category = categoryService.getCategoryById(categoryId);
        if (category != null) {
            return ResponseEntity.ok(category);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/update/{categoryId}")
    public ResponseEntity<CategoryResponseDTO> updateCategory(
            @PathVariable Long categoryId,
            @RequestParam("category") String categoryJson) {

        CategoryResponseDTO response = categoryService.updateCategory(categoryId, categoryJson);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete/{categoryId}")
    public ResponseEntity<CategoryResponseDTO> deleteCategory(@PathVariable Long categoryId) {
        CategoryResponseDTO response = categoryService.deleteCategory(categoryId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/names")
    public ResponseEntity<List<String>> getAllCategoryNames() {
        List<String> categories = categoryService.getAllCategoryNames();
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }
}
