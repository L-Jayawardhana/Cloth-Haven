package org.example.clothheaven.Controller;

import java.util.List;

import org.example.clothheaven.DTO.SubCategoryCreateDTO;
import org.example.clothheaven.DTO.SubCategoryResponseDTO;
import org.example.clothheaven.Service.SubCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sub-categories")
@CrossOrigin(origins = "*")
public class SubCategoryController {
    private final SubCategoryService subCategoryService;

    @Autowired
    public SubCategoryController(SubCategoryService subCategoryService) {
        this.subCategoryService = subCategoryService;
    }

    @PostMapping("/add")
    public ResponseEntity<SubCategoryResponseDTO> add(@RequestBody SubCategoryCreateDTO dto) {
        SubCategoryResponseDTO response = subCategoryService.addSubCategory(dto);
        HttpStatus status = response.isSuccess() ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @GetMapping("/all")
    public ResponseEntity<SubCategoryResponseDTO> all() {
        List<SubCategoryCreateDTO> list = subCategoryService.getAllSubCategories();
        return ResponseEntity.ok(new SubCategoryResponseDTO(true, "Sub-categories retrieved successfully", list));
    }

    @GetMapping("/by-category/{categoryId}")
    public ResponseEntity<SubCategoryResponseDTO> byCategory(@PathVariable Long categoryId) {
        List<SubCategoryCreateDTO> list = subCategoryService.getSubCategoriesByCategory(categoryId);
        return ResponseEntity.ok(new SubCategoryResponseDTO(true, "Sub-categories retrieved successfully", list));
    }

    @GetMapping("/{subCategoryId}")
    public ResponseEntity<SubCategoryResponseDTO> get(@PathVariable Long subCategoryId) {
        SubCategoryCreateDTO dto = subCategoryService.getSubCategoryById(subCategoryId);
        if (dto == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new SubCategoryResponseDTO(false, "Sub-category not found"));
        }
        return ResponseEntity.ok(new SubCategoryResponseDTO(true, "Sub-category retrieved successfully", dto));
    }

    @PutMapping("/update/{subCategoryId}")
    public ResponseEntity<SubCategoryResponseDTO> update(@PathVariable Long subCategoryId,
                                                         @RequestBody SubCategoryCreateDTO dto) {
        SubCategoryResponseDTO response = subCategoryService.updateSubCategory(subCategoryId, dto);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @DeleteMapping("/delete/{subCategoryId}")
    public ResponseEntity<SubCategoryResponseDTO> delete(@PathVariable Long subCategoryId) {
        SubCategoryResponseDTO response = subCategoryService.deleteSubCategory(subCategoryId);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.NOT_FOUND;
        return ResponseEntity.status(status).body(response);
    }
}


