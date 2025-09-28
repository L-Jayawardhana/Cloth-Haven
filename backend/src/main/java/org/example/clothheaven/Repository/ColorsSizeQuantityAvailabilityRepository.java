package org.example.clothheaven.Repository;

import org.example.clothheaven.Model.ColorsSizeQuantityAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ColorsSizeQuantityAvailabilityRepository extends JpaRepository<ColorsSizeQuantityAvailability, Long> {
    List<ColorsSizeQuantityAvailability> findByProduct_ProductId(Long productId);
}
