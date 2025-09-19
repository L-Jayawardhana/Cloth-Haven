package org.example.clothheaven.Service;

import org.example.clothheaven.DTO.SubCategoryCreateDTO;
import org.example.clothheaven.DTO.SubCategoryResponseDTO;
import org.example.clothheaven.Mapper.SubCategoryMapper;
import org.example.clothheaven.Model.Category;
import org.example.clothheaven.Model.SubCategory;
import org.example.clothheaven.Repository.CategoryRepository;
import org.example.clothheaven.Repository.SubCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SubCategoryService {
    private final SubCategoryRepository subCategoryRepository;
    private final CategoryRepository categoryRepository;
    private final SubCategoryMapper subCategoryMapper;

    @Autowired
    public SubCategoryService(SubCategoryRepository subCategoryRepository,
                              CategoryRepository categoryRepository,
                              SubCategoryMapper subCategoryMapper) {
        this.subCategoryRepository = subCategoryRepository;
        this.categoryRepository = categoryRepository;
        this.subCategoryMapper = subCategoryMapper;
    }

    public SubCategoryResponseDTO addSubCategory(SubCategoryCreateDTO dto) {
        try {
            if (dto == null) {
                return new SubCategoryResponseDTO(false, "Sub-category data is required");
            }
            if (dto.getCategoryId() == null) {
                return new SubCategoryResponseDTO(false, "Category ID is required");
            }
            if (dto.getSubCategory() == null || dto.getSubCategory().trim().isEmpty()) {
                return new SubCategoryResponseDTO(false, "Sub-category name is required");
            }

            String name = dto.getSubCategory().trim();

            Optional<Category> categoryOpt = categoryRepository.findById(dto.getCategoryId());
            if (categoryOpt.isEmpty()) {
                return new SubCategoryResponseDTO(false, "Category not found with ID: " + dto.getCategoryId());
            }

            if (subCategoryRepository.existsBySubCategoryNameAndCategory_CategoryId(name, dto.getCategoryId())) {
                return new SubCategoryResponseDTO(false, "Sub-category already exists for this category");
            }

            SubCategory entity = subCategoryMapper.toNewEntity(dto, categoryOpt.get());
            entity.setSubCategoryName(name);
            SubCategory saved = subCategoryRepository.save(entity);
            SubCategoryCreateDTO savedDTO = subCategoryMapper.toDTO(saved);
            return new SubCategoryResponseDTO(true, "Sub-category added successfully", savedDTO);
        } catch (Exception e) {
            return new SubCategoryResponseDTO(false, "Failed to add sub-category: " + e.getMessage());
        }
    }

    public List<SubCategoryCreateDTO> getAllSubCategories() {
        List<SubCategory> all = subCategoryRepository.findAll();
        return subCategoryMapper.toDTOList(all);
    }

    public List<SubCategoryCreateDTO> getSubCategoriesByCategory(Long categoryId) {
        List<SubCategory> list = subCategoryRepository.findByCategory_CategoryId(categoryId);
        return subCategoryMapper.toDTOList(list);
    }

    public SubCategoryCreateDTO getSubCategoryById(Long subCategoryId) {
        Optional<SubCategory> opt = subCategoryRepository.findById(subCategoryId);
        return opt.map(subCategoryMapper::toDTO).orElse(null);
    }

    public SubCategoryResponseDTO updateSubCategory(Long subCategoryId, SubCategoryCreateDTO dto) {
        try {
            if (subCategoryId == null) {
                return new SubCategoryResponseDTO(false, "Sub-category ID is required");
            }
            Optional<SubCategory> existingOpt = subCategoryRepository.findById(subCategoryId);
            if (existingOpt.isEmpty()) {
                return new SubCategoryResponseDTO(false, "Sub-category not found with ID: " + subCategoryId);
            }

            SubCategory existing = existingOpt.get();
            Category category = null;
            if (dto.getCategoryId() != null) {
                Optional<Category> categoryOpt = categoryRepository.findById(dto.getCategoryId());
                if (categoryOpt.isEmpty()) {
                    return new SubCategoryResponseDTO(false, "Category not found with ID: " + dto.getCategoryId());
                }
                category = categoryOpt.get();
            }

            String name = dto.getSubCategory() != null ? dto.getSubCategory().trim() : existing.getSubCategoryName();
            if (name == null || name.isEmpty()) {
                return new SubCategoryResponseDTO(false, "Sub-category name is required");
            }

            Long targetCategoryId = dto.getCategoryId() != null ? dto.getCategoryId() : existing.getCategory().getCategoryId();
            if (subCategoryRepository.existsBySubCategoryNameAndCategory_CategoryId(name, targetCategoryId)) {
                // Allow same entity to keep same name
                boolean isSame = name.equals(existing.getSubCategoryName()) && targetCategoryId.equals(existing.getCategory().getCategoryId());
                if (!isSame) {
                    return new SubCategoryResponseDTO(false, "Sub-category already exists for this category");
                }
            }

            existing = subCategoryMapper.updateEntity(existing, dto, category);
            existing.setSubCategoryName(name);
            SubCategory saved = subCategoryRepository.save(existing);
            return new SubCategoryResponseDTO(true, "Sub-category updated successfully", subCategoryMapper.toDTO(saved));
        } catch (Exception e) {
            return new SubCategoryResponseDTO(false, "Failed to update sub-category: " + e.getMessage());
        }
    }

    public SubCategoryResponseDTO deleteSubCategory(Long subCategoryId) {
        try {
            Optional<SubCategory> existingOpt = subCategoryRepository.findById(subCategoryId);
            if (existingOpt.isEmpty()) {
                return new SubCategoryResponseDTO(false, "Sub-category not found with ID: " + subCategoryId);
            }
            subCategoryRepository.delete(existingOpt.get());
            return new SubCategoryResponseDTO(true, "Sub-category deleted successfully");
        } catch (Exception e) {
            return new SubCategoryResponseDTO(false, "Failed to delete sub-category: " + e.getMessage());
        }
    }
}


