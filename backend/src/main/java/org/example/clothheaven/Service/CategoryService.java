package org.example.clothheaven.Service;

import org.example.clothheaven.DTO.CategoryResponseDTO;
import org.example.clothheaven.DTO.CategoryCreateDTO;
import org.example.clothheaven.Mapper.CategoryMapper;
import org.example.clothheaven.Model.Category;
import org.example.clothheaven.Repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Autowired
    public CategoryService(CategoryRepository categoryRepository,
                           CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
    }

    public CategoryResponseDTO addCategory(CategoryCreateDTO categoryCreateDTO) {
        try {
            // Validate input
            if (categoryCreateDTO == null) {
                return new CategoryResponseDTO(false, "Category data is required");
            }

            if (categoryCreateDTO.getCategoryName() == null ||
                    categoryCreateDTO.getCategoryName().trim().isEmpty()) {
                return new CategoryResponseDTO(false, "Category name is required");
            }

            String categoryName = categoryCreateDTO.getCategoryName().trim();

            // Check if category already exists
            if (categoryRepository.existsByCategoryName(categoryName)) {
                return new CategoryResponseDTO(false, "Category with name '" + categoryName + "' already exists");
            }

            // Create new category
            Category category = categoryMapper.toNewEntity(categoryCreateDTO);
            category.setCategoryName(categoryName);

            Category savedCategory = categoryRepository.save(category);
            CategoryCreateDTO savedDTO = categoryMapper.toDTO(savedCategory);

            return new CategoryResponseDTO(true, "Category added successfully", savedDTO);

        } catch (Exception e) {
            return new CategoryResponseDTO(false, "Failed to add category: " + e.getMessage());
        }
    }

    public List<CategoryCreateDTO> getAllCategories() {
        try {
            List<Category> categories = categoryRepository.findAll();
            return categoryMapper.toDTOList(categories);
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve categories: " + e.getMessage(), e);
        }
    }

    public CategoryCreateDTO getCategoryById(Long categoryId) {
        try {
            if (categoryId == null) {
                return null;
            }

            Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
            return categoryOpt.map(categoryMapper::toDTO).orElse(null);

        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve category: " + e.getMessage(), e);
        }
    }

    public CategoryResponseDTO updateCategory(Long categoryId, CategoryCreateDTO categoryCreateDTO) {
        try {
            // Validate input
            if (categoryId == null) {
                return new CategoryResponseDTO(false, "Category ID is required");
            }

            if (categoryCreateDTO == null) {
                return new CategoryResponseDTO(false, "Category data is required");
            }

            if (categoryCreateDTO.getCategoryName() == null ||
                    categoryCreateDTO.getCategoryName().trim().isEmpty()) {
                return new CategoryResponseDTO(false, "Category name is required");
            }

            String categoryName = categoryCreateDTO.getCategoryName().trim();

            // Find existing category
            Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
            if (categoryOpt.isEmpty()) {
                return new CategoryResponseDTO(false, "Category not found with ID: " + categoryId);
            }

            Category existingCategory = categoryOpt.get();

            // Check if another category with the same name exists (excluding current category)
            Category categoryWithSameName = categoryRepository.findByCategoryName(categoryName);
            if (categoryWithSameName != null && !categoryWithSameName.getCategoryId().equals(categoryId)) {
                return new CategoryResponseDTO(false, "Category with name '" + categoryName + "' already exists");
            }

            // Update category
            existingCategory.setCategoryName(categoryName);
            Category updatedCategory = categoryRepository.save(existingCategory);
            CategoryCreateDTO updatedDTO = categoryMapper.toDTO(updatedCategory);

            return new CategoryResponseDTO(true, "Category updated successfully", updatedDTO);

        } catch (Exception e) {
            return new CategoryResponseDTO(false, "Failed to update category: " + e.getMessage());
        }
    }

    public CategoryResponseDTO deleteCategory(Long categoryId) {
        try {
            if (categoryId == null) {
                return new CategoryResponseDTO(false, "Category ID is required");
            }

            Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
            if (categoryOpt.isEmpty()) {
                return new CategoryResponseDTO(false, "Category not found with ID: " + categoryId);
            }

            Category category = categoryOpt.get();

            // Check if category has associated products
            if (category.getProducts() != null && !category.getProducts().isEmpty()) {
                return new CategoryResponseDTO(false,
                        "Cannot delete category. It has " + category.getProducts().size() + " associated products. " +
                                "Please remove or reassign the products first.");
            }

            categoryRepository.delete(category);
            return new CategoryResponseDTO(true, "Category deleted successfully");

        } catch (Exception e) {
            return new CategoryResponseDTO(false, "Failed to delete category: " + e.getMessage());
        }
    }

    public List<String> getAllCategoryNames() {
        try {
            return categoryRepository.findAll().stream()
                    .map(Category::getCategoryName)
                    .toList();
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve category names: " + e.getMessage(), e);
        }
    }
}