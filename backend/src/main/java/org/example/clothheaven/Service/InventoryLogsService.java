package org.example.clothheaven.Service;

import org.example.clothheaven.DTO.InventoryLogsCreateDTO;
import org.example.clothheaven.DTO.InventoryLogsResponseDTO;
import org.example.clothheaven.Exception.EmptyLogsException;
import org.example.clothheaven.Exception.InventoryLogNotFoundException;
import org.example.clothheaven.Mapper.InventoryLogsMapper;
import org.example.clothheaven.Model.InventoryLogs;
import org.example.clothheaven.Repository.InventoryLogsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryLogsService {

    private final InventoryLogsRepository inventoryLogsRepository;
    private final InventoryLogsMapper inventoryLogsMapper;

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
}
