package org.example.clothheaven.Repository;

import org.example.clothheaven.Model.InventoryLogs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryLogsRepository extends JpaRepository<InventoryLogs, Long> {
    List<InventoryLogs> findByProductProductId(Long productId);

    List<InventoryLogs> findByProductProductIdAndInventoryLogsDateBetween(Long productId, LocalDateTime startDate, LocalDateTime endDate);

    List<InventoryLogs> findByInventoryLogsDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<InventoryLogs> findByChangeTypeAndInventoryLogsDateBetween(String changeType, LocalDateTime startDate, LocalDateTime endDate);

    List<InventoryLogs> findByChangeType(String changeType);

    List<InventoryLogs> findByProductProductIdAndChangeType(Long productId, String changeType);

    List<InventoryLogs> findByProductProductIdAndChangeTypeAndInventoryLogsDateBetween(Long productId, String changeType, LocalDateTime startDate, LocalDateTime endDate);
}
