package org.example.clothheaven.Mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.example.clothheaven.DTO.CartItemResponseDTO;
import org.example.clothheaven.DTO.CartResponseDTO;
import org.example.clothheaven.Model.Cart;
import org.example.clothheaven.Model.CartItem;
import org.springframework.stereotype.Component;

@Component
public class CartMapper {

    public CartResponseDTO toCartResponseDTO(Cart cart) {
        if (cart == null) {
            return null;
        }

        List<CartItemResponseDTO> itemDTOs = cart.getCartItems().stream()
                .map(this::toCartItemResponseDTO)
                .collect(Collectors.toList());

        return new CartResponseDTO(
                cart.getCartId(),
                cart.getUser() != null ? cart.getUser().getUserId() : null,
                cart.getCreatedAt(),
                cart.getUpdatedAt(),
                itemDTOs);
    }

    public CartItemResponseDTO toCartItemResponseDTO(CartItem cartItem) {
        if (cartItem == null) {
            return null;
        }

        return new CartItemResponseDTO(
                cartItem.getCartItemId(),
                cartItem.getProduct() != null ? cartItem.getProduct().getProductId() : null,
                cartItem.getProduct() != null ? cartItem.getProduct().getName() : null,
                cartItem.getProduct() != null ? cartItem.getProduct().getProductPrice() : null,
                cartItem.getCartItemsQuantity());
    }
}