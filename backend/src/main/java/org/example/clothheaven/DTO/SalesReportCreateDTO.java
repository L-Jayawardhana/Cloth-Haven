package org.example.clothheaven.DTO;

import org.example.clothheaven.Model.Product;

import java.time.LocalDate;

public class SalesReportCreateDTO {

    private LocalDate SalesReportDate;
    private Double totalSales;
    private Integer totalOrders;
    private Integer totalProductsSold;
    private Product topSellingProductId;
    //private Category topSellingCategoryId;
    private Integer newCustomers;

    public SalesReportCreateDTO() {}

    public SalesReportCreateDTO (LocalDate salesReportDate, Double totalSales, Integer totalOrders,
                                   Integer totalProductsSold, Product topSellingProductId, Integer newCustomers) {
        this.SalesReportDate = salesReportDate;
        this.totalSales = totalSales;
        this.totalOrders = totalOrders;
        this.totalProductsSold = totalProductsSold;
        this.topSellingProductId = topSellingProductId;
        this.newCustomers = newCustomers;
    }

//    public Category getTopSellingCategoryId() {
//        return topSellingCategoryId;
//    }
//
//    public void setTopSellingCategoryId(Category topSellingCategoryId) {
//        this.topSellingCategoryId = topSellingCategoryId;
//    }

    public Integer getNewCustomers() {
        return newCustomers;
    }

    public void setNewCustomers(Integer newCustomers) {
        this.newCustomers = newCustomers;
    }

    public Product getTopSellingProductId() {
        return topSellingProductId;
    }

    public void setTopSellingProductId(Product topSellingProductId) {
        this.topSellingProductId = topSellingProductId;
    }

    public Integer getTotalProductsSold() {
        return totalProductsSold;
    }

    public void setTotalProductsSold(Integer totalProductsSold) {
        this.totalProductsSold = totalProductsSold;
    }

    public Integer getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Integer totalOrders) {
        this.totalOrders = totalOrders;
    }

    public Double getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(Double totalSales) {
        this.totalSales = totalSales;
    }

    public LocalDate getSalesReportDate() {
        return SalesReportDate;
    }

    public void setSalesReportDate(LocalDate salesReportDate) {
        SalesReportDate = salesReportDate;
    }
}
