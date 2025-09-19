package org.example.clothheaven.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class SubCategoryCreateDTO {
    @JsonProperty("subCategoryId")
    private Long subCategoryId;

    @JsonProperty("categoryId")
    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @JsonProperty("subCategory")
    @NotBlank(message = "Sub-category name is required")
    @Size(min = 2, max = 50, message = "Sub-category name must be between 2 and 50 characters")
    private String subCategory;

    public SubCategoryCreateDTO() {
    }

    public SubCategoryCreateDTO(Long subCategoryId, Long categoryId, String subCategory) {
        this.subCategoryId = subCategoryId;
        this.categoryId = categoryId;
        this.subCategory = subCategory;
    }

    public Long getSubCategoryId() {
        return subCategoryId;
    }

    public void setSubCategoryId(Long subCategoryId) {
        this.subCategoryId = subCategoryId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getSubCategory() {
        return subCategory;
    }

    public void setSubCategory(String subCategory) {
        this.subCategory = subCategory;
    }
}


