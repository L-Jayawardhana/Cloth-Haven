package org.example.clothheaven.Model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_item")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Orders order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer orderItemsQuantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal orderItemsPrice;

    @Column(length = 50)
    private String color;

    @Column(length = 50)
    private String size;

    // Constructors
    public OrderItem() {
    }

    public OrderItem(Orders order, Product product, Integer quantity, BigDecimal price) {
        this.order = order;
        this.product = product;
        this.orderItemsQuantity = quantity;
        this.orderItemsPrice = price;
    }

    public OrderItem(Orders order, Product product, Integer quantity, BigDecimal price, String color, String size) {
        this.order = order;
        this.product = product;
        this.orderItemsQuantity = quantity;
        this.orderItemsPrice = price;
        this.color = color;
        this.size = size;
    }

    // Getters and Setters
    public Long getOrderItemId() {
        return orderItemId;
    }

    public void setOrderItemId(Long orderItemId) {
        this.orderItemId = orderItemId;
    }

    public Orders getOrder() {
        return order;
    }

    public void setOrder(Orders order) {
        this.order = order;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getOrderItemsQuantity() {
        return orderItemsQuantity;
    }

    public void setOrderItemsQuantity(Integer orderItemsQuantity) {
        this.orderItemsQuantity = orderItemsQuantity;
    }

    public BigDecimal getOrderItemsPrice() {
        return orderItemsPrice;
    }

    public void setOrderItemsPrice(BigDecimal orderItemsPrice) {
        this.orderItemsPrice = orderItemsPrice;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }
}