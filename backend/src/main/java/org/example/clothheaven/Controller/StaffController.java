package org.example.clothheaven.Controller;

import org.example.clothheaven.DTO.StaffResponseDTO;
import org.example.clothheaven.Service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/staff")
public class StaffController {

    private final StaffService staffService;

    @Autowired
    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    @GetMapping("/getAllStaff")
    public ResponseEntity<List<StaffResponseDTO>> getAllStaff() {
        List<StaffResponseDTO> staffList = staffService.getAllStaff();
        return ResponseEntity.ok(staffList);
    }

    @GetMapping("/getStaffById/{id}")
    public ResponseEntity<StaffResponseDTO> getStaffById(@PathVariable Long id) {
        StaffResponseDTO response = staffService.getStaffById(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/deleteStaffById/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable Long id) {
        staffService.deleteStaffById(id);
        return ResponseEntity.status(201).build();
    }
}