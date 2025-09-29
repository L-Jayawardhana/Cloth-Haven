package org.example.clothheaven.Service;

import java.util.List;
import java.util.Optional;

import org.example.clothheaven.DTO.UserCreateDTO;
import org.example.clothheaven.DTO.UserResponseDTO;
import org.example.clothheaven.Mapper.UserMapper;
import org.example.clothheaven.Model.Staff;
import org.example.clothheaven.Model.User;
import org.example.clothheaven.Repository.CartRepository;
import org.example.clothheaven.Repository.StaffRepository;
import org.example.clothheaven.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final StaffRepository staffRepository;
    private final CartRepository cartRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, StaffRepository staffRepository, CartRepository cartRepository, UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.staffRepository = staffRepository;
        this.cartRepository = cartRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long userId) {
        return userRepository.findById(userId);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional
    public UserResponseDTO addUser(UserCreateDTO dto) {
        User user = userMapper.toEntity(dto);
        User savedUser = userRepository.save(user);

        // Automatically create staff record only if the role is STAFF
        if ("STAFF".equals(dto.getRole())) {
            Staff staff = new Staff();
            staff.setUser(savedUser);  // Pass the entire User object
            staffRepository.save(staff);
        }

        return userMapper.toResponseDTO(savedUser);
    }

    public User updateUser(Long userId, User userDetails) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setUsername(userDetails.getUsername());
            user.setEmail(userDetails.getEmail());
            user.setPhoneNo(userDetails.getPhoneNo());
            user.setAddress(userDetails.getAddress());
            // Don't update role - preserve existing role
            // user.setRole() is intentionally not called
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found with id: " + userId);
    }

    public boolean changePassword(Long userId, String currentPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(currentPassword, user.getPw())) {
                user.setPw(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }

    @Transactional
    public void deleteUser(Long userId) {
        // First delete user's cart if it exists (cascade will handle cart items)
        Optional<org.example.clothheaven.Model.Cart> cartOpt = cartRepository.findByUser_UserId(userId);
        if (cartOpt.isPresent()) {
            cartRepository.deleteById(cartOpt.get().getCartId());
        }
        
        // Then delete the user
        userRepository.deleteById(userId);
    }

    @Transactional
    public boolean deleteUserWithPassword(Long userId, String password) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPw())) {
                // First delete user's cart if it exists (cascade will handle cart items)
                Optional<org.example.clothheaven.Model.Cart> cartOpt = cartRepository.findByUser_UserId(userId);
                if (cartOpt.isPresent()) {
                    cartRepository.deleteById(cartOpt.get().getCartId());
                }
                
                // Then delete the user
                userRepository.deleteById(userId);
                return true;
            }
        }
        return false;
    }

    @Transactional
    public boolean adminDeleteUser(Long userId, String adminEmail, String adminPassword) {
        System.out.println("=== ADMIN DELETE DEBUG ===");
        System.out.println("Target User ID: " + userId);
        System.out.println("Admin Email from JWT: " + adminEmail);
        System.out.println("Admin Password provided: " + (adminPassword != null ? "[PROVIDED]" : "[NULL]"));
        
        // First, verify the admin user's password
        Optional<User> adminOpt = userRepository.findByEmail(adminEmail);
        if (adminOpt.isPresent()) {
            User admin = adminOpt.get();
            System.out.println("Found admin user: " + admin.getUsername());
            System.out.println("Admin role: " + admin.getRole());
            
            // Check if the current user is actually an admin
            if ("ADMIN".equals(admin.getRole())) {
                System.out.println("Admin role verified");
                boolean passwordMatches = passwordEncoder.matches(adminPassword, admin.getPw());
                System.out.println("Password matches: " + passwordMatches);
                
                if (passwordMatches) {
                    // Verify the target user exists
                    Optional<User> targetUserOpt = userRepository.findById(userId);
                    if (targetUserOpt.isPresent()) {
                        User targetUser = targetUserOpt.get();
                        System.out.println("Target user found: " + targetUser.getUsername() + " (Role: " + targetUser.getRole() + ")");
                        
                        try {
                            // If the user is a STAFF member, delete the staff record first to avoid foreign key constraint
                            if ("STAFF".equals(targetUser.getRole())) {
                                Optional<Staff> staffOpt = staffRepository.findByUser(targetUser);
                                if (staffOpt.isPresent()) {
                                    Staff staff = staffOpt.get();
                                    System.out.println("User is staff member, deleting staff record first (Staff ID: " + staff.getStaffId() + ")");
                                    staffRepository.delete(staff);
                                }
                            }
                            
                            // Delete user's cart if it exists (cascade will handle cart items)
                            Optional<org.example.clothheaven.Model.Cart> cartOpt = cartRepository.findByUser_UserId(userId);
                            if (cartOpt.isPresent()) {
                                System.out.println("Deleting user's cart (Cart ID: " + cartOpt.get().getCartId() + ")");
                                cartRepository.deleteById(cartOpt.get().getCartId());
                            }
                            
                            // Now delete the user record
                            System.out.println("Proceeding with user deletion");
                            userRepository.deleteById(userId);
                            System.out.println("User deleted successfully");
                            return true;
                            
                        } catch (Exception e) {
                            System.out.println("Error during deletion: " + e.getMessage());
                            throw new RuntimeException("Failed to delete user: " + e.getMessage(), e);
                        }
                    } else {
                        System.out.println("Target user not found");
                    }
                } else {
                    System.out.println("Password verification failed");
                }
            } else {
                System.out.println("User is not admin. Role: " + admin.getRole());
            }
        } else {
            System.out.println("Admin user not found for email: " + adminEmail);
        }
        System.out.println("=== END DEBUG ===");
        return false;
    }

    public boolean emailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }
}
