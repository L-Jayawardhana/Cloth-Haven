package org.example.clothheaven.Controller;

import org.example.clothheaven.DTO.UserCreateDTO;
import org.example.clothheaven.DTO.UserResponseDTO;
import org.example.clothheaven.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/user")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> addUser(@RequestBody UserCreateDTO createUserDTO) {
        UserResponseDTO response = userService.addUser(createUserDTO);
        return ResponseEntity.status(201).body(response);
    }
}