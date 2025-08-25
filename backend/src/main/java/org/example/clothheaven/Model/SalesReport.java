package org.example.clothheaven.Model;

import jakarta.persistence.*;
import jdk.jfr.Category;

import java.time.LocalDate;

@Entity
@Table(name = "sales_reports")
public class SalesReport {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @Column(name = "report_id", nullable = false)
    private Long reportId;

    @Column(name = "sales_report_date", nullable = false)
    private LocalDate SalesReportDate;

    @Column(name = "total_sales", nullable = false)
    private Double totalSales; //total revenue on that date

    @Column(name = "total_orders", nullable = false)
    private Integer totalOrders; //total number of orders on that date

    @Column(name = "total_products_sold", nullable = false)
    private Integer totalProductsSold; //total number of products sold on that date

    @ManyToOne
    @JoinColumn(name = "top_selling_product_id", referencedColumnName = "product_id")
    private Product topSellingProductId; //product ID of the top selling product on that date
//
//    @ManyToOne
//    @JoinColumn(name = "top_selling_category_id", referencedColumnName = "category_id")
//    private Category topSellingCategoryId; //product ID of the top selling category on that date

    @Column(name = "new_customers", nullable = false)
    private Integer newCustomers; //number of new customers on that date

    public Long getReportId() {
        return reportId;
    }

    public void setReportId(Long reportId) {
        this.reportId = reportId;
    }

    public Integer getNewCustomers() {
        return newCustomers;
    }

    public void setNewCustomers(Integer newCustomers) {
        this.newCustomers = newCustomers;
    }

//    public Category getTopSellingCategoryId() {
//        return topSellingCategoryId;
//    }
//
//    public void setTopSellingCategoryId(Category topSellingCategoryId) {
//        this.topSellingCategoryId = topSellingCategoryId;
//    }

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
