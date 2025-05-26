package com.simon.armas_springboot_api.controllers;

import com.simon.armas_springboot_api.models.BudgetYear;
import com.simon.armas_springboot_api.services.BudgetYearService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/budgetyears")
@CrossOrigin(
    origins = {"http://localhost:3000", "http://localhost:3001"},
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowedHeaders = {"Authorization", "Content-Type", "*"},
    allowCredentials = "true"
)
public class BudgetYearController {

    private final BudgetYearService budgetYearService;

    @Autowired
    public BudgetYearController(BudgetYearService budgetYearService) {
        this.budgetYearService = budgetYearService;
    }

    @GetMapping
    public ResponseEntity<List<BudgetYear>> getAllBudgetYears() {
        List<BudgetYear> budgetYears = budgetYearService.getAllBudgetYears();
        return ResponseEntity.ok(budgetYears);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SENIOR_AUDITOR', 'APPROVER', 'ARCHIVER')")
    public ResponseEntity<BudgetYear> getBudgetYearById(@PathVariable Long id) {
        BudgetYear budgetYear = budgetYearService.getBudgetYearById(id);
        return ResponseEntity.ok(budgetYear);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<BudgetYear> createBudgetYear(@RequestBody BudgetYear budgetYear) {
        BudgetYear savedBudgetYear = budgetYearService.save(budgetYear);
        return ResponseEntity.ok(savedBudgetYear);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<BudgetYear> updateBudgetYear(@PathVariable Long id, @RequestBody BudgetYear budgetYear) {
        BudgetYear existing = budgetYearService.getBudgetYearById(id);
        existing.setFiscalYear(budgetYear.getFiscalYear()); // Fixed: Use setFiscalYear and getFiscalYear
        BudgetYear updatedBudgetYear = budgetYearService.save(existing);
        return ResponseEntity.ok(updatedBudgetYear);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteBudgetYear(@PathVariable Long id) {
        budgetYearService.deleteBudgetYear(id);
        return ResponseEntity.noContent().build();
    }
}