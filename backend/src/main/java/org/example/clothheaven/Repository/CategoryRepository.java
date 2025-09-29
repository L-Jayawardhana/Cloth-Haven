package org.example.clothheaven.Repository;

import org.example.clothheaven.Model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    // Find category by name
    Category findByCategoryName(String categoryName);

    // Check if category exists by name
    boolean existsByCategoryName(String categoryName);
}
