package com.simon.armas_springboot_api.services;

import com.simon.armas_springboot_api.models.BudgetYear;
import com.simon.armas_springboot_api.repositories.BudgetYearRepository;
import com.simon.armas_springboot_api.dto.BudgetYearDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BudgetYearService {
   @Autowired
    private BudgetYearRepository budgetYearRepository;

    @Autowired
    public BudgetYearService(BudgetYearRepository budgetYearRepository) {
        this.budgetYearRepository = budgetYearRepository;
    }

    public List<BudgetYearDTO> getAllBudgetYears() {
        return budgetYearRepository.findAllBudgetYears();
    }

    public BudgetYearDTO getBudgetYearById(Long id) {
        BudgetYear budgetYear = budgetYearRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Budget Year not found: " + id));
        return new BudgetYearDTO(budgetYear.getId(), budgetYear.getFiscalYear());
    }

    public BudgetYearDTO save(BudgetYearDTO budgetYearDTO) {
        BudgetYear budgetYear = new BudgetYear();
        budgetYear.setFiscalYear(budgetYearDTO.getFiscalYear());
        if (budgetYearDTO.getId() != null) {
            budgetYear.setId(budgetYearDTO.getId());
        }
        BudgetYear saved = budgetYearRepository.save(budgetYear);
        return new BudgetYearDTO(saved.getId(), saved.getFiscalYear());
    }

    public void deleteBudgetYear(Long id) {
        if (!budgetYearRepository.existsById(id)) {
            throw new IllegalArgumentException("Budget Year not found: " + id);
        }
        budgetYearRepository.deleteById(id);
    }
}