package org.example.clothheaven.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "cart_item")
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cartItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer cartItemsQuantity;

    @Column(nullable = true)
    private String size;

    @Column(nullable = true)
    private String color;

    // Constructors
    public CartItem() {
    }

    public CartItem(Cart cart, Product product, Integer quantity) {
        this.cart = cart;
        this.product = product;
        this.cartItemsQuantity = quantity;
    }

    public CartItem(Cart cart, Product product, Integer quantity, String size, String color) {
        this.cart = cart;
        this.product = product;
        this.cartItemsQuantity = quantity;
        this.size = size;
        this.color = color;
    }

    // Getters and Setters
    public Long getCartItemId() {
        return cartItemId;
    }

    public void setCartItemId(Long cartItemId) {
        this.cartItemId = cartItemId;
    }

    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getCartItemsQuantity() {
        return cartItemsQuantity;
    }

    public void setCartItemsQuantity(Integer cartItemsQuantity) {
        this.cartItemsQuantity = cartItemsQuantity;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
}
