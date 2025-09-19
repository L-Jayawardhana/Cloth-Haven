package org.example.clothheaven.Service;

import org.example.clothheaven.DTO.ColorsSizeQuantityAvailabilityCreateDTO;
import org.example.clothheaven.DTO.ColorsSizeQuantityAvailabilityResponseDTO;
import org.example.clothheaven.Mapper.ColorsSizeQuantityAvailabilityMapper;
import org.example.clothheaven.Model.ColorsSizeQuantityAvailability;
import org.example.clothheaven.Model.Product;
import org.example.clothheaven.Repository.ColorsSizeQuantityAvailabilityRepository;
import org.example.clothheaven.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

    public List<ColorsSizeQuantityAvailabilityResponseDTO> getByProductId(Long productId) {
        List<ColorsSizeQuantityAvailability> list = repository.findByProduct_ProductId(productId);
        return list.stream().map(mapper::toResponseDTO).collect(Collectors.toList());
    }
}

