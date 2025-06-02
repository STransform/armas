package com.simon.armas_springboot_api.repositories;

import com.simon.armas_springboot_api.models.BudgetYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import com.simon.armas_springboot_api.dto.BudgetYearDTO;
import org.springframework.data.jpa.repository.Query;
import java.util.List;


@Repository
public interface BudgetYearRepository extends JpaRepository<BudgetYear, Long> {
    Optional<BudgetYear> findByFiscalYear(String fiscalYear);
    @Query("SELECT new com.simon.armas_springboot_api.dto.BudgetYearDTO(b.id, b.fiscalYear) FROM BudgetYear b")
    List<BudgetYearDTO> findAllBudgetYears();

    boolean existsByFiscalYear(String fiscalYear);
   
}
