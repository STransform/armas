package com.kindsonthegenius.inventoryms_springboot_api.services;

import com.kindsonthegenius.inventoryms_springboot_api.models.Directorate;
import com.kindsonthegenius.inventoryms_springboot_api.repositories.DirectorateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DirectorateService {

    private final DirectorateRepository directorateRepository;

    @Autowired
    public DirectorateService(DirectorateRepository directorateRepository) {
        this.directorateRepository = directorateRepository;
    }

    public List<Directorate> getAllDirectorates() {
        return directorateRepository.findAll();
    }

    public Directorate getDirectorateById(String directoratename) {
        return directorateRepository.findById(directoratename).orElse(null);
    }

    public Directorate save(Directorate directorate) {
        return directorateRepository.save(directorate);
    }

    public void deleteDirectorate(String directoratename) {
        directorateRepository.deleteById(directoratename);
    }
}