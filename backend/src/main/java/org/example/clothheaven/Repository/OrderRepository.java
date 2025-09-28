package org.example.clothheaven.Repository;

import org.example.clothheaven.Model.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Orders, Long> {

    List<Orders> findByUserOrderByOrderDateDesc(org.example.clothheaven.Model.User user);

    @Query("SELECT o FROM Orders o LEFT JOIN FETCH o.orderItems WHERE o.orderId = :orderId")
    Optional<Orders> findByIdWithItems(@Param("orderId") Long orderId);

    @Query("SELECT o FROM Orders o LEFT JOIN FETCH o.orderItems WHERE o.user = :user ORDER BY o.orderDate DESC")
    List<Orders> findByUserWithItemsOrderByOrderDateDesc(@Param("user") org.example.clothheaven.Model.User user);
}
