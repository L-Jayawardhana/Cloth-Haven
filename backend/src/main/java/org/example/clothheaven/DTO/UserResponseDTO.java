package org.example.clothheaven.DTO;

public class UserResponseDTO {
    private Long userId;
    private String username;

    //Constructors
    public UserResponseDTO(){}

    public UserResponseDTO(Long userId, String username) {
        this.userId = userId;
        this.username = username;
    }

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
}


