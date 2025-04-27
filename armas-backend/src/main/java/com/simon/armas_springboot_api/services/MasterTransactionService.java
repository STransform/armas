package com.simon.armas_springboot_api.services;

import com.simon.armas_springboot_api.dto.SentReportResponseDTO;
import com.simon.armas_springboot_api.models.Document;
import com.simon.armas_springboot_api.models.MasterTransaction;
import com.simon.armas_springboot_api.models.User;
import com.simon.armas_springboot_api.repositories.DocumentRepository;
import com.simon.armas_springboot_api.repositories.MasterTransactionRepository;
import com.simon.armas_springboot_api.repositories.OrganizationRepository;
import com.simon.armas_springboot_api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import com.simon.armas_springboot_api.services.FileStorageService;
import org.springframework.dao.DataIntegrityViolationException;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.List;
import java.util.Optional;
//import organization

import com.simon.armas_springboot_api.models.Organization;

@Service
public class MasterTransactionService {
    @Autowired
    private MasterTransactionRepository masterTransactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private DocumentRepository documentRepository;

    public MasterTransaction uploadFile(MultipartFile file, String reportstatus, String fiscal_year,
    String transactiondocumentid, Principal principal) throws IOException {
    String username = principal.getName();
    User user = userRepository.findByUsername(username);
    if (user == null) {
    throw new IllegalArgumentException("User not found: " + username);
    }

    String docname = file.getOriginalFilename();
    if (docname == null || docname.isEmpty()) {
    throw new IllegalArgumentException("File name cannot be empty");
    }
    if (masterTransactionRepository.existsByDocnameAndUser(docname, user)) {
    throw new IllegalArgumentException("Document already exists for this user: " + docname);
    }

    Document document = documentRepository.findById(transactiondocumentid)
    .orElseThrow(() -> new IllegalArgumentException("Document not found: " + transactiondocumentid));

    MasterTransaction transaction = new MasterTransaction();
    transaction.setUser(user);
    Organization organization = user.getOrganization();
    if (organization == null || organization.getId() == null) {
    throw new IllegalArgumentException("User has no associated organization or organization ID is null");
    }
    transaction.setOrganization(organization);
    transaction.setDocname(docname);
    transaction.setReportstatus(reportstatus);
    transaction.setFiscal_year(fiscal_year);
    transaction.setReportcategory(document.getReportype());
    transaction.setTransactiondocument(document);

    String filePath = fileStorageService.storeFile(file, transaction, principal);
    if (filePath == null || filePath.isEmpty()) {
    throw new IllegalArgumentException("File storage failed: Invalid file path");
    }
    transaction.setFilepath(filePath);

    try {
    return masterTransactionRepository.save(transaction);
    } catch (DataIntegrityViolationException e) {
    throw new IllegalArgumentException("Database error: Possible duplicate entry or invalid data. Details: " + e.getMostSpecificCause().getMessage(), e);
    } catch (Exception e) {
    throw new IllegalArgumentException("Unexpected error saving transaction: " + e.getMessage(), e);
    }
    }

    public Path getFilePath(Integer id) {
        MasterTransaction transaction = masterTransactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + id));
        return Paths.get(transaction.getFilepath());
    }

    public List<SentReportResponseDTO> getSentReportData() {
        return masterTransactionRepository.fetchDataInnerJoin();
    }
}