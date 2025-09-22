package org.example.clothheaven.Service;

import org.example.clothheaven.DTO.AddToCartDTO;
import org.example.clothheaven.DTO.CartResponseDTO;
import org.example.clothheaven.DTO.UpdateCartItemDTO;
import org.example.clothheaven.Exception.CartItemNotFoundException;
import org.example.clothheaven.Mapper.CartMapper;
import org.example.clothheaven.Model.Cart;
import org.example.clothheaven.Model.CartItem;
import org.example.clothheaven.Repository.CartItemRepository;
import org.example.clothheaven.Repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
@Transactional
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private CartMapper cartMapper;

    public CartResponseDTO addItemToCart(AddToCartDTO addToCartDTO) {
        // Find or create cart for user
        Cart cart = cartRepository.findByUserId(addToCartDTO.getUserId())
                .orElseGet(() -> cartRepository.save(new Cart(addToCartDTO.getUserId())));

        // Check if item already exists in cart
        Optional<CartItem> existingItem = cartItemRepository
                .findByCartCartIdAndProductId(cart.getCartId(), addToCartDTO.getProductId());

        if (existingItem.isPresent()) {
            // Update quantity if item exists
            CartItem item = existingItem.get();
            item.setCartItemsQuantity(item.getCartItemsQuantity() + addToCartDTO.getQuantity());
            cartItemRepository.save(item);
        } else {
            // Create new cart item
            CartItem newItem = new CartItem(cart, addToCartDTO.getProductId(), addToCartDTO.getQuantity());
            cartItemRepository.save(newItem);
        }

        // Return updated cart
        Cart updatedCart = cartRepository.findByUserIdWithItems(addToCartDTO.getUserId())
                .orElseThrow(() -> new CartItemNotFoundException("Cart not found"));

        return cartMapper.toCartResponseDTO(updatedCart);
    }

    public CartResponseDTO getCartByUserId(Long userId) {
        Cart cart = cartRepository.findByUserIdWithItems(userId)
                .orElseThrow(() -> new CartItemNotFoundException("Cart not found for user: " + userId));

        return cartMapper.toCartResponseDTO(cart);
    }

    public CartResponseDTO updateCartItemQuantity(Long cartItemId, UpdateCartItemDTO updateCartItemDTO) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new CartItemNotFoundException("Cart item not found with id: " + cartItemId));

        cartItem.setCartItemsQuantity(updateCartItemDTO.getQuantity());
        cartItemRepository.save(cartItem);

        // Return updated cart
        Cart updatedCart = cartRepository.findByUserIdWithItems(cartItem.getCartId().getUserId())
                .orElseThrow(() -> new CartItemNotFoundException("Cart not found"));

        return cartMapper.toCartResponseDTO(updatedCart);
    }

    public void removeItemFromCart(Long userId, Long productId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new CartItemNotFoundException("Cart not found for user: " + userId));

        cartItemRepository.deleteByCartCartIdAndProductId(cart.getCartId(), productId);
    }

    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new CartItemNotFoundException("Cart not found for user: " + userId));

        cart.getCartItems().clear();
        cartRepository.save(cart);
    }
}