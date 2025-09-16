package org.example.clothheaven.DTO;


import jakarta.validation.constraints.NotBlank;

public class UserCreateDTO {

    @NotBlank(message = "Username is required")
    private String username;

    public UserCreateDTO(){}

    public UserCreateDTO(String username){
        this.username = username;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
