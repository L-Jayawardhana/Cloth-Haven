package org.example.clothheaven.Controller;

import org.example.clothheaven.DTO.ColorsSizeQuantityAvailabilityCreateDTO;
import org.example.clothheaven.DTO.ColorsSizeQuantityAvailabilityResponseDTO;
import org.example.clothheaven.Service.ColorsSizeQuantityAvailabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/colors-size-quantity-availability")
public class ColorsSizeQuantityAvailabilityController {
    @Autowired
    private ColorsSizeQuantityAvailabilityService service;

    @PostMapping
    public ColorsSizeQuantityAvailabilityResponseDTO create(@RequestBody ColorsSizeQuantityAvailabilityCreateDTO dto) {
        return service.create(dto);
    }

    @GetMapping("/product/{productId}")
    public List<ColorsSizeQuantityAvailabilityResponseDTO> getByProductId(@PathVariable Long productId) {
        return service.getByProductId(productId);
    }
}
