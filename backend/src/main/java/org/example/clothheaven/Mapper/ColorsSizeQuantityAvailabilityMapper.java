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

    public void updateEntityFromDto(ColorsSizeQuantityAvailability entity, ColorsSizeQuantityAvailabilityCreateDTO dto, Product product) {
        if (entity == null || dto == null) return;
        if (product != null) {
            entity.setProduct(product);
        }
        if (dto.getColor() != null) {
            entity.setColor(dto.getColor());
        }
        if (dto.getSize() != null) {
            entity.setSize(dto.getSize());
        }
        entity.setAvailability(dto.getAvailability());
        entity.setQuantity(dto.getQuantity());
    }
}
