package org.example.clothheaven.Mapper;

import org.example.clothheaven.DTO.ColorsSizeQuantityAvailabilityCreateDTO;
import org.example.clothheaven.DTO.ColorsSizeQuantityAvailabilityResponseDTO;
import org.example.clothheaven.Model.ColorsSizeQuantityAvailability;
import org.example.clothheaven.Model.Product;
import org.springframework.stereotype.Component;

@Component
public class ColorsSizeQuantityAvailabilityMapper {
    public ColorsSizeQuantityAvailability toEntity(ColorsSizeQuantityAvailabilityCreateDTO dto, Product product) {
        return new ColorsSizeQuantityAvailability(
            product,
            dto.getColor(),
            dto.getSize(),
            dto.getAvailability(),
            dto.getQuantity()
        );
    }

    public ColorsSizeQuantityAvailabilityResponseDTO toResponseDTO(ColorsSizeQuantityAvailability entity) {
        return new ColorsSizeQuantityAvailabilityResponseDTO(
            entity.getId(),
            entity.getProduct() != null ? entity.getProduct().getProductId() : null,
            entity.getColor(),
            entity.getSize(),
            entity.getAvailability(),
            entity.getQuantity()
        );
    }
}
