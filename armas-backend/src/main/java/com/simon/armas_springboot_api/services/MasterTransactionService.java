package com.simon.armas_springboot_api.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

import com.simon.armas_springboot_api.models.MasterTransaction;
import com.simon.armas_springboot_api.repositories.MasterTransactionRepository;

// import java.util.List;
import java.util.Optional;

@Service
public class MasterTransactionService {

    @Autowired
    private MasterTransactionRepository masterTransactionRepository;

    // public List<MasterTransaction> getMasterTransactions(String keyword) {
    //     if (keyword != null && !keyword.isEmpty()) {
    //         return masterTransactionRepository.findByDirectorate(keyword);
    //     }
    //     return masterTransactionRepository.findAll();
    // }

    public Optional<MasterTransaction> findById(Integer id) {
        return masterTransactionRepository.findById(id);
    }

    public MasterTransaction save(MasterTransaction trans) {
        return masterTransactionRepository.save(trans);
    }

    public void delete(Integer id) {
        masterTransactionRepository.deleteById(id);
    }

    // @Transactional
    // public void updateReportStatus(Integer id, String reportstatus) {
    //     masterTransactionRepository.updateReportStatus(id, reportstatus);
    // }

    // public List<MasterTransaction> getOrgTransactions(String theOrg_id) {
    //     return masterTransactionRepository.findAllTransactionByOrg(theOrg_id);
    // }

    // public boolean existsByDocname(String docname) {
    //     return masterTransactionRepository.existsByDocname(docname);
    // }
}