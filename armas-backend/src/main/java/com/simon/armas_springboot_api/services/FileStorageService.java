package com.simon.armas_springboot_api.services;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.simon.armas_springboot_api.models.MasterTransaction;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;


@Service
public class FileStorageService {

    @Autowired
    private MasterTransactionService masterTransactionService;

    public String storeFile(MultipartFile file, MasterTransaction trans, Principal principal) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("No file provided for upload.");
        }

        String docname = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "unnamed_file");
        trans.setDocname(docname);

        // Save the transaction to get the createdBy field populated
        MasterTransaction savedTrans = masterTransactionService.save(trans);

        // Define the upload directory based on the user who created the transaction
        String createdBy = savedTrans.getCreatedBy();
        if (createdBy == null) {
            throw new IOException("CreatedBy field is null; cannot determine upload directory.");
        }
        String uploadDir = "C:/AMSReports/" + createdBy;
        Path uploadPath = Paths.get(uploadDir);

        // Create the directory if it doesn’t exist
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Save the file to the specified path
        try (InputStream inputStream = file.getInputStream()) {
            Path filePath = uploadPath.resolve(docname);
            System.out.println("Saving file to: " + filePath.toFile().getAbsolutePath());
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            return filePath.toString(); // Return the full file path
        } catch (IOException ioe) {
            throw new IOException("Could not save file: " + docname, ioe);
        }
    }

    public String storeLetter(MultipartFile file, MasterTransaction trans, Principal principal) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("No file provided for upload.");
        }

        String docname = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "unnamed_letter");
        trans.setDocname(docname);

        // Save the transaction
        MasterTransaction savedTrans = masterTransactionService.save(trans);

        // Define the upload directory
        String createdBy = savedTrans.getCreatedBy();
        if (createdBy == null) {
            throw new IOException("CreatedBy field is null; cannot determine upload directory.");
        }
        String uploadDir = "C:/AMSReports/" + createdBy;
        Path uploadPath = Paths.get(uploadDir);

        // Create the directory if it doesn’t exist
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Save the file
        try (InputStream inputStream = file.getInputStream()) {
            Path filePath = uploadPath.resolve(docname);
            System.out.println("Saving letter to: " + filePath.toFile().getAbsolutePath());
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            return filePath.toString(); // Return the full file path
        } catch (IOException ioe) {
            throw new IOException("Could not save letter: " + docname, ioe);
        }
    }
}