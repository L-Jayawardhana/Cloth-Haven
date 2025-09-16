// CategoryMapper.java (No changes needed - this was correct)
package org.example.clothheaven.Mapper;

import org.example.clothheaven.DTO.CategoryCreateDTO;
import org.example.clothheaven.Model.Category;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CategoryMapper {

    /**
     * Convert Category entity to CategoryCreateDTO
     */
    public CategoryCreateDTO toDTO(Category category) {
        if (category == null) {
            return null;
        }
        return new CategoryCreateDTO(
                category.getCategoryId(),
                category.getCategoryName()
        );
    }

    /**
     * Convert CategoryCreateDTO to new Category entity (for creation)
     */
    public Category toNewEntity(CategoryCreateDTO dto) {
        if (dto == null) {
            return null;
        }
        Category category = new Category();
        category.setCategoryName(dto.getCategoryName());
        // Note: categoryId is not set as it's auto-generated
        return category;
    }

    /**
     * Convert CategoryCreateDTO to Category entity (for updates)
     */
    public Category toEntity(CategoryCreateDTO dto) {
        if (dto == null) {
            return null;
        }
        Category category = new Category();
        category.setCategoryId(dto.getCategoryId());
        category.setCategoryName(dto.getCategoryName());
        return category;
    }

    /**
     * Update existing Category entity with CategoryCreateDTO data
     */
    public Category updateEntity(Category existingCategory, CategoryCreateDTO dto) {
        if (dto == null || existingCategory == null) {
            return existingCategory;
        }
        existingCategory.setCategoryName(dto.getCategoryName());
        return existingCategory;
    }

    /**
     * Convert List of Category entities to List of CategoryCreateDTOs
     */
    public List<CategoryCreateDTO> toDTOList(List<Category> categories) {
        if (categories == null) {
            return null;
        }
        return categories.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert List of CategoryCreateDTOs to List of Category entities
     */
    public List<Category> toEntityList(List<CategoryCreateDTO> categoryDTOs) {
        if (categoryDTOs == null) {
            return null;
        }
        return categoryDTOs.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
    }

    /**
     * Extract category names from List of Category entities
     */
    public List<String> toCategoryNamesList(List<Category> categories) {
        if (categories == null) {
            return null;
        }
        return categories.stream()
                .map(Category::getCategoryName)
                .collect(Collectors.toList());
    }

    /**
     * Convert category name to CategoryCreateDTO (useful for simple operations)
     */
    public CategoryCreateDTO fromCategoryName(String categoryName) {
        if (categoryName == null || categoryName.trim().isEmpty()) {
            return null;
        }
        CategoryCreateDTO dto = new CategoryCreateDTO();
        dto.setCategoryName(categoryName);
        return dto;
    }
}