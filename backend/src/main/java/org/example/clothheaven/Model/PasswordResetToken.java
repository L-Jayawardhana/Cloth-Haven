package org.example.clothheaven.Model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
@Data
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Column(nullable = false)
    private boolean used = false;

    @PrePersist
    protected void onCreate() {
        if (this.expiryDate == null) {
            this.expiryDate = LocalDateTime.now().plusHours(1); // Token expires in 1 hour
        }
    }
}
