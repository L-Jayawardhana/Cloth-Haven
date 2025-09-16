package org.example.clothheaven.Exception;

import org.example.clothheaven.DTO.CategoryResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<CategoryResponseDTO> handleNoResourceFound(NoResourceFoundException ex) {
        CategoryResponseDTO response = new CategoryResponseDTO(
                false,
                "API endpoint not found: " + ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CategoryResponseDTO> handleValidationException(MethodArgumentNotValidException ex) {
        String errorMessage = "Validation failed: ";
        if (ex.getBindingResult().hasFieldErrors()) {
            errorMessage += ex.getBindingResult().getFieldError().getDefaultMessage();
        } else {
            errorMessage += "Invalid request data";
        }

        CategoryResponseDTO response = new CategoryResponseDTO(false, errorMessage);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<CategoryResponseDTO> handleGenericException(Exception ex) {
        CategoryResponseDTO response = new CategoryResponseDTO(
                false,
                "Internal server error: " + ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}