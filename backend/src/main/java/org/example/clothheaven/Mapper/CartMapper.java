package org.example.clothheaven.Mapper;

import org.example.clothheaven.DTO.CartItemResponseDTO;
import org.example.clothheaven.DTO.CartResponseDTO;
import org.example.clothheaven.Model.Cart;
import org.example.clothheaven.Model.CartItem;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

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
                cart.getUserId(),
                cart.getCreatedAt(),
                cart.getUpdatedAt(),
                itemDTOs
        );
    }

    public CartItemResponseDTO toCartItemResponseDTO(CartItem cartItem) {
        if (cartItem == null) {
            return null;
        }

        return new CartItemResponseDTO(
                cartItem.getCartItemId(),
                cartItem.getProductId(),
                cartItem.getCartItemsQuantity()
        );
    }
}