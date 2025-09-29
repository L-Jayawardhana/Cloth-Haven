package org.example.clothheaven.Service;

import java.util.Optional;

import org.example.clothheaven.DTO.AddToCartDTO;
import org.example.clothheaven.DTO.CartResponseDTO;
import org.example.clothheaven.DTO.UpdateCartItemDTO;
import org.example.clothheaven.Exception.CartItemNotFoundException;
import org.example.clothheaven.Mapper.CartMapper;
import org.example.clothheaven.Model.Cart;
import org.example.clothheaven.Model.CartItem;
import org.example.clothheaven.Model.Product;
import org.example.clothheaven.Model.User;
import org.example.clothheaven.Repository.CartItemRepository;
import org.example.clothheaven.Repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CartService {
        @Autowired
        private org.example.clothheaven.Repository.UserRepository userRepository;

        @Autowired
        private org.example.clothheaven.Repository.ProductRepository productRepository;

        @Autowired
        private CartRepository cartRepository;

        @Autowired
        private CartItemRepository cartItemRepository;

        @Autowired
        private CartMapper cartMapper;

        public CartResponseDTO addItemToCart(AddToCartDTO addToCartDTO) {
                // Find or create cart for user
                User user = userRepository.findById(addToCartDTO.getUserId())
                                .orElseThrow(
                                                () -> new CartItemNotFoundException(
                                                                "User not found with id: " + addToCartDTO.getUserId()));
                Cart cart = cartRepository.findByUser_UserId(addToCartDTO.getUserId())
                                .orElseGet(() -> {
                                        Cart newCart = new Cart(user);
                                        return cartRepository.save(newCart);
                                });

                // Check if item already exists in cart
                Product product = productRepository.findById(addToCartDTO.getProductId())
                                .orElseThrow(() -> new CartItemNotFoundException(
                                                "Product not found with id: " + addToCartDTO.getProductId()));
                Optional<CartItem> existingItem = cartItemRepository
                                .findByCartCartIdAndProduct_ProductId(cart.getCartId(), product.getProductId());

                if (existingItem.isPresent()) {
                        // Update quantity if item exists
                        CartItem item = existingItem.get();
                        item.setCartItemsQuantity(item.getCartItemsQuantity() + addToCartDTO.getQuantity());
                        cartItemRepository.save(item);
                } else {
                        // Create new cart item
                        CartItem newItem = new CartItem(cart, product, addToCartDTO.getQuantity());
                        cartItemRepository.save(newItem);
                }

                // Return updated cart
                Cart updatedCart = cartRepository.findByUserIdWithItems(addToCartDTO.getUserId())
                                .orElseThrow(() -> new CartItemNotFoundException("Cart not found"));

                return cartMapper.toCartResponseDTO(updatedCart);
        }

        public CartResponseDTO getCartByUserId(Long userId) {
                Optional<Cart> cartOptional = cartRepository.findByUserIdWithItems(userId);
                
                Cart cart;
                if (cartOptional.isPresent()) {
                        cart = cartOptional.get();
                } else {
                        // Create a new empty cart for the user
                        User user = userRepository.findById(userId)
                                        .orElseThrow(() -> new CartItemNotFoundException("User not found with id: " + userId));
                        
                        cart = new Cart();
                        cart.setUser(user);
                        cart = cartRepository.save(cart);
                }

                return cartMapper.toCartResponseDTO(cart);
        }

        public CartResponseDTO updateCartItemQuantity(Long cartItemId, UpdateCartItemDTO updateCartItemDTO) {
                CartItem cartItem = cartItemRepository.findById(cartItemId)
                                .orElseThrow(() -> new CartItemNotFoundException(
                                                "Cart item not found with id: " + cartItemId));

                cartItem.setCartItemsQuantity(updateCartItemDTO.getQuantity());
                cartItemRepository.save(cartItem);

                // Return updated cart
                Cart updatedCart = cartRepository.findByUserIdWithItems(cartItem.getCart().getUser().getUserId())
                                .orElseThrow(() -> new CartItemNotFoundException("Cart not found"));

                return cartMapper.toCartResponseDTO(updatedCart);
        }

        public void removeItemFromCart(Long userId, Long productId) {
                Cart cart = cartRepository.findByUser_UserId(userId)
                                .orElseThrow(() -> new CartItemNotFoundException("Cart not found for user: " + userId));

                cartItemRepository.deleteByCartCartIdAndProduct_ProductId(cart.getCartId(), productId);
        }

        public void clearCart(Long userId) {
                Cart cart = cartRepository.findByUser_UserId(userId)
                                .orElseThrow(() -> new CartItemNotFoundException("Cart not found for user: " + userId));

                // Delete all cart items for this cart from the database
                for (CartItem item : cart.getCartItems()) {
                        cartItemRepository.delete(item);
                }
                cart.getCartItems().clear();
                cartRepository.save(cart);
        }
}