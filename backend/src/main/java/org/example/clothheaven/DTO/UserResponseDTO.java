package org.example.clothheaven.DTO;

public class UserResponseDTO {
    private Long userId;
    private String username;
    private String email;
    private String phoneNo;
    private String address;
    private String role;

    // Constructors
    public UserResponseDTO() {}

    public UserResponseDTO(Long userId, String username, String email, String phoneNo, String address, String role) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.phoneNo = phoneNo;
        this.address = address;
        this.role = role;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNo() {
        return phoneNo;
    }

    public void setPhoneNo(String phoneNo) {
        this.phoneNo = phoneNo;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
