// package com.kindsonthegenius.inventoryms_springboot_api.repositories;

// import com.kindsonthegenius.inventoryms_springboot_api.models.Users;

// import java.util.Optional;

// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository;

// @Repository
// public interface UsersRepository extends JpaRepository<Users, Long> {
//     // Users findByUsername(String username);
//     Optional<Users> findByUsername(String username);
//     Users findByVerificationCode(String verificationCode); // Added for verification
// }