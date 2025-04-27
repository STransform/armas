package com.simon.armas_springboot_api.services;

import com.simon.armas_springboot_api.models.MasterTransaction;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;

@Service
public class FileStorageService {

    public String storeFile(MultipartFile file, MasterTransaction trans, Principal principal) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("No file provided for upload.");
        }

        String docname = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "unnamed_file");
        trans.setDocname(docname);

        // Use principal for directory (avoid relying on createdBy from saved transaction)
        String createdBy = principal.getName();
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

        // Use principal for directory
        String createdBy = principal.getName();
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