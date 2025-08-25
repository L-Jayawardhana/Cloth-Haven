package org.example.clothheaven.Repository;

import org.example.clothheaven.Model.Staff;
import org.example.clothheaven.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {

    boolean existsByUser(User user);

}
