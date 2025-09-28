package org.example.clothheaven.Mapper;

import org.example.clothheaven.DTO.InventoryLogsCreateDTO;
import org.example.clothheaven.DTO.InventoryLogsResponseDTO;
import org.example.clothheaven.Model.InventoryLogs;
import org.springframework.stereotype.Component;

@Component
public class InventoryLogsMapper {

    public InventoryLogs toEntity(InventoryLogsCreateDTO dto) {
        if (dto == null) {
            return null;
        }

        var logs = new InventoryLogs();
        logs.setProduct(dto.getProduct());
        logs.setChangeType(dto.getChangeType());
        logs.setQuantityChanged(dto.getQuantityChanged());
        logs.setInventoryLogsDate(dto.getInventoryLogsDate());
        return logs;
    }

    public InventoryLogsResponseDTO toResponseDTO(InventoryLogs logs) {
        if (logs == null) {
            return null;
        }

        var responseDTO = new InventoryLogsResponseDTO();
        responseDTO.setLogId(logs.getLogId());
        responseDTO.setProduct(logs.getProduct());
        responseDTO.setChangeType(logs.getChangeType());
        responseDTO.setQuantityChanged(logs.getQuantityChanged());
        responseDTO.setInventoryLogsDate(logs.getInventoryLogsDate());
        return responseDTO;
    }
}
