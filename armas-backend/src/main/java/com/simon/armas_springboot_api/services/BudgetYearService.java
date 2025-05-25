package com.simon.armas_springboot_api.services;

import com.simon.armas_springboot_api.models.BudgetYear;
import com.simon.armas_springboot_api.repositories.BudgetYearRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BudgetYearService {
    private final BudgetYearRepository budgetYearRepository;

    @Autowired
    public BudgetYearService(BudgetYearRepository budgetYearRepository) {
        this.budgetYearRepository = budgetYearRepository;
    }

    public List<BudgetYear> getAllBudgetYears() {
        return budgetYearRepository.findAll();
    }

    public BudgetYear getBudgetYearById(Long id) {
        Optional<BudgetYear> budgetYear = budgetYearRepository.findById(id);
        return budgetYear.orElseThrow(() -> new IllegalArgumentException("Budget year with ID " + id + " not found"));
    }

    public BudgetYear save(BudgetYear budget) {
        return budgetYearRepository.save(budget);
    }

    public void deleteBudgetYear(Long id) {
        if (!budgetYearRepository.existsById(id)) {
            throw new IllegalArgumentException("Budget year with ID " + id + " not found");
        }
        budgetYearRepository.deleteById(id);
    }
}