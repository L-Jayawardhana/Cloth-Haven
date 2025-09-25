package org.example.clothheaven.Repository;

import java.util.List;
import java.util.Optional;

import org.example.clothheaven.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    List<User> findByRole(String role);

    Optional<User> findByEmail(String email);
}

