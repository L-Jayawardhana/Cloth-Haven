package org.example.clothheaven.Config;

import java.time.LocalDateTime;
import java.util.Optional;

import org.example.clothheaven.Model.Category;
import org.example.clothheaven.Model.User;
import org.example.clothheaven.Repository.CategoryRepository;
import org.example.clothheaven.Repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, CategoryRepository categoryRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        createInitialAdmin();
        createInitialCategories();
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

    private void createInitialCategories() {
        // Check if categories already exist
        if (categoryRepository.count() > 0) {
            System.out.println("ℹ️  Categories already exist, skipping creation.");
            return;
        }

        // Create sample categories for a clothing store
        String[] categoryNames = {
            "Men's Clothing",
            "Women's Clothing", 
            "Kids' Clothing",
            "Shoes",
            "Accessories",
            "Sportswear",
            "Formal Wear",
            "Casual Wear"
        };

        System.out.println("🏷️  Creating initial categories...");
        
        for (String categoryName : categoryNames) {
            try {
                Category category = new Category();
                category.setCategoryName(categoryName);
                categoryRepository.save(category);
                System.out.println("   ✅ Created category: " + categoryName);
            } catch (Exception e) {
                System.out.println("   ❌ Failed to create category " + categoryName + ": " + e.getMessage());
            }
        }
        
        System.out.println("🎉 Initial categories created successfully!");
    }
}