package org.example.clothheaven.Service;

import org.springframework.transaction.annotation.Transactional;
import org.example.clothheaven.DTO.ProductResponseDTO;
import org.example.clothheaven.Model.Product;
import org.example.clothheaven.Model.Category;
import org.example.clothheaven.Repository.ProductRepository;
import org.example.clothheaven.Repository.CategoryRepository;
import org.example.clothheaven.Mapper.ProductMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
public class ProductService {
    private static final Logger log = LoggerFactory.getLogger(ProductService.class);
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository, ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productMapper = productMapper;
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
                response.setStockQuantity(request.getStockQuantity());
                response.setProductPrice(request.getProductPrice());
                response.setCategoryId(request.getCategoryId());
                response.setSize(request.getSize());
                response.setColour(request.getColour());
                return response;
            }
            Product product = productMapper.toNewEntity(request, category);
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
        List<Product> products = productRepository.findAllWithCategory();
        return productMapper.toResponseDTOList(products);
    }

    public List<ProductResponseDTO> getProductsByCategory(Long categoryId) {
        List<Product> products = productRepository.findByCategoryCategoryId(categoryId);
        return productMapper.toResponseDTOList(products);
    }

    public List<ProductResponseDTO> getProductsBySize(String size) {
        List<Product> products = productRepository.findBySize(size);
        return productMapper.toResponseDTOList(products);
    }

    public List<ProductResponseDTO> getProductsByColour(String colour) {
        List<Product> products = productRepository.findByColour(colour);
        return productMapper.toResponseDTOList(products);
    }

    public List<ProductResponseDTO> getProductsByPriceRange(Double minPrice, Double maxPrice) {
        List<Product> products = productRepository.findByPriceRange(minPrice, maxPrice);
        return productMapper.toResponseDTOList(products);
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

    public ProductResponseDTO getProductById(Long productId) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) return null;
        return productMapper.toResponseDTO(product);
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
        Product updatedProduct = productRepository.save(product);
        return productMapper.toResponseDTO(updatedProduct);
    }
}
