package com.simon.armas_springboot_api.controllers;

import com.simon.armas_springboot_api.models.BudgetYear;
import com.simon.armas_springboot_api.services.BudgetYearService;
import com.simon.armas_springboot_api.dto.BudgetYearDTO;
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

    @GetMapping("/")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SENIOR_AUDITOR', 'APPROVER', 'ARCHIVER')")
    public ResponseEntity<List<BudgetYearDTO>> getBudgetYears() {
        System.out.println("Received GET request for /budgetyears/");
        List<BudgetYearDTO> budgetYears = budgetYearService.getAllBudgetYears();
        return ResponseEntity.ok(budgetYears);
    }

    @PostMapping("/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BudgetYearDTO> createBudgetYear(@RequestBody BudgetYearDTO budgetYearDTO) {
        System.out.println("Received POST request for /budgetyears/ with payload: " + budgetYearDTO);
        BudgetYearDTO saved = budgetYearService.save(budgetYearDTO);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SENIOR_AUDITOR', 'APPROVER', 'ARCHIVER')")
    public ResponseEntity<BudgetYearDTO> getBudgetYearById(@PathVariable Long id) {
        System.out.println("Received GET request for /budgetyears/" + id);
        BudgetYearDTO budgetYear = budgetYearService.getBudgetYearById(id);
        return ResponseEntity.ok(budgetYear);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BudgetYearDTO> updateBudgetYear(@PathVariable Long id, @RequestBody BudgetYearDTO budgetYearDTO) {
        System.out.println("Received PUT request for /budgetyears/" + id + " with payload: " + budgetYearDTO);
        BudgetYearDTO existing = budgetYearService.getBudgetYearById(id);
        existing.setFiscalYear(budgetYearDTO.getFiscalYear());
        BudgetYearDTO updatedBudgetYear = budgetYearService.save(existing);
        return ResponseEntity.ok(updatedBudgetYear);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBudgetYear(@PathVariable Long id) {
        System.out.println("Received DELETE request for /budgetyears/" + id);
        budgetYearService.deleteBudgetYear(id);
        return ResponseEntity.noContent().build();
    }
}