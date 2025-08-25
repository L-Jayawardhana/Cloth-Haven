package org.example.clothheaven.Mapper;

import org.example.clothheaven.DTO.StaffCreateDTO;
import org.example.clothheaven.DTO.StaffResponseDTO;
import org.example.clothheaven.Model.Staff;
import org.example.clothheaven.Model.User;
import org.springframework.stereotype.Component;

@Component
public class StaffMapper {

    public StaffResponseDTO toResponseDTO(Staff staff) {
        if (staff == null) {
            return null;
        }

        StaffResponseDTO dto = new StaffResponseDTO();
        dto.setStaffId(staff.getStaffId());
        dto.setUser(staff.getUser());

        return dto;
    }

    public Staff toEntity(StaffCreateDTO createDTO, User user) {
        if (createDTO == null || user == null) {
            return null;
        }

        Staff staff = new Staff();
        staff.setUser(user);

        return staff;
    }
}
