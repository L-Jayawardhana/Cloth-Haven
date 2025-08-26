package org.example.clothheaven.Mapper;

import org.example.clothheaven.DTO.SalesReportCreateDTO;
import org.example.clothheaven.DTO.SalesReportResponseDTO;
import org.example.clothheaven.Model.SalesReport;
import org.springframework.stereotype.Component;

@Component
public class SalesReportMapper {

    public SalesReport toEntity(SalesReportCreateDTO dto) {
        if (dto == null) {
            return null;
        }

        SalesReport salesReport = new SalesReport();
        salesReport.setSalesReportDate(dto.getSalesReportDate());
        salesReport.setTotalSales(dto.getTotalSales());
        salesReport.setTotalOrders(dto.getTotalOrders());
        salesReport.setTotalProductsSold(dto.getTotalProductsSold());
        salesReport.setTopSellingProductId(dto.getTopSellingProductId());
        //salesReport.setTopSellingCategoryId(dto.setTopSellingCategoryId());
        salesReport.setNewCustomers(dto.getNewCustomers());
        return salesReport;
    }

    public SalesReportResponseDTO  toResponseDTO(SalesReport salesReport) {
        if (salesReport == null) {
            return null;
        }

        var salesReportResponseDTO = new SalesReportResponseDTO();
        salesReportResponseDTO.setReportId(salesReport.getReportId());
        salesReportResponseDTO.setSalesReportDate(salesReport.getSalesReportDate());
        salesReportResponseDTO.setTotalSales(salesReport.getTotalSales());
        salesReportResponseDTO.setTotalOrders(salesReport.getTotalOrders());
        salesReportResponseDTO.setTotalProductsSold(salesReport.getTotalProductsSold());
        salesReportResponseDTO.setTopSellingProductId(salesReport.getTopSellingProductId());
        //salesReportResponseDTO.setTopSellingCategoryId(salesReport.getTopSellingCategoryId());
        salesReportResponseDTO.setNewCustomers(salesReport.getNewCustomers());
        return salesReportResponseDTO;
    }
}
