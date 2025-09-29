package org.example.clothheaven.Config;

import java.time.LocalDateTime;
import java.util.Optional;

import org.example.clothheaven.Model.Category;
import org.example.clothheaven.Model.Product;
import org.example.clothheaven.Model.User;
import org.example.clothheaven.Repository.CategoryRepository;
import org.example.clothheaven.Repository.ProductRepository;
import org.example.clothheaven.Repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, ProductRepository productRepository, 
                          CategoryRepository categoryRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        createInitialAdmin();
        createSampleProducts();
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

    private void createSampleProducts() {
        // Check if products already exist
        if (productRepository.count() > 0) {
            System.out.println("ℹ️  Products already exist, skipping creation.");
            return;
        }

        try {
            // Create a sample category first
            Category category = new Category();
            category.setCategoryName("Sample Category");
            Category savedCategory = categoryRepository.save(category);

            // Create sample products
            Product product1 = new Product();
            product1.setName("Sample T-Shirt");
            product1.setDescription("A comfortable cotton t-shirt");
            product1.setProductPrice(29.99);
            product1.setCategory(savedCategory);
            productRepository.save(product1);

            Product product2 = new Product();
            product2.setName("Denim Jeans");
            product2.setDescription("Classic blue denim jeans");
            product2.setProductPrice(79.99);
            product2.setCategory(savedCategory);
            productRepository.save(product2);

            Product product3 = new Product();
            product3.setName("Casual Hoodie");
            product3.setDescription("Warm and cozy hoodie for everyday wear");
            product3.setProductPrice(49.99);
            product3.setCategory(savedCategory);
            productRepository.save(product3);

            System.out.println("✅ Sample products created successfully!");
        } catch (Exception e) {
            System.err.println("❌ Error creating sample products: " + e.getMessage());
        }
    }
}