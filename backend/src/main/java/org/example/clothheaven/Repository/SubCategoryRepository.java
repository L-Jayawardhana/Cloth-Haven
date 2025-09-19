package org.example.clothheaven.Repository;

import org.example.clothheaven.Model.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {
    boolean existsBySubCategoryNameAndCategory_CategoryId(String subCategoryName, Long categoryId);
    List<SubCategory> findByCategory_CategoryId(Long categoryId);
}


