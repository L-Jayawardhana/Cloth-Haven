package org.example.clothheaven.Repository;

import org.example.clothheaven.Model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartCartIdAndProduct_ProductId(Long cartId, Long productId);

    void deleteByCartCartIdAndProduct_ProductId(Long cartId, Long productId);
}