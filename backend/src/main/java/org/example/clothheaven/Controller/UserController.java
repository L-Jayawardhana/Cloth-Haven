package org.example.clothheaven.Controller;

import org.example.clothheaven.DTO.UserCreateDTO;
import org.example.clothheaven.DTO.UserResponseDTO;
import org.example.clothheaven.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
@RequestMapping(value = "api/v1/")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/getUser")
    public ResponseEntity<UserResponseDTO> addUser(@RequestBody UserCreateDTO createUserDTO){
        UserResponseDTO response = userService.addUser(createUserDTO);
        return ResponseEntity.status(201).body(response);
    }
}
