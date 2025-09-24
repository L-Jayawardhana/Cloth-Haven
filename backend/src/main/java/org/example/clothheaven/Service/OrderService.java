package org.example.clothheaven.Service;

import org.example.clothheaven.DTO.CreateOrderDTO;
import org.example.clothheaven.DTO.OrderResponseDTO;
import org.example.clothheaven.DTO.UpdateOrderStatusDTO;
import org.example.clothheaven.Exception.CartItemNotFoundException;
import org.example.clothheaven.Exception.EmptyCartException;
import org.example.clothheaven.Exception.OrderNotFoundException;
import org.example.clothheaven.Mapper.OrderMapper;
import org.example.clothheaven.Model.Cart;
import org.example.clothheaven.Model.CartItem;
import org.example.clothheaven.Model.OrderItem;
import org.example.clothheaven.Model.Orders;
import org.example.clothheaven.Repository.CartRepository;
import org.example.clothheaven.Repository.OrderItemRepository;
import org.example.clothheaven.Repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {
    @Autowired
    private org.example.clothheaven.Repository.UserRepository userRepository;

    @Autowired
    private org.example.clothheaven.Repository.ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private OrderMapper orderMapper;

    public OrderResponseDTO createOrder(CreateOrderDTO createOrderDTO) {
        // Get user's cart
        Cart cart = cartRepository.findByUserIdWithItems(createOrderDTO.getUserId())
                .orElseThrow(
                        () -> new CartItemNotFoundException("Cart not found for user: " + createOrderDTO.getUserId()));

        if (cart.getCartItems().isEmpty()) {
            throw new EmptyCartException("Cannot create order from empty cart");
        }

        // Fetch user entity
        org.example.clothheaven.Model.User user = userRepository.findById(createOrderDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found: " + createOrderDTO.getUserId()));

        // Create new order
        Orders order = new Orders(user);
        Orders savedOrder = orderRepository.save(order);

        // Create order items from cart items
        BigDecimal totalPrice = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getCartItems()) {
            // Fetch product entity
            org.example.clothheaven.Model.Product product = productRepository
                    .findById(cartItem.getProduct().getProductId())
                    .orElseThrow(
                            () -> new RuntimeException("Product not found: " + cartItem.getProduct().getProductId()));

            BigDecimal itemPrice = BigDecimal.valueOf(product.getProductPrice());
            BigDecimal itemTotal = itemPrice.multiply(new BigDecimal(cartItem.getCartItemsQuantity()));

            OrderItem orderItem = new OrderItem(
                    savedOrder,
                    product,
                    cartItem.getCartItemsQuantity(),
                    itemTotal);

            orderItemRepository.save(orderItem);
            totalPrice = totalPrice.add(itemTotal);
        }

        // Update order total price
        savedOrder.setOrdersPrice(totalPrice);
        orderRepository.save(savedOrder);

        // Clear the cart after successful order creation
        cartService.clearCart(createOrderDTO.getUserId());

        // Return order with items
        Orders orderWithItems = orderRepository.findByIdWithItems(savedOrder.getOrderId())
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        return orderMapper.toOrderResponseDTO(orderWithItems);
    }

    public List<OrderResponseDTO> getUserOrders(Long userId) {
        org.example.clothheaven.Model.User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        List<Orders> orders = orderRepository.findByUserWithItemsOrderByOrderDateDesc(user);

        return orders.stream()
                .map(orderMapper::toOrderResponseDTO)
                .collect(Collectors.toList());
    }

    public OrderResponseDTO getOrderById(Long orderId) {
        Orders order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));

        return orderMapper.toOrderResponseDTO(order);
    }

    public OrderResponseDTO updateOrderStatus(Long orderId, UpdateOrderStatusDTO updateOrderStatusDTO) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));

        order.setStatus(updateOrderStatusDTO.getStatus());
        orderRepository.save(order);

        Orders updatedOrder = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        return orderMapper.toOrderResponseDTO(updatedOrder);
    }
}