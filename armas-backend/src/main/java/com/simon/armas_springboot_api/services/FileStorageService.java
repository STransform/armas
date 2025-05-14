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

    public String storeFile(MultipartFile file, MasterTransaction trans, Principal principal, boolean isSupporting) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("No file provided for upload.");
        }

        String docname = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "unnamed_file");
        if (!isSupporting) {
            trans.setDocname(docname); // Set docname only for original report
        } else {
            trans.setSupportingDocname(docname); // Set supportingDocname for audit findings
        }

        String createdBy = principal.getName();
        String uploadDir = "C:/AMSReports/" + createdBy;
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        try (InputStream inputStream = file.getInputStream()) {
            Path filePath = uploadPath.resolve(docname);
            System.out.println("Saving file to: " + filePath.toFile().getAbsolutePath());
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            return filePath.toString();
        } catch (IOException ioe) {
            throw new IOException("Could not save file: " + docname, ioe);
        }
    }

    // storeLetter method remains unchanged or can be removed if unused
}