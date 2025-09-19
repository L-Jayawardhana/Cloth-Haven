package org.example.clothheaven.Mapper;

import org.example.clothheaven.DTO.ImageCreateDTO;
import org.example.clothheaven.DTO.ImageResponseDTO;
import org.example.clothheaven.Model.Image;
import org.example.clothheaven.Model.Product;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ImageMapper {

     //Convert Image entity to ImageResponseDTO
    public ImageResponseDTO toResponseDTO(Image image) {
        if (image == null) {
            return null;
        }
        return new ImageResponseDTO(
                image.getImageId(),
                image.getImageUrl(),
                image.getProduct() != null ? image.getProduct().getProductId() : null
        );
    }


     //Convert ImageCreateDTO to new Image entity
    public Image toNewEntity(ImageCreateDTO dto, Product product) {
        if (dto == null || product == null) {
            return null;
        }

        Image image = new Image();
        image.setImageUrl(dto.getImageUrl());
        image.setProduct(product);
        return image;
    }

     //Update existing Image entity from ImageCreateDTO
    public void updateEntity(Image existingImage, ImageCreateDTO dto) {
        if (existingImage == null || dto == null) {
            return;
        }

        if (dto.getImageUrl() != null && !dto.getImageUrl().trim().isEmpty()) {
            existingImage.setImageUrl(dto.getImageUrl());
        }
    }


     //Convert list of Image entities to list of ImageResponseDTOs
    public List<ImageResponseDTO> toResponseDTOList(List<Image> images) {
        if (images == null) {
            return Collections.emptyList();
        }
        return images.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }


    public Image fromResponseDTO(ImageResponseDTO dto) {
        if (dto == null) {
            return null;
        }

        Image image = new Image();
        image.setImageId(dto.getImageId());
        image.setImageUrl(dto.getImageUrl());
        return image;
    }
}