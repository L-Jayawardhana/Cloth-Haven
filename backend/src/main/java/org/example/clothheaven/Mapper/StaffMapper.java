package org.example.clothheaven.Mapper;

import org.example.clothheaven.DTO.StaffResponseDTO;
import org.example.clothheaven.Model.Staff;
import org.springframework.stereotype.Component;

@Component
public class StaffMapper {

    public StaffResponseDTO toResponseDTO(Staff staff) {
        if (staff == null) {
            return null;
        }

        StaffResponseDTO dto = new StaffResponseDTO();
        dto.setStaffId(staff.getStaffId());

        if (staff.getUser() != null) {
            dto.setUser(staff.getUser());
        }

        return dto;
    }
}




