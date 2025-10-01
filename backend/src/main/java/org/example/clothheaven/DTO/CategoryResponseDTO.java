package org.example.clothheaven.DTO;

import java.util.List;

public class CategoryResponseDTO {
    private boolean success;
    private String message;
    private List<String> categoryNames;
    private List<CategoryCreateDTO> categories; // Add support for full category data

    public CategoryResponseDTO() {}

    public CategoryResponseDTO(boolean success, String message) {
        this.success = success;
        this.message = message;
        this.categoryNames = null;
        this.categories = null;
    }

    public CategoryResponseDTO(boolean success, String message, List<String> categoryNames) {
        this.success = success;
        this.message = message;
        this.categoryNames = categoryNames;
        this.categories = null;
    }

    // New constructor for full category data
    public CategoryResponseDTO(boolean success, String message, List<String> categoryNames, List<CategoryCreateDTO> categories) {
        this.success = success;
        this.message = message;
        this.categoryNames = categoryNames;
        this.categories = categories;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<String> getCategoryNames() {
        return categoryNames;
    }

    public void setCategoryNames(List<String> categoryNames) {
        this.categoryNames = categoryNames;
    }

    public List<CategoryCreateDTO> getCategories() {
        return categories;
    }

    public void setCategories(List<CategoryCreateDTO> categories) {
        this.categories = categories;
    }
}
