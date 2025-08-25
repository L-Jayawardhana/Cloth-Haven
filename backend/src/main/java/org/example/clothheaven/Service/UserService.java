package org.example.clothheaven.Service;

import org.example.clothheaven.DTO.UserCreateDTO;
import org.example.clothheaven.DTO.UserResponseDTO;
import org.example.clothheaven.Mapper.UserMapper;
import org.example.clothheaven.Model.Role;
import org.example.clothheaven.Model.Staff;
import org.example.clothheaven.Model.User;
import org.example.clothheaven.Repository.StaffRepository;
import org.example.clothheaven.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final StaffRepository staffRepository;
    private final UserMapper userMapper;

    @Autowired
    public UserService(UserRepository userRepository, StaffRepository staffRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.staffRepository = staffRepository;
        this.userMapper = userMapper;
    }

    @Transactional
    public UserResponseDTO addUser(UserCreateDTO dto) {
        User user = userMapper.toEntity(dto);
        User savedUser = userRepository.save(user);

        // Automatically create staff record only if the role is STAFF
        if (dto.getRole() == Role.STAFF) {
            Staff staff = new Staff();
            staff.setUser(savedUser);  // Pass the entire User object
            staffRepository.save(staff);
        }

        return userMapper.toResponseDTO(savedUser);
    }
}

