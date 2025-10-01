package org.example.clothheaven.DTO;

import java.util.List;

public class CategoryResponseDTO {
    private boolean success;
    private String message;
    private List<String> categoryNames;

    public CategoryResponseDTO() {}

    public CategoryResponseDTO(boolean success, String message, List<String> categoryNames) {
        this.success = success;
        this.message = message;
        this.categoryNames = categoryNames;
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
}
