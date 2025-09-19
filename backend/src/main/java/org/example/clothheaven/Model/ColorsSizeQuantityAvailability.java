package org.example.clothheaven.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "colors_size_quantity_availability")
public class ColorsSizeQuantityAvailability {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "productId", nullable = false)
    private Product product;

    @Column(nullable = false)
    private String color; // changed from 'colour' to 'color'

    @Column(nullable = false)
    private String size;

    @Column(nullable = false)
    private Boolean availability; // changed from String to Boolean

    @Column(nullable = false)
    private Integer quantity;

    public ColorsSizeQuantityAvailability() {}

    public ColorsSizeQuantityAvailability(Product product, String color, String size, Boolean availability, Integer quantity) {
        this.product = product;
        this.color = color;
        this.size = size;
        this.availability = availability;
        this.quantity = quantity;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public Boolean getAvailability() { return availability; }
    public void setAvailability(Boolean availability) { this.availability = availability; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
