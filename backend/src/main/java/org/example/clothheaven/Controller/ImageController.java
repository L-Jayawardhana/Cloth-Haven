package org.example.clothheaven.Controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.example.clothheaven.DTO.ImageCreateDTO;
import org.example.clothheaven.DTO.ImageResponseDTO;
import org.example.clothheaven.Model.Product;
import org.example.clothheaven.Service.ImageService;
import org.example.clothheaven.Service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/images")
@CrossOrigin(origins = "*")
@Validated
public class ImageController {
    private final ImageService imageService;
    private final ProductService productService;

    @Autowired
    public ImageController(ImageService imageService, ProductService productService) {
        this.imageService = imageService;
        this.productService = productService;
    }

    //Create a new image
    @PostMapping
    public ResponseEntity<?> createImage(@Valid @RequestBody ImageCreateDTO imageCreateDTO) {
        try {
            // Validate product exists
            Optional<Product> productOpt = productService.getProductEntityById(imageCreateDTO.getProductId());
            if (productOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Product not found with ID: " + imageCreateDTO.getProductId()));
            }

            ImageResponseDTO responseDTO = imageService.createImage(imageCreateDTO, productOpt.get());
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while creating the image"));
        }
    }

     //Get image by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getImageById(
            @PathVariable("id") @NotNull @Positive Long id) {
        try {
            ImageResponseDTO responseDTO = imageService.getImageResponseById(id);
            if (responseDTO == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Image not found with ID: " + id));
            }
            return ResponseEntity.ok(responseDTO);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while fetching the image"));
        }
    }

    //Get all images
    @GetMapping
    public ResponseEntity<?> getAllImages() {
        try {
            List<ImageResponseDTO> responseList = imageService.getAllImageResponses();
            return ResponseEntity.ok(responseList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while fetching images"));
        }
    }

     //Get images by product ID
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getImagesByProductId(
            @PathVariable("productId") @NotNull @Positive Long productId) {
        try {
            List<ImageResponseDTO> responseList = imageService.getImagesByProductId(productId);
            return ResponseEntity.ok(responseList);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while fetching images"));
        }
    }

     //Update an image
    @PutMapping("/{id}")
    public ResponseEntity<?> updateImage(
            @PathVariable("id") @NotNull @Positive Long id,
            @Valid @RequestBody ImageCreateDTO imageCreateDTO) {
        try {
            if (!imageService.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Image not found with ID: " + id));
            }

            ImageResponseDTO responseDTO = imageService.updateImage(id, imageCreateDTO);
            if (responseDTO == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Image not found with ID: " + id));
            }

            return ResponseEntity.ok(responseDTO);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while updating the image"));
        }
    }

     //Delete an image
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteImage(
            @PathVariable("id") @NotNull @Positive Long id) {
        try {
            boolean deleted = imageService.deleteImage(id);
            if (!deleted) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Image not found with ID: " + id));
            }
            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while deleting the image"));
        }
    }

    //Delete all images for a product
    @DeleteMapping("/product/{productId}")
    public ResponseEntity<?> deleteImagesByProductId(
            @PathVariable("productId") @NotNull @Positive Long productId) {
        try {
            boolean deleted = imageService.deleteImagesByProductId(productId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while deleting images for product: " + productId));
        }
    }


     //Check if image exists
    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> imageExists(
            @PathVariable("id") @NotNull @Positive Long id) {
        try {
            boolean exists = imageService.existsById(id);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(false);
        }
    }


     // Error response class for consistent error handling
    public static class ErrorResponse {
        private final String message;
        private final long timestamp;

        public ErrorResponse(String message) {
            this.message = message;
            this.timestamp = System.currentTimeMillis();
        }

        public String getMessage() {
            return message;
        }

        public long getTimestamp() {
            return timestamp;
        }
    }
}