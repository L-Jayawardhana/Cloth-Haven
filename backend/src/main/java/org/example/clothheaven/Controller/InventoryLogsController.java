package org.example.clothheaven.Controller;

import org.example.clothheaven.DTO.InventoryLogsCreateDTO;
import org.example.clothheaven.DTO.InventoryLogsResponseDTO;
import org.example.clothheaven.Service.InventoryLogsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/inventoryLogs")
public class InventoryLogsController {

    private final InventoryLogsService inventoryLogsService;

    @Autowired
    public InventoryLogsController(InventoryLogsService inventoryLogsService) {
        this.inventoryLogsService = inventoryLogsService;
    }

    @PostMapping("/addLog")
    public ResponseEntity<InventoryLogsResponseDTO> addInventoryLog(@RequestBody InventoryLogsCreateDTO logDTO) {
        InventoryLogsResponseDTO addedLog = inventoryLogsService.addInventoryLog(logDTO);
        return ResponseEntity.status(201).body(addedLog);
    }

    @GetMapping("/getAllLogs")
    public ResponseEntity<List<InventoryLogsResponseDTO>> getAllInventoryLogs() {
        List<InventoryLogsResponseDTO> logList = inventoryLogsService.getAllInventoryLogs();
        return ResponseEntity.ok(logList);
    }

    @GetMapping("/getLogByLogId/{logId}")
    public ResponseEntity<InventoryLogsResponseDTO> getLogById(@PathVariable Long logId) {
        InventoryLogsResponseDTO response = inventoryLogsService.getLogById(logId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getLogByProductId/{productId}")
    public ResponseEntity<List<InventoryLogsResponseDTO>> getLogByProductId(@PathVariable Long productId) {
        List<InventoryLogsResponseDTO> logList = inventoryLogsService.getLogsByProductId(productId);
        return ResponseEntity.ok(logList);
    }

    @GetMapping("/getLogByProductIdAndDateRange")
    public ResponseEntity<List<InventoryLogsResponseDTO>> getLogByProductIdAndDateRange(
            @RequestParam Long productId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<InventoryLogsResponseDTO> logList = inventoryLogsService.getLogsByProductIdAndDateRange(productId, startDate, endDate);
        return ResponseEntity.ok(logList);
    }

    @GetMapping("/getLogByDateRange")
    public ResponseEntity<List<InventoryLogsResponseDTO>> getLogByDateRange(
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<InventoryLogsResponseDTO> logList = inventoryLogsService.getLogsByDateRange(startDate, endDate);
        return ResponseEntity.ok(logList);
    }

    @GetMapping("/getLogByChangeType/{changeType}")
    public ResponseEntity<List<InventoryLogsResponseDTO>> getLogByChangeType(@PathVariable String changeType) {
        List<InventoryLogsResponseDTO> logList = inventoryLogsService.getLogsByChangeType(changeType);
        return ResponseEntity.ok(logList);
    }

    @GetMapping("/getLogByChangeTypeAndDateRange")
    public ResponseEntity<List<InventoryLogsResponseDTO>> getLogByChangeTypeAndDateRange(
            @RequestParam String changeType,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<InventoryLogsResponseDTO> logList = inventoryLogsService.getLogsByChangeTypeAndDateRange(changeType, startDate, endDate);
        return ResponseEntity.ok(logList);
    }

    @GetMapping("/getLogByProductIdAndChangeType")
    public ResponseEntity<List<InventoryLogsResponseDTO>> getLogByProductIdAndChangeType(
            @RequestParam Long productId,
            @RequestParam String changeType) {
        List<InventoryLogsResponseDTO> logList = inventoryLogsService.getLogsByProductIdAndChangeType(productId, changeType);
        return ResponseEntity.ok(logList);
    }

    @GetMapping("/getLogByProductIdAndChangeTypeAndDateRange")
    public ResponseEntity<List<InventoryLogsResponseDTO>> getLogByProductIdAndChangeTypeAndDateRange(
            @RequestParam Long productId,
            @RequestParam String changeType,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<InventoryLogsResponseDTO> logList = inventoryLogsService.getLogsByProductIdAndChangeTypeAndDateRange(productId, changeType, startDate, endDate);
        return ResponseEntity.ok(logList);
    }
}