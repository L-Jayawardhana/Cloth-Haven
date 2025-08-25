package org.example.clothheaven.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "staff")
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "staff_id", nullable = false)
    private Long staffId;

    @OneToOne(cascade = CascadeType.REMOVE) // when deleting user form the staff table it will automatically delete the user from the user table
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private User user;

    // Default constructor
    public Staff() {
    }

    // Constructor with parameters
    public Staff(User user) {
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
