package org.example.clothheaven.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.example.clothheaven.DTO.ColorsSizeQuantityAvailabilityResponseDTO;
import org.example.clothheaven.DTO.InventoryLogsCreateDTO;
import org.example.clothheaven.DTO.InventoryLogsResponseDTO;
import org.example.clothheaven.DTO.InventoryStockUpdateDTO;
import org.example.clothheaven.Exception.EmptyLogsException;
import org.example.clothheaven.Exception.InventoryLogNotFoundException;
import org.example.clothheaven.Mapper.InventoryLogsMapper;
import org.example.clothheaven.Model.ChangeType;
import org.example.clothheaven.Model.InventoryLogs;
import org.example.clothheaven.Model.Product;
import org.example.clothheaven.Repository.InventoryLogsRepository;
import org.example.clothheaven.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class InventoryLogsService {

    private final InventoryLogsRepository inventoryLogsRepository;
    private final InventoryLogsMapper inventoryLogsMapper;
    
    @Autowired
    private ColorsSizeQuantityAvailabilityService colorsSizeQuantityService;
    
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    public InventoryLogsService(InventoryLogsRepository inventoryLogsRepository, InventoryLogsMapper inventoryLogsMapper) {
        this.inventoryLogsRepository = inventoryLogsRepository;
        this.inventoryLogsMapper = inventoryLogsMapper;
    }

    public InventoryLogsResponseDTO addInventoryLog(InventoryLogsCreateDTO dto) {
        InventoryLogs inventoryLogs = inventoryLogsMapper.toEntity(dto);
        InventoryLogs savedLog = inventoryLogsRepository.save(inventoryLogs);
        return inventoryLogsMapper.toResponseDTO(savedLog);
    }

    public List<InventoryLogsResponseDTO> getAllInventoryLogs() {
        List<InventoryLogs> inventoryLogs = inventoryLogsRepository.findAll();
        if (inventoryLogs.isEmpty()) {
            throw new EmptyLogsException("No inventory logs found in the system");
        }
        return inventoryLogs.stream()
                .map(inventoryLogsMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public InventoryLogsResponseDTO getLogById(Long id) {
        InventoryLogs log = inventoryLogsRepository.findById(id)
                .orElseThrow(() -> new InventoryLogNotFoundException("Log with ID " + id + " not found"));
        return inventoryLogsMapper.toResponseDTO(log);
    }

    public List<InventoryLogsResponseDTO> getLogsByProductId(Long productId) {
        List<InventoryLogs> logs = inventoryLogsRepository.findByProductProductId(productId);
        if (logs.isEmpty()) {
            throw new EmptyLogsException("No logs found for product ID: " + productId);
        }
        return logs.stream()
                .map(inventoryLogsMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<InventoryLogsResponseDTO> getLogsByProductIdAndDateRange(Long productId, LocalDateTime startDate, LocalDateTime endDate) {
        List<InventoryLogs> logs = inventoryLogsRepository.findByProductProductIdAndInventoryLogsDateBetween(productId, startDate, endDate);
        if (logs.isEmpty()) {
            throw new EmptyLogsException("No logs found for product ID: " + productId + " in the specified date range");
        }
        return logs.stream()
                .map(inventoryLogsMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<InventoryLogsResponseDTO> getLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        List<InventoryLogs> logs = inventoryLogsRepository.findByInventoryLogsDateBetween(startDate, endDate);
        if (logs.isEmpty()) {
            throw new EmptyLogsException("No logs found in the specified date range");
        }
        return logs.stream()
                .map(inventoryLogsMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<InventoryLogsResponseDTO> getLogsByChangeType(String changeType) {
        List<InventoryLogs> logs = inventoryLogsRepository.findByChangeType(changeType);
        if (logs.isEmpty()) {
            throw new EmptyLogsException("No logs found for change type: " + changeType);
        }
        return logs.stream()
                .map(inventoryLogsMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<InventoryLogsResponseDTO> getLogsByChangeTypeAndDateRange(String changeType, LocalDateTime startDate, LocalDateTime endDate) {
        List<InventoryLogs> logs = inventoryLogsRepository.findByChangeTypeAndInventoryLogsDateBetween(changeType, startDate, endDate);
        if (logs.isEmpty()) {
            throw new EmptyLogsException("No logs found for change type: " + changeType + " in the specified date range");
        }
        return logs.stream()
                .map(inventoryLogsMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<InventoryLogsResponseDTO> getLogsByProductIdAndChangeType(Long productId, String changeType) {
        List<InventoryLogs> logs = inventoryLogsRepository.findByProductProductIdAndChangeType(productId, changeType);
        if (logs.isEmpty()) {
            throw new EmptyLogsException("No logs found for product ID: " + productId + " and change type: " + changeType);
        }
        return logs.stream()
                .map(inventoryLogsMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<InventoryLogsResponseDTO> getLogsByProductIdAndChangeTypeAndDateRange(Long productId, String changeType, LocalDateTime startDate, LocalDateTime endDate) {
        List<InventoryLogs> logs = inventoryLogsRepository.findByProductProductIdAndChangeTypeAndInventoryLogsDateBetween(productId, changeType, startDate, endDate);
        if (logs.isEmpty()) {
            throw new EmptyLogsException("No logs found for product ID: " + productId + ", change type: " + changeType + " in the specified date range");
        }
        return logs.stream()
                .map(inventoryLogsMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public ColorsSizeQuantityAvailabilityResponseDTO updateStock(InventoryStockUpdateDTO updateDTO) {
        // Calculate the actual quantity change based on change type
        int actualQuantityChange = calculateActualQuantityChange(updateDTO.getChangeType(), updateDTO.getQuantityChange());
        
        // Update the stock for the specific color/size combination
        ColorsSizeQuantityAvailabilityResponseDTO updatedVariant = colorsSizeQuantityService.updateQuantity(
            updateDTO.getProductId(),
            updateDTO.getColor(),
            updateDTO.getSize(),
            actualQuantityChange
        );

        if (updatedVariant != null) {
            // Get the Product entity for the log
            Optional<Product> productOpt = productRepository.findById(updateDTO.getProductId());
            if (productOpt.isPresent()) {
                // Create an inventory log entry for this change
                InventoryLogsCreateDTO logDTO = new InventoryLogsCreateDTO();
                logDTO.setProduct(productOpt.get());
                // include color/size in the log DTO
                logDTO.setColor(updateDTO.getColor());
                logDTO.setSize(updateDTO.getSize());
                logDTO.setChangeType(updateDTO.getChangeType());
                logDTO.setQuantityChanged(actualQuantityChange);
                logDTO.setInventoryLogsDate(LocalDateTime.now());
                
                // Add the log entry
                addInventoryLog(logDTO);
            }
        }

        return updatedVariant;
    }

    /**
     * Calculate the actual quantity change based on the change type.
     * Some change types should always reduce stock (negative values).
     */
    private int calculateActualQuantityChange(ChangeType changeType, int inputQuantity) {
        // Ensure positive input for calculation
        int absQuantity = Math.abs(inputQuantity);
        
        switch (changeType) {
            case DAMAGE:        // Items are damaged/lost - reduce stock
            case ORDER:         // Items are sold - reduce stock
                return -absQuantity;
            case RESTOCK:       // Items are added - increase stock
            case RETURN:        // Items are returned - increase stock
            case CANCEL:        // Order canceled, items back - increase stock
            case ADJUSTMENT:    // Manual adjustment - can be positive or negative
                return inputQuantity; // Keep the original sign for adjustment
            default:
                return inputQuantity;
        }
    }
}
