package org.example.clothheaven.Mapper;

import org.example.clothheaven.DTO.UserCreateDTO;
import org.example.clothheaven.DTO.UserResponseDTO;
import org.example.clothheaven.Model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(UserCreateDTO dto) {
        if (dto == null) {
            return null;
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setRole(dto.getRole());
        return user;
    }

    public UserResponseDTO toResponseDTO(User user) {
        if (user == null) {
            return null;
        }

        UserResponseDTO responseDTO = new UserResponseDTO();
        responseDTO.setUserId(user.getUserId());
        responseDTO.setUsername(user.getUsername());
        responseDTO.setRole(user.getRole());
        return responseDTO;
    }
}
