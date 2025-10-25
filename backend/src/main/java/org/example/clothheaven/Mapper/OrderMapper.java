package org.example.clothheaven.Mapper;

import org.example.clothheaven.DTO.OrderItemResponseDTO;
import org.example.clothheaven.DTO.OrderResponseDTO;
import org.example.clothheaven.Model.OrderItem;
import org.example.clothheaven.Model.Orders;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    public OrderResponseDTO toOrderResponseDTO(Orders order) {
        if (order == null) {
            return null;
        }

        List<OrderItemResponseDTO> itemDTOs = order.getOrderItems().stream()
                .map(this::toOrderItemResponseDTO)
                .collect(Collectors.toList());

        return new OrderResponseDTO(
                order.getOrderId(),
                order.getUser() != null ? order.getUser().getUserId() : null,
                order.getOrderDate(),
                order.getStatus(),
                order.getOrdersPrice(),
                order.getFirstName(),
                order.getLastName(),
                order.getCountry(),
                order.getPostalCode(),
                order.getPhoneNumber(),
                order.getHomeAddress(),
                order.getEmailAddress(),
                order.getPaymentMethod(),
                order.getPaymentSlipUrl(),
                itemDTOs);
    }

    public OrderItemResponseDTO toOrderItemResponseDTO(OrderItem orderItem) {
        if (orderItem == null) {
            return null;
        }

        return new OrderItemResponseDTO(
                orderItem.getOrderItemId(),
                orderItem.getProduct() != null ? orderItem.getProduct().getProductId() : null,
                orderItem.getOrderItemsQuantity(),
                orderItem.getOrderItemsPrice(),
                orderItem.getColor(),
                orderItem.getSize());
    }
}