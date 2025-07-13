package com.simon.armas_springboot_api.repositories;

import com.simon.armas_springboot_api.models.Directorate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.simon.armas_springboot_api.models.Directorate;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

@Repository
public interface DirectorateRepository extends JpaRepository<Directorate, String> {
     Optional<Directorate> findByDirectoratenameIgnoreCase(String directoratename);
    boolean existsByDirectoratenameIgnoreCase(String directoratename);
}