package org.example.clothheaven.DTO;

import org.example.clothheaven.Model.User;

public class StaffResponseDTO {

    private Long staffId;
    private User user;

    // Default constructor
    public StaffResponseDTO() {
    }

    // Constructor with parameters
    public StaffResponseDTO(Long staffId, User user) {
        this.staffId = staffId;
        this.user = user;
    }

    public Long getStaffId() {
        return staffId;
    }

    public void setStaffId(Long staffId) {
        this.staffId = staffId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

}