// package com.kindsonthegenius.inventoryms_springboot_api.services;


// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.springframework.stereotype.Service;

// import com.kindsonthegenius.inventoryms_springboot_api.models.Users;
// import com.kindsonthegenius.inventoryms_springboot_api.repositories.UserRepository;
// import com.kindsonthegenius.inventoryms_springboot_api.repositories.UsersRepository;

// import java.util.List;
// import java.util.UUID;

// @Service
// public class UsersService {

//     private final UsersRepository userRepository;

//     private final BCryptPasswordEncoder bCryptPasswordEncoder;

//     @Autowired
//     public UsersService(UsersRepository userRepository, BCryptPasswordEncoder bCryptPasswordEncoder) {
//         this.userRepository = userRepository;
//         this.bCryptPasswordEncoder = bCryptPasswordEncoder;
//     }

//     public List<Users> getAllUsers() {
//         return userRepository.findAll();
//     }

//     public Users getUserById(Long id) {
//         return userRepository.findById(id).orElse(null);
//     }

//     public Users save(Users user) {
//         return userRepository.save(user);
//     }

//     public void deleteUser(Long id) {
//         userRepository.deleteById(id);
//     }
//      public Users register(Users user) {
//         user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
//         user.setVerificationCode(UUID.randomUUID().toString());
//         user.setEnabled(false);
//         return userRepository.save(user);
//     }

//     public void verifyUser(String token) {
//         Users user = userRepository.findByVerificationCode(token);
//         if (user != null) {
//             user.setEnabled(true);
//             user.setVerificationCode(null);
//             userRepository.save(user);
//         }
//     }
//     public Users getUserByUsername(String username) {
//         // TODO Auto-generated method stub
//         throw new UnsupportedOperationException("Unimplemented method 'getUserByUsername'");
//     }
// }