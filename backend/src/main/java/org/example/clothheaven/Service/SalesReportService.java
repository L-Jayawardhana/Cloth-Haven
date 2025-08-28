package org.example.clothheaven.Service;

import org.example.clothheaven.DTO.SalesReportCreateDTO;
import org.example.clothheaven.DTO.SalesReportResponseDTO;
import org.example.clothheaven.Exception.EmptySalesReportException;
import org.example.clothheaven.Exception.SalesReportNotFoundException;
import org.example.clothheaven.Mapper.SalesReportMapper;
import org.example.clothheaven.Model.SalesReport;
import org.example.clothheaven.Repository.SalesReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SalesReportService {

    private final SalesReportMapper salesReportMapper;
    private final SalesReportRepository salesReportRepository;

    @Autowired
    public SalesReportService(SalesReportMapper salesReportMapper, SalesReportRepository salesReportRepository) {
        this.salesReportMapper = salesReportMapper;
        this.salesReportRepository = salesReportRepository;
    }

    public SalesReportResponseDTO addSalesReport(SalesReportCreateDTO dto) {
        SalesReport salesReport = salesReportMapper.toEntity(dto);
        SalesReport savedReport = salesReportRepository.save(salesReport);
        return salesReportMapper.toResponseDTO(savedReport);
    }

    public List<SalesReportResponseDTO> getAllSalesReports() {
        List<SalesReport> salesReports = salesReportRepository.findAll();
        if (salesReports.isEmpty()) {
            throw new EmptySalesReportException("No sales reports found in the system");
        }
        return salesReports.stream()
                .map(salesReportMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public SalesReportResponseDTO getSalesReportByReportId(Long reportId) {
        SalesReport report = salesReportRepository.findById(reportId)
                .orElseThrow(() -> new SalesReportNotFoundException("Report with ID " + reportId + " not found"));
        return salesReportMapper.toResponseDTO(report);
    }

    public List<SalesReportResponseDTO> getAllSalesReportsByDate(LocalDate salesReportDate) {
        List<SalesReport> salesReports = salesReportRepository.findBySalesReportDate(salesReportDate);
        if (salesReports.isEmpty()) {
            throw new EmptySalesReportException("No sales reports found for date: " + salesReportDate);
        }
        return salesReports.stream()
                .map(salesReportMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<SalesReportResponseDTO> getAllSalesReportsBetweenDates(LocalDate startDate, LocalDate endDate) {
        List<SalesReport> salesReports = salesReportRepository.findBySalesReportDateBetween(startDate, endDate);
        if (salesReports.isEmpty()) {
            throw new EmptySalesReportException("No sales reports found between dates: " + startDate + " and " + endDate);
        }
        return salesReports.stream()
                .map(salesReportMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

}
