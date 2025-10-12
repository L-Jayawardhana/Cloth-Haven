package org.example.clothheaven.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.example.clothheaven.DTO.ColorsSizeQuantityAvailabilityCreateDTO;
import org.example.clothheaven.DTO.ColorsSizeQuantityAvailabilityResponseDTO;
import org.example.clothheaven.Mapper.ColorsSizeQuantityAvailabilityMapper;
import org.example.clothheaven.Model.ColorsSizeQuantityAvailability;
import org.example.clothheaven.Model.Product;
import org.example.clothheaven.Repository.ColorsSizeQuantityAvailabilityRepository;
import org.example.clothheaven.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ColorsSizeQuantityAvailabilityService {
    @Autowired
    private ColorsSizeQuantityAvailabilityRepository repository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ColorsSizeQuantityAvailabilityMapper mapper;

    public ColorsSizeQuantityAvailabilityResponseDTO create(ColorsSizeQuantityAvailabilityCreateDTO dto) {
        Optional<Product> productOpt = productRepository.findById(dto.getProductId());
        if (productOpt.isEmpty()) return null;
        ColorsSizeQuantityAvailability entity = mapper.toEntity(dto, productOpt.get());
        ColorsSizeQuantityAvailability saved = repository.save(entity);
        return mapper.toResponseDTO(saved);
    }

    public List<ColorsSizeQuantityAvailabilityResponseDTO> createBatch(List<ColorsSizeQuantityAvailabilityCreateDTO> dtoList) {
        List<ColorsSizeQuantityAvailabilityResponseDTO> results = new ArrayList<>();
        
        for (ColorsSizeQuantityAvailabilityCreateDTO dto : dtoList) {
            try {
                Optional<Product> productOpt = productRepository.findById(dto.getProductId());
                if (productOpt.isPresent()) {
                    ColorsSizeQuantityAvailability entity = mapper.toEntity(dto, productOpt.get());
                    ColorsSizeQuantityAvailability saved = repository.save(entity);
                    results.add(mapper.toResponseDTO(saved));
                }
            } catch (Exception e) {
                // Log error but continue with other entries
                System.err.println("Error creating color-size entry: " + e.getMessage());
            }
        }
        
        return results;
    }

    public List<ColorsSizeQuantityAvailabilityResponseDTO> getByProductId(Long productId) {
        List<ColorsSizeQuantityAvailability> list = repository.findByProduct_ProductId(productId);
        return list.stream().map(mapper::toResponseDTO).collect(Collectors.toList());
    }

    public ColorsSizeQuantityAvailabilityResponseDTO update(Long id, ColorsSizeQuantityAvailabilityCreateDTO dto) {
        Optional<ColorsSizeQuantityAvailability> existingOpt = repository.findById(id);
        if (existingOpt.isEmpty()) return null;

        ColorsSizeQuantityAvailability existing = existingOpt.get();

        if (dto.getProductId() != null && (existing.getProduct() == null ||
                !dto.getProductId().equals(existing.getProduct().getProductId()))) {
            Optional<Product> productOpt = productRepository.findById(dto.getProductId());
            if (productOpt.isEmpty()) return null;
            existing.setProduct(productOpt.get());
        }

        if (dto.getColor() != null) {
            existing.setColor(dto.getColor());
        }
        if (dto.getSize() != null) {
            existing.setSize(dto.getSize());
        }
        existing.setAvailability(dto.getAvailability());
        existing.setQuantity(dto.getQuantity());

        ColorsSizeQuantityAvailability saved = repository.save(existing);
        return mapper.toResponseDTO(saved);
    }

    public boolean delete(Long id) {
        Optional<ColorsSizeQuantityAvailability> existingOpt = repository.findById(id);
        if (existingOpt.isEmpty()) return false;
        repository.delete(existingOpt.get());
        return true;
    }

    public boolean existsById(Long id) {
        return repository.existsById(id);
    }

    public ColorsSizeQuantityAvailabilityResponseDTO getById(Long id) {
        Optional<ColorsSizeQuantityAvailability> existingOpt = repository.findById(id);
        return existingOpt.map(mapper::toResponseDTO).orElse(null);
    }

    public List<ColorsSizeQuantityAvailabilityResponseDTO> getAll() {
        List<ColorsSizeQuantityAvailability> list = repository.findAll();
        return list.stream().map(mapper::toResponseDTO).collect(Collectors.toList());
    }

    public ColorsSizeQuantityAvailabilityResponseDTO findByProductIdColorAndSize(Long productId, String color, String size) {
        List<ColorsSizeQuantityAvailability> variants = repository.findByProduct_ProductId(productId);
        for (ColorsSizeQuantityAvailability variant : variants) {
            if (variant.getColor().equals(color) && variant.getSize().equals(size)) {
                return mapper.toResponseDTO(variant);
            }
        }
        return null;
    }

    public ColorsSizeQuantityAvailabilityResponseDTO updateQuantity(Long productId, String color, String size, int quantityChange) {
        List<ColorsSizeQuantityAvailability> variants = repository.findByProduct_ProductId(productId);
        for (ColorsSizeQuantityAvailability variant : variants) {
            if (variant.getColor().equals(color) && variant.getSize().equals(size)) {
                int newQuantity = variant.getQuantity() + quantityChange;
                variant.setQuantity(Math.max(0, newQuantity)); // Don't allow negative quantities
                variant.setAvailability(variant.getQuantity() > 0);
                ColorsSizeQuantityAvailability saved = repository.save(variant);
                return mapper.toResponseDTO(saved);
            }
        }
        return null;
    }
}

