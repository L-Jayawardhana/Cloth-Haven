package org.example.clothheaven.Repository;

import java.time.LocalDate;
import java.util.List;

import org.example.clothheaven.DTO.SalesReportResponseDTO;
import org.example.clothheaven.Model.SalesReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalesReportRepository extends JpaRepository<SalesReport,Long> {
    SalesReportResponseDTO findByReportId(Long reportId);

    List<SalesReport> findBySalesReportDate(LocalDate salesReportDate);

    List<SalesReport> findBySalesReportDateBetween(LocalDate startDate, LocalDate endDate);
}
