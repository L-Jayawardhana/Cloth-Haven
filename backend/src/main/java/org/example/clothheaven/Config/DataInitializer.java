package org.example.clothheaven.Config;

import java.time.LocalDateTime;
import java.util.Optional;

import org.example.clothheaven.Model.User;
import org.example.clothheaven.Repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        createInitialAdmin();
    }

    private void createInitialAdmin() {
        String adminEmail = "admin@gmail.com";
        
        Optional<User> existingAdmin = userRepository.findByEmail(adminEmail);
        
        if (existingAdmin.isEmpty()) {
            User admin = new User();
            admin.setUsername("Administrator");
            admin.setEmail(adminEmail);
            admin.setPhoneNo("0000000000");
            admin.setAddress("System Generated");
            admin.setPw(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            admin.setCreatedAt(LocalDateTime.now());
            
            userRepository.save(admin);
            System.out.println("✅ Initial admin user created successfully!");
            System.out.println("📧 Email: " + adminEmail);
            System.out.println("🔑 Password: admin123");
            System.out.println("⚠️  Please change the default password after first login");
        } else {
            System.out.println("ℹ️  Admin user already exists, skipping creation.");
        }
    }
}