package com.simon.armas_springboot_api.repositories;

import com.simon.armas_springboot_api.models.BudgetYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BudgetYearRepository extends JpaRepository<BudgetYear, Long> {
    Optional<BudgetYear> findByFiscalYear(String fiscalYear);
}
