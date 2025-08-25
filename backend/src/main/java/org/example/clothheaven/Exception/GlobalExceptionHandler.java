package org.example.clothheaven.Exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmptyLogsException.class)
    public ResponseEntity<ErrorResponse> handleEmptyLogsException(EmptyLogsException e, HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), 404, LocalDateTime.now(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(errorResponse);
    }

    @ExceptionHandler(InventoryLogNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleInventoryLogNotFound(InventoryLogNotFoundException e, HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), 404, LocalDateTime.now(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    @ExceptionHandler(StaffMemberNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleStaffMemberNotFound(StaffMemberNotFoundException e, HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), 404, LocalDateTime.now(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    @ExceptionHandler(EmptyStaffException.class)
    public ResponseEntity<ErrorResponse> handleEmptyStaffException(EmptyStaffException e, HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), 204, LocalDateTime.now(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(errorResponse);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException e, HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), 400, LocalDateTime.now(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse("Internal Server Error: " + ex.getMessage(), 500, LocalDateTime.now(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

}