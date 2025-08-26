package org.example.clothheaven.Repository;

import org.example.clothheaven.Model.SalesReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalesReportRepository extends JpaRepository<SalesReport,Long> {
}
