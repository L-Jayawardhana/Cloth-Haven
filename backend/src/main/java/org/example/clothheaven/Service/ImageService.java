package org.example.clothheaven.Service;

import org.example.clothheaven.DTO.ImageCreateDTO;
import org.example.clothheaven.DTO.ImageResponseDTO;
import org.example.clothheaven.Mapper.ImageMapper;
import org.example.clothheaven.Model.Image;
import org.example.clothheaven.Model.Product;
import org.example.clothheaven.Repository.ImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ImageService {
    private final ImageRepository imageRepository;
    private final ImageMapper imageMapper;

    @Autowired
    public ImageService(ImageRepository imageRepository, ImageMapper imageMapper) {
        this.imageRepository = imageRepository;
        this.imageMapper = imageMapper;
    }

    public Image saveImageEntity(Image image) {
        if (image == null) {
            throw new IllegalArgumentException("Image cannot be null");
        }
        return imageRepository.save(image);
    }

    public Optional<Image> getImageById(Long imageId) {
        if (imageId == null) {
            throw new IllegalArgumentException("Image ID cannot be null");
        }
        return imageRepository.findById(imageId);
    }

    public List<Image> getAllImages() {
        return imageRepository.findAll();
    }

    public boolean deleteImage(Long imageId) {
        if (imageId == null) {
            throw new IllegalArgumentException("Image ID cannot be null");
        }
        if (imageRepository.existsById(imageId)) {
            imageRepository.deleteById(imageId);
            return true;
        }
        return false;
    }

    public ImageResponseDTO createImage(ImageCreateDTO dto, Product product) {
        if (dto == null) {
            throw new IllegalArgumentException("ImageCreateDTO cannot be null");
        }
        if (product == null) {
            throw new IllegalArgumentException("Product cannot be null");
        }
        if (dto.getImageUrl() == null || dto.getImageUrl().trim().isEmpty()) {
            throw new IllegalArgumentException("Image URL cannot be null or empty");
        }

        Image image = imageMapper.toNewEntity(dto, product);
        Image savedImage = imageRepository.save(image);
        return imageMapper.toResponseDTO(savedImage);
    }

    public ImageResponseDTO updateImage(Long imageId, ImageCreateDTO dto) {
        if (imageId == null) {
            throw new IllegalArgumentException("Image ID cannot be null");
        }
        if (dto == null) {
            throw new IllegalArgumentException("ImageCreateDTO cannot be null");
        }

        return imageRepository.findById(imageId)
                .map(existingImage -> {
                    if (dto.getImageUrl() != null && !dto.getImageUrl().trim().isEmpty()) {
                        existingImage.setImageUrl(dto.getImageUrl());
                    }
                    Image updatedImage = imageRepository.save(existingImage);
                    return imageMapper.toResponseDTO(updatedImage);
                })
                .orElse(null);
    }

    public ImageResponseDTO getImageResponseById(Long imageId) {
        if (imageId == null) {
            throw new IllegalArgumentException("Image ID cannot be null");
        }
        return imageRepository.findById(imageId)
                .map(imageMapper::toResponseDTO)
                .orElse(null);
    }

    public List<ImageResponseDTO> getAllImageResponses() {
        List<Image> images = imageRepository.findAll();
        return imageMapper.toResponseDTOList(images);
    }

    public List<ImageResponseDTO> getImagesByProductId(Long productId) {
        if (productId == null) {
            throw new IllegalArgumentException("Product ID cannot be null");
        }
        List<Image> images = imageRepository.findByProductProductId(productId);
        return imageMapper.toResponseDTOList(images);
    }

    public boolean existsById(Long imageId) {
        if (imageId == null) {
            return false;
        }
        return imageRepository.existsById(imageId);
    }

    public boolean deleteImagesByProductId(Long productId) {
        if (productId == null) {
            throw new IllegalArgumentException("Product ID cannot be null");
        }
        List<Image> images = imageRepository.findByProductProductId(productId);
        if (!images.isEmpty()) {
            imageRepository.deleteAll(images);
        }
        return true;
    }
}