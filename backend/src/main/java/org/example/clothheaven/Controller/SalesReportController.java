package org.example.clothheaven.Controller;

import java.time.LocalDate;
import java.util.List;

import org.example.clothheaven.DTO.SalesReportCreateDTO;
import org.example.clothheaven.DTO.SalesReportResponseDTO;
import org.example.clothheaven.Service.SalesReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sales_reports")
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" })
public class SalesReportController {

    private final SalesReportService salesReportService;

    @Autowired
    public SalesReportController(SalesReportService salesReportService) {
        this.salesReportService = salesReportService;
    }

    @PostMapping("/addReport")
    public ResponseEntity<SalesReportResponseDTO> addSalesReport(@RequestBody SalesReportCreateDTO salesReportCreateDTO) {
        SalesReportResponseDTO reportResponse = salesReportService.addSalesReport(salesReportCreateDTO);
        return ResponseEntity.ok(reportResponse);
    }

    @GetMapping("/getAllReports")
    public ResponseEntity<List<SalesReportResponseDTO>> getAllSalesReports() {
        List<SalesReportResponseDTO> reports = salesReportService.getAllSalesReports();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("getByReportId/{reportId}")
    public ResponseEntity<SalesReportResponseDTO> getSalesReportByReportId(@PathVariable Long reportId) {
        SalesReportResponseDTO reportResponse = salesReportService.getSalesReportByReportId(reportId);
        return ResponseEntity.ok(reportResponse);
    }

    @GetMapping("getByDate/{salesReportDate}")
    public ResponseEntity<List<SalesReportResponseDTO>> getAllSalesReportsByDate(@PathVariable LocalDate salesReportDate) {
        List<SalesReportResponseDTO> reports = salesReportService.getAllSalesReportsByDate(salesReportDate);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("getBetweenDates/{startDate}/{endDate}")
    public ResponseEntity<List<SalesReportResponseDTO>> getAllSalesReportsBetweenDates(@PathVariable LocalDate startDate, @PathVariable LocalDate endDate) {
        List<SalesReportResponseDTO> reports = salesReportService.getAllSalesReportsBetweenDates(startDate, endDate);
        return ResponseEntity.ok(reports);
    }

    //should be created new customers count report
    //when full user part implemented it should be possible to get new customers count by date or between dates
}
