package org.example.clothheaven.Service;

import org.example.clothheaven.DTO.ColorsSizeQuantityAvailabilityResponseDTO;
import org.example.clothheaven.DTO.ProductResponseDTO;
import org.example.clothheaven.Mapper.ProductMapper;
import org.example.clothheaven.Model.Category;
import org.example.clothheaven.Model.Product;
import org.example.clothheaven.Model.User;
import org.example.clothheaven.Repository.CategoryRepository;
import org.example.clothheaven.Repository.ProductRepository;
import org.example.clothheaven.Repository.SubCategoryRepository;
import org.example.clothheaven.Repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductService {
    private static final Logger log = LoggerFactory.getLogger(ProductService.class);
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;
    private final SubCategoryRepository subCategoryRepository;
    private final ColorsSizeQuantityAvailabilityService colorsSizeQuantityAvailabilityService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository, ProductMapper productMapper, ColorsSizeQuantityAvailabilityService colorsSizeQuantityAvailabilityService, SubCategoryRepository subCategoryRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productMapper = productMapper;
        this.colorsSizeQuantityAvailabilityService = colorsSizeQuantityAvailabilityService;
        this.subCategoryRepository = subCategoryRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public ProductResponseDTO addProduct(ProductResponseDTO request, MultipartFile image) {
        try {
            log.info("Adding product: {}", request.getName());
            if (request.getName() == null || request.getName().trim().isEmpty()) {
                ProductResponseDTO response = new ProductResponseDTO();
                response.setSuccess(false);
                response.setMessage("Product name is required");
                return response;
            }
            if (request.getCategoryId() == null) {
                ProductResponseDTO response = new ProductResponseDTO();
                response.setSuccess(false);
                response.setMessage("Category ID is required");
                return response;
            }
            Category category = categoryRepository.findById(request.getCategoryId()).orElse(null);
            if (category == null) {
                ProductResponseDTO response = new ProductResponseDTO();
                response.setSuccess(false);
                response.setMessage("Category not found with id: " + request.getCategoryId());
                response.setName(request.getName());
                response.setDescription(request.getDescription());
                response.setProductPrice(request.getProductPrice());
                response.setCategoryId(request.getCategoryId());
                return response;
            }
            Product product = productMapper.toNewEntity(request, category);
            if (request.getSubCategoryId() != null) {
                subCategoryRepository.findById(request.getSubCategoryId()).ifPresent(product::setSubCategory);
            }
            Product savedProduct = productRepository.save(product);
            return productMapper.toResponseDTO(savedProduct);
        } catch (Exception e) {
            log.error("Error adding product: {}", e.getMessage(), e);
            ProductResponseDTO response = new ProductResponseDTO();
            response.setSuccess(false);
            response.setMessage(e.getMessage());
            return response;
        }
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<ProductResponseDTO> getAllProductCreateDTO() {
        List<Product> products = productRepository.findAllWithCategoryNotDeleted();
        List<ProductResponseDTO> dtos = productMapper.toResponseDTOList(products);
        return dtos.stream()
                .map(this::enrichWithStockInfo)
                .collect(Collectors.toList());
    }

    public List<ProductResponseDTO> getProductsByCategory(Long categoryId) {
        List<Product> products = productRepository.findByCategoryCategoryIdAndDeletedFalse(categoryId);
        List<ProductResponseDTO> dtos = productMapper.toResponseDTOList(products);
        return dtos.stream()
                .map(this::enrichWithStockInfo)
                .collect(Collectors.toList());
    }

    public List<ProductResponseDTO> getProductsBySubCategory(Long subCategoryId) {
        List<Product> products = productRepository.findBySubCategory_SubCategoryIdAndDeletedFalse(subCategoryId);
        List<ProductResponseDTO> dtos = productMapper.toResponseDTOList(products);
        return dtos.stream()
                .map(this::enrichWithStockInfo)
                .collect(Collectors.toList());
    }

    public List<ProductResponseDTO> getProductsByPriceRange(Double minPrice, Double maxPrice) {
        List<Product> products = productRepository.findByPriceRangeNotDeleted(minPrice, maxPrice);
        List<ProductResponseDTO> dtos = productMapper.toResponseDTOList(products);
        return dtos.stream()
                .map(this::enrichWithStockInfo)
                .collect(Collectors.toList());
    }

    public boolean deleteProduct(Long productId) {
        try {
            productRepository.deleteById(productId);
            return true;
        } catch (Exception e) {
            log.error("Error deleting product: {}", e.getMessage(), e);
            return false;
        }
    }

    public boolean softDeleteProduct(Long productId) {
        try {
            Product product = productRepository.findById(productId).orElse(null);
            if (product == null) {
                return false;
            }
            product.setDeleted(true);
            productRepository.save(product);
            return true;
        } catch (Exception e) {
            log.error("Error soft deleting product: {}", e.getMessage(), e);
            return false;
        }
    }

    public boolean adminSoftDeleteProduct(Long productId, String adminEmail, String adminPassword) {
        System.out.println("=== ADMIN SOFT DELETE PRODUCT DEBUG ===");
        System.out.println("Target Product ID: " + productId);
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
                    // Verify the target product exists
                    Optional<Product> productOpt = productRepository.findById(productId);
                    if (productOpt.isPresent()) {
                        Product product = productOpt.get();
                        System.out.println("Target product found: " + product.getName());
                        
                        try {
                            // Soft delete the product
                            product.setDeleted(true);
                            productRepository.save(product);
                            System.out.println("Product soft deleted successfully");
                            return true;
                        } catch (Exception e) {
                            System.out.println("Error soft deleting product: " + e.getMessage());
                            return false;
                        }
                    } else {
                        System.out.println("Product not found");
                        return false;
                    }
                } else {
                    System.out.println("Admin password verification failed");
                    return false;
                }
            } else {
                System.out.println("User is not an admin: " + admin.getRole());
                return false;
            }
        } else {
            System.out.println("Admin user not found for email: " + adminEmail);
            return false;
        }
    }

    public ProductResponseDTO getProductById(Long productId) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) return null;
        ProductResponseDTO dto = productMapper.toResponseDTO(product);
        return enrichWithStockInfo(dto);
    }

    public ProductResponseDTO updateProduct(Long productId, ProductResponseDTO request) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            ProductResponseDTO response = new ProductResponseDTO();
            response.setSuccess(false);
            response.setMessage("Product not found");
            return response;
        }
        Category category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        productMapper.updateEntity(product, request, category);
        if (request.getSubCategoryId() != null) {
            subCategoryRepository.findById(request.getSubCategoryId()).ifPresent(product::setSubCategory);
        } else {
            product.setSubCategory(null);
        }
        Product updatedProduct = productRepository.save(product);
        ProductResponseDTO dto = productMapper.toResponseDTO(updatedProduct);
        return enrichWithStockInfo(dto);
    }

    public Optional<Product> getProductEntityById(Long productId) {
        return productRepository.findById(productId);
    }

    /**
     * Enrich ProductResponseDTO with stock and size information
     */
    private ProductResponseDTO enrichWithStockInfo(ProductResponseDTO dto) {
        if (dto == null || dto.getProductId() == null) {
            return dto;
        }

        try {
            List<ColorsSizeQuantityAvailabilityResponseDTO> stockInfo = 
                colorsSizeQuantityAvailabilityService.getByProductId(dto.getProductId());
            
            if (stockInfo != null && !stockInfo.isEmpty()) {
                // Calculate if product is in stock (any variant available)
                boolean inStock = stockInfo.stream()
                    .anyMatch(item -> item.getAvailability() != null && item.getAvailability() && 
                             item.getQuantity() != null && item.getQuantity() > 0);
                
                // Get unique available sizes
                List<String> availableSizes = stockInfo.stream()
                    .filter(item -> item.getAvailability() != null && item.getAvailability() && 
                             item.getQuantity() != null && item.getQuantity() > 0)
                    .map(ColorsSizeQuantityAvailabilityResponseDTO::getSize)
                    .distinct()
                    .collect(Collectors.toList());
                
                // Get unique available colors
                List<String> availableColors = stockInfo.stream()
                    .filter(item -> item.getAvailability() != null && item.getAvailability() && 
                             item.getQuantity() != null && item.getQuantity() > 0)
                    .map(ColorsSizeQuantityAvailabilityResponseDTO::getColor)
                    .distinct()
                    .collect(Collectors.toList());
                
                // Calculate total quantity
                int totalQuantity = stockInfo.stream()
                    .filter(item -> item.getAvailability() != null && item.getAvailability())
                    .mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0)
                    .sum();
                
                dto.setInStock(inStock);
                dto.setAvailableSizes(availableSizes);
                dto.setAvailableColors(availableColors);
                dto.setTotalQuantity(totalQuantity);
            } else {
                // No stock information available
                dto.setInStock(false);
                dto.setAvailableSizes(List.of());
                dto.setAvailableColors(List.of());
                dto.setTotalQuantity(0);
            }
        } catch (Exception e) {
            log.warn("Error fetching stock info for product {}: {}", dto.getProductId(), e.getMessage());
            dto.setInStock(false);
            dto.setAvailableSizes(List.of());
            dto.setAvailableColors(List.of());
            dto.setTotalQuantity(0);
        }
        
        return dto;
    }
}
