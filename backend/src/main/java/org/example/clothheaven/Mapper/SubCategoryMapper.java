package org.example.clothheaven.Mapper;

import org.example.clothheaven.DTO.SubCategoryCreateDTO;
import org.example.clothheaven.Model.Category;
import org.example.clothheaven.Model.SubCategory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class SubCategoryMapper {

    public SubCategoryCreateDTO toDTO(SubCategory subCategory) {
        if (subCategory == null) {
            return null;
        }
        Long categoryId = subCategory.getCategory() != null ? subCategory.getCategory().getCategoryId() : null;
        return new SubCategoryCreateDTO(
                subCategory.getSubCategoryId(),
                categoryId,
                subCategory.getSubCategoryName()
        );
    }

    public SubCategory toNewEntity(SubCategoryCreateDTO dto, Category category) {
        if (dto == null) {
            return null;
        }
        SubCategory subCategory = new SubCategory();
        subCategory.setSubCategoryName(dto.getSubCategory());
        subCategory.setCategory(category);
        return subCategory;
    }

    public SubCategory updateEntity(SubCategory existing, SubCategoryCreateDTO dto, Category category) {
        if (existing == null || dto == null) {
            return existing;
        }
        existing.setSubCategoryName(dto.getSubCategory());
        if (category != null) {
            existing.setCategory(category);
        }
        return existing;
    }

    public List<SubCategoryCreateDTO> toDTOList(List<SubCategory> subCategories) {
        if (subCategories == null) {
            return null;
        }
        return subCategories.stream().map(this::toDTO).collect(Collectors.toList());
    }
}


