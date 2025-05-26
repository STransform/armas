package com.simon.armas_springboot_api.services;

import com.simon.armas_springboot_api.models.BudgetYear;
import com.simon.armas_springboot_api.repositories.BudgetYearRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BudgetYearService {
   @Autowired
    private BudgetYearRepository budgetYearRepository;

    public List<BudgetYear> getAllBudgetYears() {
        return budgetYearRepository.findAll();
    }

    public BudgetYear getBudgetYearById(Long id) {
        return budgetYearRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Budget Year not found: " + id));
    }

    public BudgetYear save(BudgetYear budgetYear) {
        return budgetYearRepository.save(budgetYear);
    }

    public void deleteBudgetYear(Long id) {
        if (!budgetYearRepository.existsById(id)) {
            throw new IllegalArgumentException("Budget Year not found: " + id);
        }
        budgetYearRepository.deleteById(id);
    }
}