package org.example.clothheaven.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.clothheaven.DTO.CategoryResponseDTO;
import org.example.clothheaven.DTO.CategoryCreateDTO;
import org.example.clothheaven.Mapper.CategoryMapper;
import org.example.clothheaven.Model.Category;
import org.example.clothheaven.Repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final ObjectMapper objectMapper;
    private final CategoryMapper categoryMapper;

    @Autowired
    public CategoryService(CategoryRepository categoryRepository,
                           ObjectMapper objectMapper,
                           CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.objectMapper = objectMapper;
        this.categoryMapper = categoryMapper;
    }

    public CategoryResponseDTO addCategory(String categoryJson) {
        try {
            CategoryCreateDTO categoryCreateDTO = objectMapper.readValue(categoryJson, CategoryCreateDTO.class);

            // Use mapper to convert DTO to entity for creation
            Category category = categoryMapper.toNewEntity(categoryCreateDTO);

            Category savedCategory = categoryRepository.save(category);

            // Use mapper to convert saved entity back to DTO
            CategoryCreateDTO savedDTO = categoryMapper.toDTO(savedCategory);

            return new CategoryResponseDTO(true, "Category added successfully", savedDTO);
        } catch (Exception e) {
            return new CategoryResponseDTO(false, "Failed to add category: " + e.getMessage());
        }
    }

    public List<CategoryCreateDTO> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        // Use mapper to convert list of entities to DTOs
        return categoryMapper.toDTOList(categories);
    }

    public CategoryCreateDTO getCategoryById(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .map(categoryMapper::toDTO)
                .orElse(null);
    }

    public CategoryResponseDTO updateCategory(Long categoryId, String categoryJson) {
        try {
            CategoryCreateDTO categoryCreateDTO = objectMapper.readValue(categoryJson, CategoryCreateDTO.class);

            Category category = categoryRepository.findById(categoryId).orElse(null);
            if (category == null) {
                return new CategoryResponseDTO(false, "Category not found");
            }

            // Use mapper to update existing entity with DTO data
            categoryMapper.updateEntity(category, categoryCreateDTO);

            // Save updated category
            Category updatedCategory = categoryRepository.save(category);

            // Use mapper to convert updated entity to DTO
            CategoryCreateDTO updatedDTO = categoryMapper.toDTO(updatedCategory);

            return new CategoryResponseDTO(true, "Category updated successfully", updatedDTO);
        } catch (Exception e) {
            return new CategoryResponseDTO(false, "Failed to update category: " + e.getMessage());
        }
    }

    public CategoryResponseDTO deleteCategory(Long categoryId) {
        try {
            Category category = categoryRepository.findById(categoryId).orElse(null);
            if (category == null) {
                return new CategoryResponseDTO(false, "Category not found");
            }

            // Delete from database
            categoryRepository.delete(category);

            return new CategoryResponseDTO(true, "Category deleted successfully");
        } catch (Exception e) {
            return new CategoryResponseDTO(false, "Failed to delete category: " + e.getMessage());
        }
    }

    public List<String> getAllCategoryNames() {
        return categoryRepository.findAll().stream()
                .map(Category::getCategoryName)
                .toList();
    }
}