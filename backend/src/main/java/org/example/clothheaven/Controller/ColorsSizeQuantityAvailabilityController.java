package org.example.clothheaven.Controller;

import org.example.clothheaven.DTO.ColorsSizeQuantityAvailabilityCreateDTO;
import org.example.clothheaven.DTO.ColorsSizeQuantityAvailabilityResponseDTO;
import org.example.clothheaven.Service.ColorsSizeQuantityAvailabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/colors-size-quantity-availability")
@CrossOrigin(origins = "*")
public class ColorsSizeQuantityAvailabilityController {
    @Autowired
    private ColorsSizeQuantityAvailabilityService service;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ColorsSizeQuantityAvailabilityCreateDTO dto) {
        ColorsSizeQuantityAvailabilityResponseDTO created = service.create(dto);
        if (created == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid productId");
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/batch")
    public ResponseEntity<?> createBatch(@RequestBody List<ColorsSizeQuantityAvailabilityCreateDTO> dtoList) {
        try {
            List<ColorsSizeQuantityAvailabilityResponseDTO> createdList = service.createBatch(dtoList);
            if (createdList.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No valid entries were created");
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(createdList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error creating batch: " + e.getMessage());
        }
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ColorsSizeQuantityAvailabilityResponseDTO>> getByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(service.getByProductId(productId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ColorsSizeQuantityAvailabilityCreateDTO dto) {
        ColorsSizeQuantityAvailabilityResponseDTO updated = service.update(id, dto);
        if (updated == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        boolean deleted = service.delete(id);
        if (!deleted) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/product/{productId}")
    public ResponseEntity<Void> deleteByProductId(@PathVariable Long productId) {
        boolean deleted = service.deleteByProductId(productId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        ColorsSizeQuantityAvailabilityResponseDTO dto = service.getById(id);
        if (dto == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<List<ColorsSizeQuantityAvailabilityResponseDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> exists(@PathVariable Long id) {
        return ResponseEntity.ok(service.existsById(id));
    }
}
