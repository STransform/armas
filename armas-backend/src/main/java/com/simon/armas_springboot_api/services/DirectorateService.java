package com.simon.armas_springboot_api.services;

import com.simon.armas_springboot_api.models.Directorate;
import com.simon.armas_springboot_api.repositories.DirectorateRepository;
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

    public Directorate getDirectorateById(String id) {
        return directorateRepository.findById(id).orElse(null);
    }

    public Directorate getDirectorateByNameIgnoreCase(String directoratename) {
        return directorateRepository.findByDirectoratenameIgnoreCase(directoratename).orElse(null);
    }

    public boolean existsByDirectoratenameIgnoreCase(String directoratename) {
        return directorateRepository.existsByDirectoratenameIgnoreCase(directoratename);
    }

    public Directorate save(Directorate directorate) {
        return directorateRepository.save(directorate);
    }

    public void deleteDirectorate(String id) {
        directorateRepository.deleteById(id);
    }}