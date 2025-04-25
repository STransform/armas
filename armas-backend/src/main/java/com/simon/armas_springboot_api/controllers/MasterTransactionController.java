package com.simon.armas_springboot_api.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.simon.armas_springboot_api.models.MasterTransaction;
import com.simon.armas_springboot_api.services.FileStorageService;
import com.simon.armas_springboot_api.services.MasterTransactionService;

import java.io.IOException;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/master-transactions")
@PreAuthorize("hasAuthority('ADMIN')")
public class MasterTransactionController {

    @Autowired
    private MasterTransactionService masterTransactionService;

    @Autowired
    private FileStorageService fileStorageService;

    // @GetMapping
    // public List<MasterTransaction> getAllMasterTransactions(@RequestParam(required = false) String keyword) {
    //     return masterTransactionService.getMasterTransactions(keyword);
    // }

    @GetMapping("/{id}")
    public ResponseEntity<MasterTransaction> getMasterTransactionById(@PathVariable Integer id) {
        return masterTransactionService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<MasterTransaction> createMasterTransaction(
            @RequestPart("transaction") MasterTransaction transaction,
            @RequestPart("file") MultipartFile file,
            Principal principal) throws IOException {
        // if (masterTransactionService.existsByDocname(file.getOriginalFilename())) {
        //     return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        // }
        transaction.setDocname(file.getOriginalFilename());
        transaction.setFilepath(fileStorageService.storeFile(file, transaction, principal));
        MasterTransaction savedTransaction = masterTransactionService.save(transaction);
        return ResponseEntity.ok(savedTransaction);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MasterTransaction> updateMasterTransaction(
            @PathVariable Integer id,
            @RequestBody MasterTransaction transaction) {
        if (!masterTransactionService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        transaction.setId(id);
        MasterTransaction updatedTransaction = masterTransactionService.save(transaction);
        return ResponseEntity.ok(updatedTransaction);
    }

    // @PutMapping("/{id}/status")
    // public ResponseEntity<Void> updateReportStatus(
    //         @PathVariable Integer id,
    //         @RequestParam String reportstatus) {
    //     if (!masterTransactionService.findById(id).isPresent()) {
    //         return ResponseEntity.notFound().build();
    //     }
    //     masterTransactionService.updateReportStatus(id, reportstatus);
    //     return ResponseEntity.noContent().build();
    // }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMasterTransaction(@PathVariable Integer id) {
        if (!masterTransactionService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        masterTransactionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}