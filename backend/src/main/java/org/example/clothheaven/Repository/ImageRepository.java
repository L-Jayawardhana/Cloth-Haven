package org.example.clothheaven.Repository;

import org.example.clothheaven.Model.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {


     //Find all images by product ID
    List<Image> findByProductProductId(Long productId);

      //Find images by product ID with custom query (alternative approach)
    @Query("SELECT i FROM Image i WHERE i.product.productId = :productId")
    List<Image> findImagesByProductId(@Param("productId") Long productId);

     //Check if any images exist for a specific product
    boolean existsByProductProductId(Long productId);

     //Count images by product ID
    long countByProductProductId(Long productId);

     //Find image by URL
    Optional<Image> findByImageUrl(String imageUrl);

     // Delete all images for a specific product
    void deleteByProductProductId(Long productId);
}